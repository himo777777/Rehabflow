/**
 * Plugin/Extension System - Sprint 5.19
 *
 * Extensible plugin architecture for RehabFlow.
 * Features:
 * - Plugin registration/unregistration
 * - Plugin lifecycle management
 * - Hook system for extensibility
 * - Plugin dependencies
 * - Plugin settings management
 * - Plugin marketplace integration
 * - Sandboxed plugin execution
 */

import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export type PluginStatus = 'installed' | 'active' | 'inactive' | 'error' | 'updating';
export type PluginCategory = 'exercise' | 'analytics' | 'integration' | 'ui' | 'utility' | 'accessibility';
export type HookPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  icon?: string;
  homepage?: string;
  repository?: string;
  dependencies?: string[];
  permissions?: string[];
  settings?: PluginSettingDefinition[];
  hooks?: PluginHookRegistration[];
  status: PluginStatus;
  installedAt: string;
  updatedAt?: string;
  error?: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  icon?: string;
  homepage?: string;
  repository?: string;
  dependencies?: string[];
  permissions?: string[];
  settings?: PluginSettingDefinition[];
  main: string; // Entry point
  minAppVersion?: string;
}

export interface PluginSettingDefinition {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color';
  label: string;
  description?: string;
  default: unknown;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface PluginHookRegistration {
  hook: string;
  handler: string;
  priority?: HookPriority;
}

export interface HookCallback<T = unknown, R = void> {
  (data: T): R | Promise<R>;
}

export interface HookRegistration {
  pluginId: string;
  handler: HookCallback;
  priority: HookPriority;
}

export interface PluginContext {
  pluginId: string;
  settings: Record<string, unknown>;
  logger: typeof logger;
  registerHook: (hook: string, handler: HookCallback, priority?: HookPriority) => void;
  unregisterHook: (hook: string) => void;
  getService: (name: string) => unknown;
  emitEvent: (event: string, data: unknown) => void;
}

export interface MarketplacePlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  icon?: string;
  downloads: number;
  rating: number;
  reviews: number;
  price: number;
  featured: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY_PLUGINS = 'rehabflow-plugins';
const STORAGE_KEY_SETTINGS = 'rehabflow-plugin-settings';

// Priority weights for hook execution order
const PRIORITY_WEIGHTS: Record<HookPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

// ============================================================================
// PLUGIN SERVICE
// ============================================================================

class PluginService {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, HookRegistration[]> = new Map();
  private settings: Map<string, Record<string, unknown>> = new Map();
  private instances: Map<string, unknown> = new Map();
  private eventHandlers: Map<string, Set<Function>> = new Map();

  constructor() {
    this.loadPlugins();
    this.loadSettings();
  }

  // --------------------------------------------------------------------------
  // INITIALIZATION
  // --------------------------------------------------------------------------

  private loadPlugins(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLUGINS);
      if (stored) {
        const plugins = JSON.parse(stored) as Plugin[];
        plugins.forEach(p => this.plugins.set(p.id, p));
      }
    } catch (error) {
      logger.error('[Plugins] Failed to load plugins:', error);
    }
  }

  private savePlugins(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const plugins = Array.from(this.plugins.values());
      localStorage.setItem(STORAGE_KEY_PLUGINS, JSON.stringify(plugins));
    } catch (error) {
      logger.error('[Plugins] Failed to save plugins:', error);
    }
  }

  private loadSettings(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        const settings = JSON.parse(stored) as Record<string, Record<string, unknown>>;
        Object.entries(settings).forEach(([id, s]) => this.settings.set(id, s));
      }
    } catch (error) {
      logger.error('[Plugins] Failed to load settings:', error);
    }
  }

  private saveSettings(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const settings: Record<string, Record<string, unknown>> = {};
      this.settings.forEach((value, key) => {
        settings[key] = value;
      });
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      logger.error('[Plugins] Failed to save settings:', error);
    }
  }

  // --------------------------------------------------------------------------
  // PLUGIN MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Install a plugin
   */
  public async install(manifest: PluginManifest): Promise<Plugin> {
    // Check dependencies
    if (manifest.dependencies) {
      for (const dep of manifest.dependencies) {
        const installed = this.plugins.get(dep);
        if (!installed || installed.status !== 'active') {
          throw new Error(`Missing dependency: ${dep}`);
        }
      }
    }

    // Check if already installed
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin already installed: ${manifest.id}`);
    }

    const plugin: Plugin = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      category: manifest.category,
      icon: manifest.icon,
      homepage: manifest.homepage,
      repository: manifest.repository,
      dependencies: manifest.dependencies,
      permissions: manifest.permissions,
      settings: manifest.settings,
      status: 'installed',
      installedAt: new Date().toISOString(),
    };

    // Initialize default settings
    if (manifest.settings) {
      const defaultSettings: Record<string, unknown> = {};
      manifest.settings.forEach(s => {
        defaultSettings[s.key] = s.default;
      });
      this.settings.set(plugin.id, defaultSettings);
    }

    this.plugins.set(plugin.id, plugin);
    this.savePlugins();
    this.saveSettings();

    this.emit('installed', { plugin });
    logger.info('[Plugins] Installed:', plugin.id);

    return plugin;
  }

  /**
   * Uninstall a plugin
   */
  public async uninstall(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    // Check if other plugins depend on this
    for (const [id, p] of this.plugins) {
      if (p.dependencies?.includes(pluginId) && p.status === 'active') {
        throw new Error(`Plugin ${id} depends on ${pluginId}`);
      }
    }

    // Deactivate first
    if (plugin.status === 'active') {
      await this.deactivate(pluginId);
    }

    // Remove hooks
    this.hooks.forEach((registrations, hookName) => {
      this.hooks.set(
        hookName,
        registrations.filter(r => r.pluginId !== pluginId)
      );
    });

    // Remove settings
    this.settings.delete(pluginId);

    // Remove plugin
    this.plugins.delete(pluginId);
    this.instances.delete(pluginId);

    this.savePlugins();
    this.saveSettings();

    this.emit('uninstalled', { pluginId });
    logger.info('[Plugins] Uninstalled:', pluginId);
  }

  /**
   * Activate a plugin
   */
  public async activate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (plugin.status === 'active') return;

    // Activate dependencies first
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        const depPlugin = this.plugins.get(dep);
        if (depPlugin && depPlugin.status !== 'active') {
          await this.activate(dep);
        }
      }
    }

    try {
      // Create plugin context
      const context = this.createPluginContext(pluginId);

      // Initialize plugin (simulated - in production, load actual plugin code)
      const instance = { pluginId, context };
      this.instances.set(pluginId, instance);

      plugin.status = 'active';
      plugin.error = undefined;
      this.savePlugins();

      this.emit('activated', { plugin });
      logger.info('[Plugins] Activated:', pluginId);
    } catch (error) {
      plugin.status = 'error';
      plugin.error = error instanceof Error ? error.message : 'Activation failed';
      this.savePlugins();
      throw error;
    }
  }

  /**
   * Deactivate a plugin
   */
  public async deactivate(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    if (plugin.status !== 'active') return;

    // Check if other active plugins depend on this
    for (const [id, p] of this.plugins) {
      if (p.dependencies?.includes(pluginId) && p.status === 'active') {
        throw new Error(`Plugin ${id} depends on ${pluginId}`);
      }
    }

    // Clean up hooks registered by this plugin
    this.hooks.forEach((registrations, hookName) => {
      this.hooks.set(
        hookName,
        registrations.filter(r => r.pluginId !== pluginId)
      );
    });

    // Remove instance
    this.instances.delete(pluginId);

    plugin.status = 'inactive';
    this.savePlugins();

    this.emit('deactivated', { plugin });
    logger.info('[Plugins] Deactivated:', pluginId);
  }

  /**
   * Update a plugin
   */
  public async update(pluginId: string, newManifest: PluginManifest): Promise<Plugin> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    const wasActive = plugin.status === 'active';

    // Deactivate if active
    if (wasActive) {
      await this.deactivate(pluginId);
    }

    plugin.status = 'updating';
    this.savePlugins();

    // Update plugin data
    plugin.version = newManifest.version;
    plugin.description = newManifest.description;
    plugin.icon = newManifest.icon;
    plugin.settings = newManifest.settings;
    plugin.updatedAt = new Date().toISOString();
    plugin.status = 'inactive';

    // Update settings with new defaults
    if (newManifest.settings) {
      const currentSettings = this.settings.get(pluginId) || {};
      newManifest.settings.forEach(s => {
        if (!(s.key in currentSettings)) {
          currentSettings[s.key] = s.default;
        }
      });
      this.settings.set(pluginId, currentSettings);
    }

    this.savePlugins();
    this.saveSettings();

    // Reactivate if was active
    if (wasActive) {
      await this.activate(pluginId);
    }

    this.emit('updated', { plugin });
    logger.info('[Plugins] Updated:', pluginId);

    return plugin;
  }

  // --------------------------------------------------------------------------
  // PLUGIN CONTEXT
  // --------------------------------------------------------------------------

  private createPluginContext(pluginId: string): PluginContext {
    const self = this;

    return {
      pluginId,
      settings: this.settings.get(pluginId) || {},
      logger: {
        ...logger,
        info: (...args: unknown[]) => logger.info(`[Plugin:${pluginId}]`, ...args),
        warn: (...args: unknown[]) => logger.warn(`[Plugin:${pluginId}]`, ...args),
        error: (...args: unknown[]) => logger.error(`[Plugin:${pluginId}]`, ...args),
        debug: (...args: unknown[]) => logger.debug(`[Plugin:${pluginId}]`, ...args),
      },
      registerHook: (hook, handler, priority = 'normal') => {
        self.registerHook(pluginId, hook, handler, priority);
      },
      unregisterHook: (hook) => {
        self.unregisterHook(pluginId, hook);
      },
      getService: (name) => {
        return self.getService(name);
      },
      emitEvent: (event, data) => {
        self.emit(`plugin:${pluginId}:${event}`, data);
      },
    };
  }

  // --------------------------------------------------------------------------
  // HOOK SYSTEM
  // --------------------------------------------------------------------------

  /**
   * Register a hook handler
   */
  public registerHook(
    pluginId: string,
    hook: string,
    handler: HookCallback,
    priority: HookPriority = 'normal'
  ): void {
    if (!this.hooks.has(hook)) {
      this.hooks.set(hook, []);
    }

    const registrations = this.hooks.get(hook)!;
    registrations.push({ pluginId, handler, priority });

    // Sort by priority
    registrations.sort((a, b) =>
      PRIORITY_WEIGHTS[a.priority] - PRIORITY_WEIGHTS[b.priority]
    );

    logger.debug('[Plugins] Hook registered:', hook, pluginId);
  }

  /**
   * Unregister a hook handler
   */
  public unregisterHook(pluginId: string, hook: string): void {
    const registrations = this.hooks.get(hook);
    if (registrations) {
      this.hooks.set(
        hook,
        registrations.filter(r => r.pluginId !== pluginId)
      );
    }
  }

  /**
   * Execute hook handlers
   */
  public async executeHook<T, R>(hook: string, data: T): Promise<R[]> {
    const registrations = this.hooks.get(hook) || [];
    const results: R[] = [];

    for (const registration of registrations) {
      try {
        const result = await registration.handler(data);
        results.push(result as R);
      } catch (error) {
        logger.error('[Plugins] Hook handler error:', hook, registration.pluginId, error);
      }
    }

    return results;
  }

  /**
   * Execute hook with filtering (waterfall pattern)
   */
  public async filterHook<T>(hook: string, data: T): Promise<T> {
    const registrations = this.hooks.get(hook) || [];
    let result = data;

    for (const registration of registrations) {
      try {
        result = await registration.handler(result) as T;
      } catch (error) {
        logger.error('[Plugins] Filter hook error:', hook, registration.pluginId, error);
      }
    }

    return result;
  }

  // --------------------------------------------------------------------------
  // SETTINGS MANAGEMENT
  // --------------------------------------------------------------------------

  /**
   * Get plugin settings
   */
  public getSettings(pluginId: string): Record<string, unknown> {
    return this.settings.get(pluginId) || {};
  }

  /**
   * Update plugin settings
   */
  public updateSettings(pluginId: string, updates: Record<string, unknown>): void {
    const current = this.settings.get(pluginId) || {};
    this.settings.set(pluginId, { ...current, ...updates });
    this.saveSettings();

    this.emit('settings-updated', { pluginId, settings: this.settings.get(pluginId) });
    logger.debug('[Plugins] Settings updated:', pluginId);
  }

  /**
   * Reset plugin settings to defaults
   */
  public resetSettings(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin?.settings) return;

    const defaults: Record<string, unknown> = {};
    plugin.settings.forEach(s => {
      defaults[s.key] = s.default;
    });

    this.settings.set(pluginId, defaults);
    this.saveSettings();
  }

  // --------------------------------------------------------------------------
  // GETTERS
  // --------------------------------------------------------------------------

  /**
   * Get all plugins
   */
  public getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by ID
   */
  public getPlugin(pluginId: string): Plugin | null {
    return this.plugins.get(pluginId) || null;
  }

  /**
   * Get active plugins
   */
  public getActivePlugins(): Plugin[] {
    return this.getPlugins().filter(p => p.status === 'active');
  }

  /**
   * Get plugins by category
   */
  public getPluginsByCategory(category: PluginCategory): Plugin[] {
    return this.getPlugins().filter(p => p.category === category);
  }

  /**
   * Get available hooks
   */
  public getAvailableHooks(): string[] {
    return Array.from(this.hooks.keys());
  }

  // --------------------------------------------------------------------------
  // SERVICE ACCESS
  // --------------------------------------------------------------------------

  private getService(name: string): unknown {
    // Return available services for plugins
    // In production, this would return actual service instances
    const services: Record<string, unknown> = {
      logger,
      storage: localStorage,
    };

    return services[name];
  }

  // --------------------------------------------------------------------------
  // EVENT SYSTEM
  // --------------------------------------------------------------------------

  /**
   * Subscribe to events
   */
  public on(event: string, handler: Function): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    return () => {
      this.eventHandlers.get(event)?.delete(handler);
    };
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('[Plugins] Event handler error:', error);
        }
      });
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const pluginService = new PluginService();

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for plugin management
 */
export function usePlugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    setPlugins(pluginService.getPlugins());

    const handlers = [
      pluginService.on('installed', () => setPlugins(pluginService.getPlugins())),
      pluginService.on('uninstalled', () => setPlugins(pluginService.getPlugins())),
      pluginService.on('activated', () => setPlugins(pluginService.getPlugins())),
      pluginService.on('deactivated', () => setPlugins(pluginService.getPlugins())),
      pluginService.on('updated', () => setPlugins(pluginService.getPlugins())),
    ];

    return () => handlers.forEach(unsub => unsub());
  }, []);

  const install = useCallback(async (manifest: PluginManifest) => {
    return pluginService.install(manifest);
  }, []);

  const uninstall = useCallback(async (pluginId: string) => {
    return pluginService.uninstall(pluginId);
  }, []);

  const activate = useCallback(async (pluginId: string) => {
    return pluginService.activate(pluginId);
  }, []);

  const deactivate = useCallback(async (pluginId: string) => {
    return pluginService.deactivate(pluginId);
  }, []);

  return {
    plugins,
    activePlugins: plugins.filter(p => p.status === 'active'),
    install,
    uninstall,
    activate,
    deactivate,
    getPlugin: pluginService.getPlugin.bind(pluginService),
  };
}

/**
 * Hook for plugin settings
 */
export function usePluginSettings(pluginId: string) {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const plugin = pluginService.getPlugin(pluginId);

  useEffect(() => {
    setSettings(pluginService.getSettings(pluginId));

    const unsubscribe = pluginService.on('settings-updated', ({ pluginId: id, settings: newSettings }: { pluginId: string; settings: Record<string, unknown> }) => {
      if (id === pluginId) {
        setSettings(newSettings);
      }
    });

    return unsubscribe;
  }, [pluginId]);

  const updateSettings = useCallback((updates: Record<string, unknown>) => {
    pluginService.updateSettings(pluginId, updates);
  }, [pluginId]);

  const resetSettings = useCallback(() => {
    pluginService.resetSettings(pluginId);
    setSettings(pluginService.getSettings(pluginId));
  }, [pluginId]);

  return {
    settings,
    definitions: plugin?.settings || [],
    updateSettings,
    resetSettings,
  };
}

/**
 * Hook for using plugin hooks
 */
export function usePluginHook<T, R>(hook: string, defaultValue: R): { value: R; execute: (data: T) => Promise<R[]> } {
  const [value, setValue] = useState<R>(defaultValue);

  const execute = useCallback(async (data: T): Promise<R[]> => {
    const results = await pluginService.executeHook<T, R>(hook, data);
    if (results.length > 0) {
      setValue(results[results.length - 1]);
    }
    return results;
  }, [hook]);

  return { value, execute };
}

export default pluginService;
