/**
 * DataPersistenceService - Sprint 5.21
 *
 * Avancerad data-persistering för RehabFlow med:
 * - IndexedDB-abstraktionslager
 * - Transaktionsstöd med rollback
 * - Query builder
 * - Migrations
 * - Data encryption
 * - Sync mellan lagringslösningar
 * - Automatisk backup
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DatabaseConfig {
  name: string;
  version: number;
  stores: StoreSchema[];
}

export interface StoreSchema {
  name: string;
  keyPath: string;
  autoIncrement?: boolean;
  indexes?: IndexSchema[];
}

export interface IndexSchema {
  name: string;
  keyPath: string | string[];
  unique?: boolean;
  multiEntry?: boolean;
}

export interface Migration {
  version: number;
  up: (db: IDBDatabase, transaction: IDBTransaction) => void;
  down?: (db: IDBDatabase, transaction: IDBTransaction) => void;
}

export interface QueryOptions<T> {
  where?: WhereClause<T>[];
  orderBy?: { field: keyof T; direction: 'asc' | 'desc' };
  limit?: number;
  offset?: number;
  index?: string;
}

export interface WhereClause<T> {
  field: keyof T;
  operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'between' | 'like';
  value: unknown;
  upperBound?: unknown; // För 'between'
}

export interface Transaction {
  id: string;
  stores: string[];
  mode: IDBTransactionMode;
  operations: TransactionOperation[];
  status: 'pending' | 'committed' | 'rolled_back' | 'failed';
  timestamp: number;
}

export interface TransactionOperation {
  type: 'add' | 'put' | 'delete' | 'clear';
  store: string;
  data?: unknown;
  key?: IDBValidKey;
  previousData?: unknown;
}

export interface BackupConfig {
  enabled: boolean;
  interval: number; // millisekunder
  maxBackups: number;
  stores?: string[];
  compress?: boolean;
}

export interface BackupEntry {
  id: string;
  timestamp: number;
  version: number;
  stores: Record<string, unknown[]>;
  size: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  key: string;
  algorithm?: string;
}

export interface SyncConfig {
  enabled: boolean;
  endpoint?: string;
  interval?: number;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge';
}

export interface DataChangeEvent {
  store: string;
  type: 'add' | 'put' | 'delete' | 'clear';
  key?: IDBValidKey;
  data?: unknown;
  timestamp: number;
}

// ============================================================================
// DATA PERSISTENCE SERVICE
// ============================================================================

class DataPersistenceService {
  private static instance: DataPersistenceService;

  private db: IDBDatabase | null = null;
  private config: DatabaseConfig | null = null;
  private migrations: Migration[] = [];
  private transactions: Map<string, Transaction> = new Map();
  private changeListeners: Set<(event: DataChangeEvent) => void> = new Set();
  private backupConfig: BackupConfig | null = null;
  private backupInterval: ReturnType<typeof setInterval> | null = null;
  private encryptionConfig: EncryptionConfig | null = null;
  private syncConfig: SyncConfig | null = null;
  private pendingSync: DataChangeEvent[] = [];

  private constructor() {}

  public static getInstance(): DataPersistenceService {
    if (!DataPersistenceService.instance) {
      DataPersistenceService.instance = new DataPersistenceService();
    }
    return DataPersistenceService.instance;
  }

  // ============================================================================
  // DATABASE INITIALIZATION
  // ============================================================================

  /**
   * Initiera databas
   */
  public async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(config.name, config.version);

      request.onerror = () => {
        reject(new Error(`Kunde inte öppna databas: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log(`Databas ${config.name} v${config.version} öppnad`);
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const transaction = request.transaction!;
        const oldVersion = event.oldVersion;

        // Skapa nya object stores
        config.stores.forEach(storeSchema => {
          if (!db.objectStoreNames.contains(storeSchema.name)) {
            const store = db.createObjectStore(storeSchema.name, {
              keyPath: storeSchema.keyPath,
              autoIncrement: storeSchema.autoIncrement
            });

            // Skapa index
            storeSchema.indexes?.forEach(indexSchema => {
              store.createIndex(indexSchema.name, indexSchema.keyPath, {
                unique: indexSchema.unique,
                multiEntry: indexSchema.multiEntry
              });
            });
          }
        });

        // Kör migrations
        this.runMigrations(db, transaction, oldVersion, config.version);
      };
    });
  }

  /**
   * Stäng databas
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  /**
   * Radera databas
   */
  public async deleteDatabase(): Promise<void> {
    this.close();

    if (!this.config) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.config!.name);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // ============================================================================
  // MIGRATIONS
  // ============================================================================

  /**
   * Registrera migration
   */
  public registerMigration(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  private runMigrations(
    db: IDBDatabase,
    transaction: IDBTransaction,
    fromVersion: number,
    toVersion: number
  ): void {
    const migrationsToRun = this.migrations.filter(
      m => m.version > fromVersion && m.version <= toVersion
    );

    migrationsToRun.forEach(migration => {
      console.log(`Kör migration till version ${migration.version}`);
      migration.up(db, transaction);
    });
  }

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Lägg till data
   */
  public async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    this.ensureConnection();

    const processedData = await this.processDataForStorage(data);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(processedData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.notifyChange({
          store: storeName,
          type: 'add',
          key: request.result,
          data: processedData,
          timestamp: Date.now()
        });
        resolve(request.result);
      };
    });
  }

  /**
   * Lägg till flera
   */
  public async addMany<T>(storeName: string, items: T[]): Promise<IDBValidKey[]> {
    this.ensureConnection();

    const processedItems = await Promise.all(
      items.map(item => this.processDataForStorage(item))
    );

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const keys: IDBValidKey[] = [];

      let index = 0;

      const addNext = () => {
        if (index >= processedItems.length) {
          resolve(keys);
          return;
        }

        const request = store.add(processedItems[index]);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          keys.push(request.result);
          this.notifyChange({
            store: storeName,
            type: 'add',
            key: request.result,
            data: processedItems[index],
            timestamp: Date.now()
          });
          index++;
          addNext();
        };
      };

      addNext();
    });
  }

  /**
   * Uppdatera data
   */
  public async put<T>(storeName: string, data: T): Promise<IDBValidKey> {
    this.ensureConnection();

    const processedData = await this.processDataForStorage(data);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(processedData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.notifyChange({
          store: storeName,
          type: 'put',
          key: request.result,
          data: processedData,
          timestamp: Date.now()
        });
        resolve(request.result);
      };
    });
  }

  /**
   * Hämta data
   */
  public async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const result = await this.processDataFromStorage<T>(request.result);
        resolve(result);
      };
    });
  }

  /**
   * Hämta alla
   */
  public async getAll<T>(storeName: string): Promise<T[]> {
    this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const results = await Promise.all(
          request.result.map(item => this.processDataFromStorage<T>(item))
        );
        resolve(results.filter((r): r is T => r !== undefined));
      };
    });
  }

  /**
   * Ta bort data
   */
  public async delete(storeName: string, key: IDBValidKey): Promise<void> {
    this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.notifyChange({
          store: storeName,
          type: 'delete',
          key,
          timestamp: Date.now()
        });
        resolve();
      };
    });
  }

  /**
   * Rensa store
   */
  public async clear(storeName: string): Promise<void> {
    this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.notifyChange({
          store: storeName,
          type: 'clear',
          timestamp: Date.now()
        });
        resolve();
      };
    });
  }

  /**
   * Räkna antal
   */
  public async count(storeName: string): Promise<number> {
    this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  // ============================================================================
  // QUERY BUILDER
  // ============================================================================

  /**
   * Skapa query
   */
  public query<T>(storeName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(this, storeName);
  }

  /**
   * Kör query internt
   */
  public async executeQuery<T>(
    storeName: string,
    options: QueryOptions<T>
  ): Promise<T[]> {
    this.ensureConnection();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      // Använd index om specificerat
      const source = options.index
        ? store.index(options.index)
        : store;

      const request = source.openCursor();
      const results: T[] = [];
      let skipped = 0;

      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const cursor = request.result;

        if (!cursor) {
          // Sortera om orderBy specificerat
          if (options.orderBy) {
            results.sort((a, b) => {
              const aVal = a[options.orderBy!.field];
              const bVal = b[options.orderBy!.field];

              if (aVal < bVal) return options.orderBy!.direction === 'asc' ? -1 : 1;
              if (aVal > bVal) return options.orderBy!.direction === 'asc' ? 1 : -1;
              return 0;
            });
          }

          resolve(results);
          return;
        }

        const value = await this.processDataFromStorage<T>(cursor.value);

        if (value && this.matchesWhere(value, options.where)) {
          // Hantera offset
          if (options.offset && skipped < options.offset) {
            skipped++;
          } else {
            results.push(value);
          }

          // Hantera limit
          if (options.limit && results.length >= options.limit) {
            resolve(results);
            return;
          }
        }

        cursor.continue();
      };
    });
  }

  private matchesWhere<T>(item: T, clauses?: WhereClause<T>[]): boolean {
    if (!clauses || clauses.length === 0) return true;

    return clauses.every(clause => {
      const value = item[clause.field];

      switch (clause.operator) {
        case '=':
          return value === clause.value;
        case '!=':
          return value !== clause.value;
        case '>':
          return value > (clause.value as number | string);
        case '>=':
          return value >= (clause.value as number | string);
        case '<':
          return value < (clause.value as number | string);
        case '<=':
          return value <= (clause.value as number | string);
        case 'in':
          return (clause.value as unknown[]).includes(value);
        case 'between':
          return (
            value >= (clause.value as number | string) &&
            value <= (clause.upperBound as number | string)
          );
        case 'like':
          const pattern = (clause.value as string)
            .replace(/%/g, '.*')
            .replace(/_/g, '.');
          return new RegExp(`^${pattern}$`, 'i').test(String(value));
        default:
          return true;
      }
    });
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  /**
   * Börja transaktion
   */
  public beginTransaction(stores: string[], mode: IDBTransactionMode = 'readwrite'): string {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const transaction: Transaction = {
      id,
      stores,
      mode,
      operations: [],
      status: 'pending',
      timestamp: Date.now()
    };

    this.transactions.set(id, transaction);
    return id;
  }

  /**
   * Lägg till operation i transaktion
   */
  public async addToTransaction<T>(
    transactionId: string,
    operation: Omit<TransactionOperation, 'previousData'>
  ): Promise<void> {
    const tx = this.transactions.get(transactionId);
    if (!tx || tx.status !== 'pending') {
      throw new Error('Ogiltig eller avslutad transaktion');
    }

    // Spara tidigare data för rollback
    let previousData: unknown;
    if (operation.type === 'put' || operation.type === 'delete') {
      if (operation.key) {
        previousData = await this.get(operation.store, operation.key);
      }
    }

    tx.operations.push({
      ...operation,
      previousData
    });
  }

  /**
   * Commita transaktion
   */
  public async commitTransaction(transactionId: string): Promise<void> {
    const tx = this.transactions.get(transactionId);
    if (!tx || tx.status !== 'pending') {
      throw new Error('Ogiltig eller avslutad transaktion');
    }

    this.ensureConnection();

    return new Promise((resolve, reject) => {
      const idbTransaction = this.db!.transaction(tx.stores, tx.mode);

      idbTransaction.onerror = () => {
        tx.status = 'failed';
        reject(idbTransaction.error);
      };

      idbTransaction.oncomplete = () => {
        tx.status = 'committed';
        resolve();
      };

      // Utför alla operationer
      tx.operations.forEach(op => {
        const store = idbTransaction.objectStore(op.store);

        switch (op.type) {
          case 'add':
            store.add(op.data);
            break;
          case 'put':
            store.put(op.data);
            break;
          case 'delete':
            if (op.key) store.delete(op.key);
            break;
          case 'clear':
            store.clear();
            break;
        }
      });
    });
  }

  /**
   * Rulla tillbaka transaktion
   */
  public async rollbackTransaction(transactionId: string): Promise<void> {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      throw new Error('Transaktion hittades inte');
    }

    if (tx.status === 'committed') {
      // Återställ data
      for (const op of tx.operations.reverse()) {
        switch (op.type) {
          case 'add':
            if (op.key) await this.delete(op.store, op.key);
            break;
          case 'put':
            if (op.previousData) {
              await this.put(op.store, op.previousData);
            } else if (op.key) {
              await this.delete(op.store, op.key);
            }
            break;
          case 'delete':
            if (op.previousData) {
              await this.add(op.store, op.previousData);
            }
            break;
        }
      }
    }

    tx.status = 'rolled_back';
  }

  // ============================================================================
  // ENCRYPTION
  // ============================================================================

  /**
   * Konfigurera kryptering
   */
  public configureEncryption(config: EncryptionConfig): void {
    this.encryptionConfig = config;
  }

  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionConfig?.enabled) return data;

    // Enkel XOR-kryptering för demonstration
    // I produktion: använd Web Crypto API
    const key = this.encryptionConfig.key;
    let result = '';

    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }

    return btoa(result);
  }

  private async decrypt(data: string): Promise<string> {
    if (!this.encryptionConfig?.enabled) return data;

    const decoded = atob(data);
    const key = this.encryptionConfig.key;
    let result = '';

    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }

    return result;
  }

  private async processDataForStorage<T>(data: T): Promise<T> {
    if (!this.encryptionConfig?.enabled) return data;

    const json = JSON.stringify(data);
    const encrypted = await this.encrypt(json);

    return { __encrypted: true, data: encrypted } as unknown as T;
  }

  private async processDataFromStorage<T>(data: unknown): Promise<T | undefined> {
    if (!data) return undefined;

    if (
      this.encryptionConfig?.enabled &&
      typeof data === 'object' &&
      (data as { __encrypted?: boolean }).__encrypted
    ) {
      const decrypted = await this.decrypt((data as { data: string }).data);
      return JSON.parse(decrypted) as T;
    }

    return data as T;
  }

  // ============================================================================
  // BACKUP
  // ============================================================================

  /**
   * Konfigurera automatisk backup
   */
  public configureBackup(config: BackupConfig): void {
    this.backupConfig = config;

    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    if (config.enabled) {
      this.backupInterval = setInterval(() => {
        this.createBackup();
      }, config.interval);
    }
  }

  /**
   * Skapa manuell backup
   */
  public async createBackup(): Promise<BackupEntry> {
    this.ensureConnection();

    const stores: Record<string, unknown[]> = {};
    const storeNames = this.backupConfig?.stores ?? Array.from(this.db!.objectStoreNames);

    for (const storeName of storeNames) {
      stores[storeName] = await this.getAll(storeName);
    }

    const backup: BackupEntry = {
      id: `backup_${Date.now()}`,
      timestamp: Date.now(),
      version: this.config?.version ?? 1,
      stores,
      size: JSON.stringify(stores).length
    };

    // Spara backup i localStorage (eller annan lagring)
    this.saveBackup(backup);

    return backup;
  }

  /**
   * Återställ från backup
   */
  public async restoreBackup(backupId: string): Promise<void> {
    const backup = this.loadBackup(backupId);
    if (!backup) {
      throw new Error('Backup hittades inte');
    }

    this.ensureConnection();

    for (const [storeName, data] of Object.entries(backup.stores)) {
      await this.clear(storeName);

      for (const item of data) {
        await this.add(storeName, item);
      }
    }
  }

  /**
   * Lista tillgängliga backups
   */
  public listBackups(): BackupEntry[] {
    const backups: BackupEntry[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('rehabflow_backup_')) {
        try {
          const backup = JSON.parse(localStorage.getItem(key)!) as BackupEntry;
          backups.push(backup);
        } catch {
          // Ignorera ogiltiga backups
        }
      }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Ta bort backup
   */
  public deleteBackup(backupId: string): void {
    localStorage.removeItem(`rehabflow_backup_${backupId}`);
  }

  private saveBackup(backup: BackupEntry): void {
    // Ta bort gamla backups om vi överskrider max
    if (this.backupConfig?.maxBackups) {
      const backups = this.listBackups();
      if (backups.length >= this.backupConfig.maxBackups) {
        const toDelete = backups.slice(this.backupConfig.maxBackups - 1);
        toDelete.forEach(b => this.deleteBackup(b.id));
      }
    }

    localStorage.setItem(
      `rehabflow_backup_${backup.id}`,
      JSON.stringify(backup)
    );
  }

  private loadBackup(backupId: string): BackupEntry | null {
    const data = localStorage.getItem(`rehabflow_backup_${backupId}`);
    if (!data) return null;

    try {
      return JSON.parse(data) as BackupEntry;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // SYNC
  // ============================================================================

  /**
   * Konfigurera synkronisering
   */
  public configureSync(config: SyncConfig): void {
    this.syncConfig = config;
  }

  /**
   * Synka med server
   */
  public async sync(): Promise<void> {
    if (!this.syncConfig?.enabled || !this.syncConfig.endpoint) return;

    const changes = [...this.pendingSync];
    this.pendingSync = [];

    try {
      const response = await fetch(this.syncConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changes,
          lastSync: this.getLastSyncTime()
        })
      });

      if (!response.ok) {
        // Lägg tillbaka ändringar vid fel
        this.pendingSync.push(...changes);
        throw new Error('Synkronisering misslyckades');
      }

      const serverChanges = await response.json();
      await this.applyServerChanges(serverChanges);

      this.setLastSyncTime(Date.now());
    } catch (error) {
      console.error('Sync fel:', error);
      throw error;
    }
  }

  private async applyServerChanges(changes: DataChangeEvent[]): Promise<void> {
    for (const change of changes) {
      switch (change.type) {
        case 'add':
        case 'put':
          if (change.data) {
            await this.put(change.store, change.data);
          }
          break;
        case 'delete':
          if (change.key) {
            await this.delete(change.store, change.key);
          }
          break;
        case 'clear':
          await this.clear(change.store);
          break;
      }
    }
  }

  private getLastSyncTime(): number {
    const stored = localStorage.getItem('rehabflow_last_sync');
    return stored ? parseInt(stored, 10) : 0;
  }

  private setLastSyncTime(time: number): void {
    localStorage.setItem('rehabflow_last_sync', time.toString());
  }

  // ============================================================================
  // CHANGE NOTIFICATIONS
  // ============================================================================

  /**
   * Lyssna på dataändringar
   */
  public onChange(listener: (event: DataChangeEvent) => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  private notifyChange(event: DataChangeEvent): void {
    this.changeListeners.forEach(listener => listener(event));

    // Lägg till för sync
    if (this.syncConfig?.enabled) {
      this.pendingSync.push(event);
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private ensureConnection(): void {
    if (!this.db) {
      throw new Error('Databas är inte initierad');
    }
  }

  /**
   * Exportera all data
   */
  public async exportData(): Promise<Record<string, unknown[]>> {
    this.ensureConnection();

    const result: Record<string, unknown[]> = {};
    const storeNames = Array.from(this.db!.objectStoreNames);

    for (const name of storeNames) {
      result[name] = await this.getAll(name);
    }

    return result;
  }

  /**
   * Importera data
   */
  public async importData(data: Record<string, unknown[]>, clear = true): Promise<void> {
    this.ensureConnection();

    for (const [storeName, items] of Object.entries(data)) {
      if (!this.db!.objectStoreNames.contains(storeName)) {
        console.warn(`Store ${storeName} finns inte`);
        continue;
      }

      if (clear) {
        await this.clear(storeName);
      }

      await this.addMany(storeName, items);
    }
  }

  /**
   * Hämta databas-statistik
   */
  public async getStats(): Promise<{
    stores: { name: string; count: number }[];
    totalCount: number;
  }> {
    this.ensureConnection();

    const stores: { name: string; count: number }[] = [];
    let totalCount = 0;

    const storeNames = Array.from(this.db!.objectStoreNames);

    for (const name of storeNames) {
      const count = await this.count(name);
      stores.push({ name, count });
      totalCount += count;
    }

    return { stores, totalCount };
  }
}

// ============================================================================
// QUERY BUILDER
// ============================================================================

class QueryBuilder<T> {
  private service: DataPersistenceService;
  private storeName: string;
  private options: QueryOptions<T> = {};

  constructor(service: DataPersistenceService, storeName: string) {
    this.service = service;
    this.storeName = storeName;
  }

  /**
   * Lägg till where-villkor
   */
  public where(
    field: keyof T,
    operator: WhereClause<T>['operator'],
    value: unknown,
    upperBound?: unknown
  ): QueryBuilder<T> {
    if (!this.options.where) {
      this.options.where = [];
    }

    this.options.where.push({ field, operator, value, upperBound });
    return this;
  }

  /**
   * Sortera resultat
   */
  public orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): QueryBuilder<T> {
    this.options.orderBy = { field, direction };
    return this;
  }

  /**
   * Begränsa antal resultat
   */
  public limit(count: number): QueryBuilder<T> {
    this.options.limit = count;
    return this;
  }

  /**
   * Hoppa över resultat
   */
  public offset(count: number): QueryBuilder<T> {
    this.options.offset = count;
    return this;
  }

  /**
   * Använd specifikt index
   */
  public useIndex(indexName: string): QueryBuilder<T> {
    this.options.index = indexName;
    return this;
  }

  /**
   * Kör query
   */
  public async execute(): Promise<T[]> {
    return this.service.executeQuery<T>(this.storeName, this.options);
  }

  /**
   * Hämta första resultatet
   */
  public async first(): Promise<T | undefined> {
    const results = await this.limit(1).execute();
    return results[0];
  }

  /**
   * Räkna matchande
   */
  public async count(): Promise<number> {
    const results = await this.execute();
    return results.length;
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook för databas
 */
export function useDatabase(config: DatabaseConfig) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const service = DataPersistenceService.getInstance();

  useEffect(() => {
    service.initialize(config)
      .then(() => setIsReady(true))
      .catch(setError);

    return () => service.close();
  }, [config.name, config.version]);

  return { isReady, error, service };
}

/**
 * Hook för CRUD-operationer
 */
export function useStore<T>(storeName: string) {
  const service = DataPersistenceService.getInstance();

  const add = useCallback(async (data: T) => {
    return service.add(storeName, data);
  }, [storeName]);

  const put = useCallback(async (data: T) => {
    return service.put(storeName, data);
  }, [storeName]);

  const get = useCallback(async (key: IDBValidKey) => {
    return service.get<T>(storeName, key);
  }, [storeName]);

  const getAll = useCallback(async () => {
    return service.getAll<T>(storeName);
  }, [storeName]);

  const remove = useCallback(async (key: IDBValidKey) => {
    return service.delete(storeName, key);
  }, [storeName]);

  const clear = useCallback(async () => {
    return service.clear(storeName);
  }, [storeName]);

  const query = useCallback(() => {
    return service.query<T>(storeName);
  }, [storeName]);

  return { add, put, get, getAll, remove, clear, query };
}

/**
 * Hook för live data
 */
export function useLiveQuery<T>(
  storeName: string,
  queryFn: (q: QueryBuilder<T>) => QueryBuilder<T>
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const service = DataPersistenceService.getInstance();

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const query = queryFn(service.query<T>(storeName));
      const results = await query.execute();
      setData(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Query failed'));
    } finally {
      setLoading(false);
    }
  }, [storeName, queryFn]);

  useEffect(() => {
    refresh();

    // Lyssna på ändringar
    const unsubscribe = service.onChange((event) => {
      if (event.store === storeName) {
        refresh();
      }
    });

    return unsubscribe;
  }, [storeName, refresh]);

  return { data, loading, error, refresh };
}

/**
 * Hook för backup
 */
export function useBackup() {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const service = DataPersistenceService.getInstance();

  const refresh = useCallback(() => {
    setBackups(service.listBackups());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(async () => {
    const backup = await service.createBackup();
    refresh();
    return backup;
  }, [refresh]);

  const restore = useCallback(async (backupId: string) => {
    await service.restoreBackup(backupId);
  }, []);

  const remove = useCallback((backupId: string) => {
    service.deleteBackup(backupId);
    refresh();
  }, [refresh]);

  return { backups, create, restore, remove, refresh };
}

/**
 * Hook för sync status
 */
export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const service = DataPersistenceService.getInstance();

  useEffect(() => {
    const stored = localStorage.getItem('rehabflow_last_sync');
    if (stored) {
      setLastSync(new Date(parseInt(stored, 10)));
    }
  }, []);

  const sync = useCallback(async () => {
    try {
      setIsSyncing(true);
      setError(null);
      await service.sync();
      setLastSync(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sync failed'));
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isSyncing, lastSync, error, sync };
}

// ============================================================================
// EXPORT
// ============================================================================

export const dataPersistenceService = DataPersistenceService.getInstance();
export default dataPersistenceService;
