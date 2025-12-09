/**
 * StateManagementService - Sprint 5.21
 *
 * Avancerad state management för RehabFlow med:
 * - Flux-liknande arkitektur
 * - Immutable state updates
 * - Selectors med memoization
 * - Middleware-stöd
 * - Time-travel debugging
 * - State persistence
 * - Computed properties
 * - Action history
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ActionType = string;
export type Reducer<S, A> = (state: S, action: A) => S;
export type Middleware<S> = (store: Store<S>) => (next: Dispatch) => (action: Action) => unknown;
export type Dispatch = (action: Action) => void;
export type Selector<S, R> = (state: S) => R;
export type Subscriber<S> = (state: S, prevState: S) => void;
export type EqualityFn<T> = (a: T, b: T) => boolean;

export interface Action<P = unknown> {
  type: ActionType;
  payload?: P;
  meta?: Record<string, unknown>;
  error?: boolean;
}

export interface Store<S> {
  getState(): S;
  dispatch: Dispatch;
  subscribe(subscriber: Subscriber<S>): () => void;
  replaceReducer(reducer: Reducer<S, Action>): void;
}

export interface StoreConfig<S> {
  reducer: Reducer<S, Action>;
  initialState?: S;
  middleware?: Middleware<S>[];
  devTools?: boolean;
  persist?: PersistConfig<S>;
}

export interface PersistConfig<S> {
  key: string;
  storage?: Storage;
  whitelist?: (keyof S)[];
  blacklist?: (keyof S)[];
  version?: number;
  migrate?: (state: unknown, version: number) => S;
  serialize?: (state: S) => string;
  deserialize?: (state: string) => S;
}

export interface ActionHistoryEntry {
  action: Action;
  timestamp: number;
  prevState: unknown;
  nextState: unknown;
}

export interface DevToolsState<S> {
  currentStateIndex: number;
  history: ActionHistoryEntry[];
  isPaused: boolean;
  isLocked: boolean;
}

export interface SliceConfig<S, N extends string> {
  name: N;
  initialState: S;
  reducers: Record<string, Reducer<S, Action>>;
  extraReducers?: (builder: ActionReducerMapBuilder<S>) => void;
}

export interface ActionReducerMapBuilder<S> {
  addCase<T extends ActionType>(
    actionType: T,
    reducer: Reducer<S, Action>
  ): ActionReducerMapBuilder<S>;
  addMatcher(
    matcher: (action: Action) => boolean,
    reducer: Reducer<S, Action>
  ): ActionReducerMapBuilder<S>;
  addDefaultCase(reducer: Reducer<S, Action>): ActionReducerMapBuilder<S>;
}

export interface EntityState<T> {
  ids: string[];
  entities: Record<string, T>;
}

export interface EntityAdapter<T> {
  getInitialState(): EntityState<T>;
  addOne(state: EntityState<T>, entity: T): EntityState<T>;
  addMany(state: EntityState<T>, entities: T[]): EntityState<T>;
  setOne(state: EntityState<T>, entity: T): EntityState<T>;
  setMany(state: EntityState<T>, entities: T[]): EntityState<T>;
  setAll(state: EntityState<T>, entities: T[]): EntityState<T>;
  removeOne(state: EntityState<T>, id: string): EntityState<T>;
  removeMany(state: EntityState<T>, ids: string[]): EntityState<T>;
  removeAll(state: EntityState<T>): EntityState<T>;
  updateOne(state: EntityState<T>, update: { id: string; changes: Partial<T> }): EntityState<T>;
  updateMany(state: EntityState<T>, updates: { id: string; changes: Partial<T> }[]): EntityState<T>;
  upsertOne(state: EntityState<T>, entity: T): EntityState<T>;
  upsertMany(state: EntityState<T>, entities: T[]): EntityState<T>;
  getSelectors(): EntitySelectors<T>;
}

export interface EntitySelectors<T> {
  selectIds: (state: EntityState<T>) => string[];
  selectEntities: (state: EntityState<T>) => Record<string, T>;
  selectAll: (state: EntityState<T>) => T[];
  selectTotal: (state: EntityState<T>) => number;
  selectById: (state: EntityState<T>, id: string) => T | undefined;
}

// ============================================================================
// IMMUTABLE HELPERS
// ============================================================================

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as Record<string, unknown>)[prop];
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });

  return obj;
}

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  const cloned: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
    }
  }

  return cloned as T;
}

function shallowEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a === null || b === null) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(key =>
    (a as Record<string, unknown>)[key] === (b as Record<string, unknown>)[key]
  );
}

// ============================================================================
// CORE STORE IMPLEMENTATION
// ============================================================================

class StateManagementService {
  private static instance: StateManagementService;

  private stores: Map<string, Store<unknown>> = new Map();
  private devToolsStates: Map<string, DevToolsState<unknown>> = new Map();
  private persistedStates: Map<string, unknown> = new Map();
  private selectorCache: Map<string, { lastArgs: unknown[]; lastResult: unknown }> = new Map();

  private constructor() {
    this.loadPersistedStates();
  }

  public static getInstance(): StateManagementService {
    if (!StateManagementService.instance) {
      StateManagementService.instance = new StateManagementService();
    }
    return StateManagementService.instance;
  }

  // ============================================================================
  // STORE CREATION
  // ============================================================================

  /**
   * Skapa en ny store
   */
  public createStore<S>(name: string, config: StoreConfig<S>): Store<S> {
    let state = config.initialState ?? ({} as S);
    const subscribers: Set<Subscriber<S>> = new Set();
    let currentReducer = config.reducer;

    // Ladda persisterad state
    if (config.persist) {
      const persisted = this.loadState<S>(config.persist);
      if (persisted !== null) {
        state = persisted;
      }
    }

    // DevTools state
    if (config.devTools) {
      this.devToolsStates.set(name, {
        currentStateIndex: 0,
        history: [],
        isPaused: false,
        isLocked: false
      });
    }

    // Skapa dispatch-funktion
    let dispatch: Dispatch = (action: Action) => {
      if (config.devTools) {
        const devState = this.devToolsStates.get(name);
        if (devState?.isPaused || devState?.isLocked) return;
      }

      const prevState = state;
      state = currentReducer(state, action);

      // I development, frys state för att förhindra mutationer
      if (process.env.NODE_ENV === 'development') {
        deepFreeze(state);
      }

      // DevTools history
      if (config.devTools) {
        this.recordAction(name, action, prevState, state);
      }

      // Persistering
      if (config.persist) {
        this.saveState(config.persist, state);
      }

      // Notifiera subscribers
      subscribers.forEach(subscriber => subscriber(state, prevState));
    };

    // Applicera middleware
    if (config.middleware && config.middleware.length > 0) {
      const store: Store<S> = {
        getState: () => state,
        dispatch: (action: Action) => dispatch(action),
        subscribe: (subscriber: Subscriber<S>) => {
          subscribers.add(subscriber);
          return () => subscribers.delete(subscriber);
        },
        replaceReducer: (newReducer: Reducer<S, Action>) => {
          currentReducer = newReducer;
        }
      };

      const chain = config.middleware.map(middleware => middleware(store));
      dispatch = chain.reduceRight(
        (next, middleware) => middleware(next),
        dispatch
      );
    }

    const store: Store<S> = {
      getState: () => state,
      dispatch,
      subscribe: (subscriber: Subscriber<S>) => {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
      replaceReducer: (newReducer: Reducer<S, Action>) => {
        currentReducer = newReducer;
      }
    };

    this.stores.set(name, store as Store<unknown>);

    // Dispatcha init action
    dispatch({ type: '@@INIT' });

    return store;
  }

  /**
   * Hämta befintlig store
   */
  public getStore<S>(name: string): Store<S> | null {
    return (this.stores.get(name) as Store<S>) ?? null;
  }

  /**
   * Ta bort store
   */
  public destroyStore(name: string): void {
    this.stores.delete(name);
    this.devToolsStates.delete(name);
  }

  // ============================================================================
  // SELECTORS
  // ============================================================================

  /**
   * Skapa memoized selector
   */
  public createSelector<S, R>(
    selectors: Selector<S, unknown>[],
    combiner: (...args: unknown[]) => R,
    equalityFn: EqualityFn<R> = shallowEqual
  ): Selector<S, R> {
    const cacheKey = `selector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return (state: S): R => {
      const args = selectors.map(selector => selector(state));
      const cached = this.selectorCache.get(cacheKey);

      if (cached) {
        const argsEqual = args.every((arg, i) =>
          shallowEqual(arg, cached.lastArgs[i])
        );

        if (argsEqual) {
          return cached.lastResult as R;
        }
      }

      const result = combiner(...args);

      if (!cached || !equalityFn(result, cached.lastResult as R)) {
        this.selectorCache.set(cacheKey, { lastArgs: args, lastResult: result });
      }

      return result;
    };
  }

  /**
   * Skapa parametriserad selector
   */
  public createParameterizedSelector<S, P, R>(
    selector: (state: S, params: P) => R
  ): (params: P) => Selector<S, R> {
    const cache = new Map<string, R>();

    return (params: P) => {
      return (state: S): R => {
        const key = JSON.stringify(params);
        const cached = cache.get(key);
        const result = selector(state, params);

        if (cached !== undefined && shallowEqual(cached, result)) {
          return cached;
        }

        cache.set(key, result);
        return result;
      };
    };
  }

  // ============================================================================
  // SLICE CREATOR
  // ============================================================================

  /**
   * Skapa en slice (Redux Toolkit-liknande)
   */
  public createSlice<S, N extends string>(
    config: SliceConfig<S, N>
  ): {
    name: N;
    reducer: Reducer<S, Action>;
    actions: Record<string, (payload?: unknown) => Action>;
  } {
    const { name, initialState, reducers, extraReducers } = config;

    // Skapa action creators
    const actions: Record<string, (payload?: unknown) => Action> = {};
    Object.keys(reducers).forEach(key => {
      const actionType = `${name}/${key}`;
      actions[key] = (payload?: unknown) => ({ type: actionType, payload });
    });

    // Skapa reducer
    const caseReducers = new Map<string, Reducer<S, Action>>();
    const matchers: { matcher: (action: Action) => boolean; reducer: Reducer<S, Action> }[] = [];
    let defaultReducer: Reducer<S, Action> | null = null;

    Object.entries(reducers).forEach(([key, reducer]) => {
      caseReducers.set(`${name}/${key}`, reducer as Reducer<S, Action>);
    });

    // Extra reducers
    if (extraReducers) {
      const builder: ActionReducerMapBuilder<S> = {
        addCase: (actionType, reducer) => {
          caseReducers.set(actionType, reducer);
          return builder;
        },
        addMatcher: (matcher, reducer) => {
          matchers.push({ matcher, reducer });
          return builder;
        },
        addDefaultCase: (reducer) => {
          defaultReducer = reducer;
          return builder;
        }
      };

      extraReducers(builder);
    }

    const reducer: Reducer<S, Action> = (state = initialState, action) => {
      // Exact match
      const caseReducer = caseReducers.get(action.type);
      if (caseReducer) {
        return caseReducer(state, action);
      }

      // Matchers
      for (const { matcher, reducer } of matchers) {
        if (matcher(action)) {
          return reducer(state, action);
        }
      }

      // Default
      if (defaultReducer) {
        return defaultReducer(state, action);
      }

      return state;
    };

    return { name, reducer, actions };
  }

  // ============================================================================
  // REDUCER COMBINERS
  // ============================================================================

  /**
   * Kombinera reducers
   */
  public combineReducers<S extends Record<string, unknown>>(
    reducers: { [K in keyof S]: Reducer<S[K], Action> }
  ): Reducer<S, Action> {
    const keys = Object.keys(reducers) as (keyof S)[];

    return (state = {} as S, action: Action): S => {
      let hasChanged = false;
      const nextState = {} as S;

      for (const key of keys) {
        const reducer = reducers[key];
        const previousStateForKey = state[key];
        const nextStateForKey = reducer(previousStateForKey, action);

        nextState[key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }

      return hasChanged ? nextState : state;
    };
  }

  /**
   * Reducera reducers (chain)
   */
  public reduceReducers<S>(
    initialState: S,
    ...reducers: Reducer<S, Action>[]
  ): Reducer<S, Action> {
    return (state = initialState, action: Action): S => {
      return reducers.reduce(
        (currentState, reducer) => reducer(currentState, action),
        state
      );
    };
  }

  // ============================================================================
  // MIDDLEWARE
  // ============================================================================

  /**
   * Logger middleware
   */
  public loggerMiddleware<S>(): Middleware<S> {
    return (store) => (next) => (action) => {
      console.group(`Action: ${action.type}`);
      console.log('Prev State:', store.getState());
      console.log('Action:', action);

      const result = next(action);

      console.log('Next State:', store.getState());
      console.groupEnd();

      return result;
    };
  }

  /**
   * Thunk middleware (async actions)
   */
  public thunkMiddleware<S>(): Middleware<S> {
    return (store) => (next) => (action) => {
      if (typeof action === 'function') {
        return (action as (dispatch: Dispatch, getState: () => S) => unknown)(
          store.dispatch,
          store.getState
        );
      }
      return next(action);
    };
  }

  /**
   * Promise middleware
   */
  public promiseMiddleware<S>(): Middleware<S> {
    return () => (next) => (action) => {
      if (action.payload instanceof Promise) {
        const { type, payload, meta } = action;

        // Dispatch pending
        next({ type: `${type}_PENDING`, meta });

        return payload
          .then((result: unknown) => {
            next({ type: `${type}_FULFILLED`, payload: result, meta });
            return result;
          })
          .catch((error: Error) => {
            next({ type: `${type}_REJECTED`, payload: error, meta, error: true });
            throw error;
          });
      }

      return next(action);
    };
  }

  /**
   * Debounce middleware
   */
  public debounceMiddleware<S>(config: Record<string, number>): Middleware<S> {
    const timeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

    return () => (next) => (action) => {
      const delay = config[action.type];

      if (delay) {
        const existing = timeouts.get(action.type);
        if (existing) {
          clearTimeout(existing);
        }

        return new Promise(resolve => {
          timeouts.set(action.type, setTimeout(() => {
            resolve(next(action));
            timeouts.delete(action.type);
          }, delay));
        });
      }

      return next(action);
    };
  }

  /**
   * Immer-liknande produce middleware
   */
  public immerMiddleware<S>(): Middleware<S> {
    return () => (next) => (action) => {
      if (action.payload && typeof action.payload === 'function') {
        // Producerfunktion - applicera på state
        return next({
          ...action,
          payload: action.payload,
          meta: { ...action.meta, isProducer: true }
        });
      }
      return next(action);
    };
  }

  // ============================================================================
  // ENTITY ADAPTER
  // ============================================================================

  /**
   * Skapa entity adapter för normaliserad state
   */
  public createEntityAdapter<T extends { id: string }>(
    config?: {
      selectId?: (entity: T) => string;
      sortComparer?: (a: T, b: T) => number;
    }
  ): EntityAdapter<T> {
    const selectId = config?.selectId ?? ((entity: T) => entity.id);
    const sortComparer = config?.sortComparer;

    const sortEntities = (entities: T[]): T[] => {
      return sortComparer ? [...entities].sort(sortComparer) : entities;
    };

    return {
      getInitialState: () => ({ ids: [], entities: {} }),

      addOne: (state, entity) => {
        const id = selectId(entity);
        if (state.entities[id]) return state;

        const newEntities = { ...state.entities, [id]: entity };
        const newIds = sortComparer
          ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
          : [...state.ids, id];

        return { ids: newIds, entities: newEntities };
      },

      addMany: (state, entities) => {
        const newEntities = { ...state.entities };
        const addedIds: string[] = [];

        entities.forEach(entity => {
          const id = selectId(entity);
          if (!newEntities[id]) {
            newEntities[id] = entity;
            addedIds.push(id);
          }
        });

        if (addedIds.length === 0) return state;

        const newIds = sortComparer
          ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
          : [...state.ids, ...addedIds];

        return { ids: newIds, entities: newEntities };
      },

      setOne: (state, entity) => {
        const id = selectId(entity);
        const isNew = !state.entities[id];

        const newEntities = { ...state.entities, [id]: entity };
        const newIds = isNew
          ? sortComparer
            ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
            : [...state.ids, id]
          : state.ids;

        return { ids: newIds, entities: newEntities };
      },

      setMany: (state, entities) => {
        const newEntities = { ...state.entities };
        const addedIds: string[] = [];

        entities.forEach(entity => {
          const id = selectId(entity);
          if (!newEntities[id]) {
            addedIds.push(id);
          }
          newEntities[id] = entity;
        });

        const newIds = sortComparer
          ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
          : [...state.ids, ...addedIds];

        return { ids: newIds, entities: newEntities };
      },

      setAll: (state, entities) => {
        const newEntities: Record<string, T> = {};
        entities.forEach(entity => {
          newEntities[selectId(entity)] = entity;
        });

        const newIds = sortEntities(entities).map(e => selectId(e));

        return { ids: newIds, entities: newEntities };
      },

      removeOne: (state, id) => {
        if (!state.entities[id]) return state;

        const newEntities = { ...state.entities };
        delete newEntities[id];

        return {
          ids: state.ids.filter(i => i !== id),
          entities: newEntities
        };
      },

      removeMany: (state, ids) => {
        const idsToRemove = new Set(ids);
        const newEntities = { ...state.entities };

        ids.forEach(id => {
          delete newEntities[id];
        });

        return {
          ids: state.ids.filter(id => !idsToRemove.has(id)),
          entities: newEntities
        };
      },

      removeAll: () => ({ ids: [], entities: {} }),

      updateOne: (state, { id, changes }) => {
        if (!state.entities[id]) return state;

        const entity = state.entities[id];
        const updatedEntity = { ...entity, ...changes };

        const newEntities = { ...state.entities, [id]: updatedEntity };
        const newIds = sortComparer
          ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
          : state.ids;

        return { ids: newIds, entities: newEntities };
      },

      updateMany: (state, updates) => {
        const newEntities = { ...state.entities };

        updates.forEach(({ id, changes }) => {
          if (newEntities[id]) {
            newEntities[id] = { ...newEntities[id], ...changes };
          }
        });

        const newIds = sortComparer
          ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
          : state.ids;

        return { ids: newIds, entities: newEntities };
      },

      upsertOne: (state, entity) => {
        const id = selectId(entity);
        const existing = state.entities[id];

        if (existing) {
          return {
            ids: state.ids,
            entities: { ...state.entities, [id]: { ...existing, ...entity } }
          };
        }

        const newEntities = { ...state.entities, [id]: entity };
        const newIds = sortComparer
          ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
          : [...state.ids, id];

        return { ids: newIds, entities: newEntities };
      },

      upsertMany: (state, entities) => {
        const newEntities = { ...state.entities };
        const addedIds: string[] = [];

        entities.forEach(entity => {
          const id = selectId(entity);
          const existing = newEntities[id];

          if (existing) {
            newEntities[id] = { ...existing, ...entity };
          } else {
            newEntities[id] = entity;
            addedIds.push(id);
          }
        });

        const newIds = sortComparer
          ? sortEntities(Object.values(newEntities)).map(e => selectId(e))
          : [...state.ids, ...addedIds];

        return { ids: newIds, entities: newEntities };
      },

      getSelectors: () => ({
        selectIds: (state) => state.ids,
        selectEntities: (state) => state.entities,
        selectAll: (state) => state.ids.map(id => state.entities[id]),
        selectTotal: (state) => state.ids.length,
        selectById: (state, id) => state.entities[id]
      })
    };
  }

  // ============================================================================
  // DEVTOOLS
  // ============================================================================

  /**
   * Hämta action history
   */
  public getActionHistory(storeName: string): ActionHistoryEntry[] {
    const devState = this.devToolsStates.get(storeName);
    return devState?.history ?? [];
  }

  /**
   * Time travel till specifik state
   */
  public timeTravel(storeName: string, index: number): void {
    const devState = this.devToolsStates.get(storeName);
    const store = this.stores.get(storeName);

    if (!devState || !store || index < 0 || index >= devState.history.length) {
      return;
    }

    devState.currentStateIndex = index;

    // Detta är en förenklad implementation - i verkligheten
    // skulle vi behöva hantera state-återställning mer noggrant
    console.log('Time travel till index:', index);
    console.log('State:', devState.history[index].nextState);
  }

  /**
   * Pausa DevTools
   */
  public pauseDevTools(storeName: string): void {
    const devState = this.devToolsStates.get(storeName);
    if (devState) {
      devState.isPaused = true;
    }
  }

  /**
   * Återuppta DevTools
   */
  public resumeDevTools(storeName: string): void {
    const devState = this.devToolsStates.get(storeName);
    if (devState) {
      devState.isPaused = false;
    }
  }

  /**
   * Exportera state history
   */
  public exportStateHistory(storeName: string): string {
    const history = this.getActionHistory(storeName);
    return JSON.stringify(history, null, 2);
  }

  /**
   * Importera state history
   */
  public importStateHistory(storeName: string, json: string): void {
    try {
      const history = JSON.parse(json) as ActionHistoryEntry[];
      const devState = this.devToolsStates.get(storeName);
      if (devState) {
        devState.history = history;
        devState.currentStateIndex = history.length - 1;
      }
    } catch (error) {
      console.error('Kunde inte importera state history:', error);
    }
  }

  private recordAction(storeName: string, action: Action, prevState: unknown, nextState: unknown): void {
    const devState = this.devToolsStates.get(storeName);
    if (!devState) return;

    devState.history.push({
      action,
      timestamp: Date.now(),
      prevState: deepClone(prevState),
      nextState: deepClone(nextState)
    });

    devState.currentStateIndex = devState.history.length - 1;

    // Begränsa historik till 100 entries
    if (devState.history.length > 100) {
      devState.history = devState.history.slice(-100);
      devState.currentStateIndex = devState.history.length - 1;
    }
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  private loadState<S>(config: PersistConfig<S>): S | null {
    try {
      const storage = config.storage ?? localStorage;
      const serialized = storage.getItem(`rehabflow_state_${config.key}`);

      if (!serialized) return null;

      const { state, version } = JSON.parse(serialized);

      // Migrera om versionen skiljer sig
      if (config.version && version !== config.version && config.migrate) {
        return config.migrate(state, version);
      }

      const deserialized = config.deserialize
        ? config.deserialize(state)
        : state;

      // Filtrera baserat på whitelist/blacklist
      if (config.whitelist || config.blacklist) {
        const filtered = {} as S;

        for (const key in deserialized) {
          if (config.whitelist && !config.whitelist.includes(key as keyof S)) {
            continue;
          }
          if (config.blacklist && config.blacklist.includes(key as keyof S)) {
            continue;
          }
          (filtered as Record<string, unknown>)[key] = (deserialized as Record<string, unknown>)[key];
        }

        return filtered;
      }

      return deserialized;
    } catch {
      return null;
    }
  }

  private saveState<S>(config: PersistConfig<S>, state: S): void {
    try {
      const storage = config.storage ?? localStorage;

      // Filtrera baserat på whitelist/blacklist
      let stateToSave = state;
      if (config.whitelist || config.blacklist) {
        const filtered = {} as S;

        for (const key in state) {
          if (config.whitelist && !config.whitelist.includes(key as keyof S)) {
            continue;
          }
          if (config.blacklist && config.blacklist.includes(key as keyof S)) {
            continue;
          }
          (filtered as Record<string, unknown>)[key] = (state as Record<string, unknown>)[key];
        }

        stateToSave = filtered;
      }

      const serialized = config.serialize
        ? config.serialize(stateToSave)
        : JSON.stringify(stateToSave);

      storage.setItem(`rehabflow_state_${config.key}`, JSON.stringify({
        state: serialized,
        version: config.version ?? 1
      }));
    } catch (error) {
      console.error('Kunde inte spara state:', error);
    }
  }

  private loadPersistedStates(): void {
    try {
      const keys = Object.keys(localStorage).filter(k =>
        k.startsWith('rehabflow_state_')
      );

      keys.forEach(key => {
        const stored = localStorage.getItem(key);
        if (stored) {
          const { state } = JSON.parse(stored);
          this.persistedStates.set(key.replace('rehabflow_state_', ''), state);
        }
      });
    } catch {
      // Ignorera fel vid laddning
    }
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Hook för att använda store
 */
export function useStore<S>(storeName: string): [S | null, Dispatch] {
  const [state, setState] = useState<S | null>(null);
  const service = StateManagementService.getInstance();
  const store = useMemo(() => service.getStore<S>(storeName), [storeName]);

  useEffect(() => {
    if (!store) return;

    setState(store.getState());

    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [store]);

  const dispatch = useCallback((action: Action) => {
    store?.dispatch(action);
  }, [store]);

  return [state, dispatch];
}

/**
 * Hook för selector
 */
export function useSelector<S, R>(
  storeName: string,
  selector: Selector<S, R>,
  equalityFn: EqualityFn<R> = shallowEqual
): R | undefined {
  const service = StateManagementService.getInstance();
  const store = useMemo(() => service.getStore<S>(storeName), [storeName]);
  const [selectedState, setSelectedState] = useState<R | undefined>(() =>
    store ? selector(store.getState()) : undefined
  );
  const lastSelectedState = useRef<R | undefined>(selectedState);

  useEffect(() => {
    if (!store) return;

    const checkForUpdates = (state: S) => {
      const newSelectedState = selector(state);

      if (!equalityFn(newSelectedState, lastSelectedState.current as R)) {
        lastSelectedState.current = newSelectedState;
        setSelectedState(newSelectedState);
      }
    };

    checkForUpdates(store.getState());

    return store.subscribe(checkForUpdates);
  }, [store, selector, equalityFn]);

  return selectedState;
}

/**
 * Hook för dispatch
 */
export function useDispatch(storeName: string): Dispatch {
  const service = StateManagementService.getInstance();
  const store = useMemo(() => service.getStore(storeName), [storeName]);

  return useCallback((action: Action) => {
    store?.dispatch(action);
  }, [store]);
}

/**
 * Hook för actions
 */
export function useActions<A extends Record<string, (...args: unknown[]) => Action>>(
  storeName: string,
  actions: A
): A {
  const dispatch = useDispatch(storeName);

  return useMemo(() => {
    const boundActions = {} as A;

    (Object.keys(actions) as (keyof A)[]).forEach(key => {
      boundActions[key] = ((...args: unknown[]) => {
        const action = actions[key](...args);
        dispatch(action);
        return action;
      }) as A[keyof A];
    });

    return boundActions;
  }, [dispatch, actions]);
}

/**
 * Hook för entity state
 */
export function useEntityState<T extends { id: string }>(
  storeName: string,
  adapter: EntityAdapter<T>,
  entitySelector: Selector<unknown, EntityState<T>>
) {
  const entityState = useSelector(storeName, entitySelector);
  const selectors = useMemo(() => adapter.getSelectors(), [adapter]);

  return useMemo(() => {
    if (!entityState) return null;

    return {
      ids: selectors.selectIds(entityState),
      entities: selectors.selectEntities(entityState),
      all: selectors.selectAll(entityState),
      total: selectors.selectTotal(entityState),
      byId: (id: string) => selectors.selectById(entityState, id)
    };
  }, [entityState, selectors]);
}

/**
 * Hook för DevTools
 */
export function useDevTools(storeName: string) {
  const service = StateManagementService.getInstance();
  const [history, setHistory] = useState<ActionHistoryEntry[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(service.getActionHistory(storeName));
    }, 100);

    return () => clearInterval(interval);
  }, [storeName]);

  const timeTravel = useCallback((index: number) => {
    service.timeTravel(storeName, index);
  }, [storeName]);

  const pause = useCallback(() => {
    service.pauseDevTools(storeName);
  }, [storeName]);

  const resume = useCallback(() => {
    service.resumeDevTools(storeName);
  }, [storeName]);

  const exportHistory = useCallback(() => {
    return service.exportStateHistory(storeName);
  }, [storeName]);

  const importHistory = useCallback((json: string) => {
    service.importStateHistory(storeName, json);
  }, [storeName]);

  return {
    history,
    timeTravel,
    pause,
    resume,
    exportHistory,
    importHistory
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export const stateManagementService = StateManagementService.getInstance();
export default stateManagementService;
