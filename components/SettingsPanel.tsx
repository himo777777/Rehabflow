/**
 * SettingsPanel.tsx
 *
 * Comprehensive settings panel for the RehabFlow app.
 * Includes avatar customization, notifications, accessibility, and more.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Bell,
  Eye,
  Volume2,
  Accessibility,
  Shield,
  Download,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Vibrate,
  Languages,
  HelpCircle,
  FileText,
  LogOut,
  Check,
  Palette,
} from 'lucide-react';
import AvatarCustomizationPanel from './AvatarCustomizationPanel';
import { useAvatarCustomization } from '../services/avatarCustomizationService';
import { voiceGuidanceService } from '../services/voiceGuidanceService';
import { hapticService } from '../services/hapticService';
import { accessibilityService } from '../services/accessibilityService';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

type SettingsTab = 'profile' | 'avatar' | 'notifications' | 'accessibility' | 'privacy' | 'about';

interface SettingsState {
  // Notifications
  exerciseReminders: boolean;
  painLogReminders: boolean;
  progressUpdates: boolean;
  achievementAlerts: boolean;
  reminderTime: string;

  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

  // Audio & Haptics
  voiceGuidance: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  voiceVolume: number;

  // Display
  darkMode: boolean;
  language: 'sv' | 'en';

  // Privacy
  shareProgress: boolean;
  allowAnonymousData: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  exerciseReminders: true,
  painLogReminders: true,
  progressUpdates: true,
  achievementAlerts: true,
  reminderTime: '09:00',
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  screenReaderMode: false,
  colorBlindMode: 'none',
  voiceGuidance: true,
  soundEffects: true,
  hapticFeedback: true,
  voiceVolume: 0.8,
  darkMode: true,
  language: 'sv',
  shareProgress: false,
  allowAnonymousData: true,
};

const STORAGE_KEY = 'rehab_settings';

// ============================================================================
// COMPONENTS
// ============================================================================

const Toggle: React.FC<{
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}> = ({ enabled, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    disabled={disabled}
    onClick={() => onChange(!enabled)}
    className={`
      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
      border-2 border-transparent transition-colors duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800
      ${enabled ? 'bg-cyan-500' : 'bg-slate-600'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full
        bg-white shadow ring-0 transition duration-200 ease-in-out
        ${enabled ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);

const SettingItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ icon, title, description, children }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-700/50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="text-slate-400">{icon}</div>
      <div>
        <div className="text-white font-medium">{title}</div>
        {description && <div className="text-slate-400 text-sm">{description}</div>}
      </div>
    </div>
    <div>{children}</div>
  </div>
);

const SettingSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-2">
      {title}
    </h3>
    <div className="bg-slate-800/50 rounded-xl p-4">{children}</div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [showAvatarPanel, setShowAvatarPanel] = useState(false);
  const { appearance, colors } = useAvatarCustomization();

  // Load settings from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (error) {
      logger.warn('[Settings] Failed to load settings', error);
    }
  }, []);

  // Save settings to storage
  const updateSettings = (updates: Partial<SettingsState>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      logger.warn('[Settings] Failed to save settings', error);
    }

    // Apply settings
    applySettings(updates);
  };

  // Apply settings to services
  const applySettings = (updates: Partial<SettingsState>) => {
    if ('voiceGuidance' in updates) {
      if (updates.voiceGuidance) {
        voiceGuidanceService.unmute();
      } else {
        voiceGuidanceService.mute();
      }
    }

    if ('voiceVolume' in updates && updates.voiceVolume !== undefined) {
      voiceGuidanceService.setVolume(updates.voiceVolume);
    }

    if ('hapticFeedback' in updates) {
      if (updates.hapticFeedback) {
        hapticService.enable();
      } else {
        hapticService.disable();
      }
    }

    if ('highContrast' in updates || 'reducedMotion' in updates || 'largeText' in updates) {
      accessibilityService.updateSettings({
        highContrast: updates.highContrast,
        reduceMotion: updates.reducedMotion,
        largeText: updates.largeText,
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Placeholder for data export
      logger.info('[Settings] Data export requested');
      alert('Dataexport initierad. Du får en nedladdningslänk via e-post inom kort.');
    } catch (error) {
      logger.error('[Settings] Data export failed', error);
    }
  };

  const handleDeleteData = async () => {
    const confirmed = window.confirm(
      'Är du säker på att du vill radera all din data? Detta går inte att ångra.'
    );
    if (confirmed) {
      logger.info('[Settings] Data deletion requested');
      // Placeholder for data deletion
    }
  };

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profil', icon: <User size={18} /> },
    { id: 'avatar', label: 'Avatar', icon: <Palette size={18} /> },
    { id: 'notifications', label: 'Notiser', icon: <Bell size={18} /> },
    { id: 'accessibility', label: 'Tillgänglighet', icon: <Accessibility size={18} /> },
    { id: 'privacy', label: 'Sekretess', icon: <Shield size={18} /> },
    { id: 'about', label: 'Om', icon: <HelpCircle size={18} /> },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.skin }}
        >
          <User size={32} className="text-white/60" />
        </div>
        <div className="flex-1">
          <div className="text-white font-medium">Din Avatar</div>
          <div className="text-slate-400 text-sm">
            {appearance.bodyType === 'slim' ? 'Smal' :
             appearance.bodyType === 'athletic' ? 'Atletisk' :
             appearance.bodyType === 'broad' ? 'Bred' : 'Normal'} kroppstyp
          </div>
        </div>
        <button
          onClick={() => setShowAvatarPanel(true)}
          className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
        >
          Anpassa
        </button>
      </div>

      <SettingSection title="Visning">
        <SettingItem
          icon={settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
          title="Mörkt läge"
          description="Använd mörkt färgschema"
        >
          <Toggle
            enabled={settings.darkMode}
            onChange={(enabled) => updateSettings({ darkMode: enabled })}
          />
        </SettingItem>

        <SettingItem
          icon={<Languages size={20} />}
          title="Språk"
          description="Välj appens språk"
        >
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value as 'sv' | 'en' })}
            className="bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-600"
          >
            <option value="sv">Svenska</option>
            <option value="en">English</option>
          </select>
        </SettingItem>
      </SettingSection>

      <SettingSection title="Ljud & Haptik">
        <SettingItem
          icon={<Volume2 size={20} />}
          title="Röstguidning"
          description="Muntliga instruktioner under övningar"
        >
          <Toggle
            enabled={settings.voiceGuidance}
            onChange={(enabled) => updateSettings({ voiceGuidance: enabled })}
          />
        </SettingItem>

        {settings.voiceGuidance && (
          <SettingItem
            icon={<Volume2 size={20} />}
            title="Röstvolym"
          >
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.voiceVolume}
              onChange={(e) => updateSettings({ voiceVolume: parseFloat(e.target.value) })}
              className="w-24 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </SettingItem>
        )}

        <SettingItem
          icon={<Volume2 size={20} />}
          title="Ljudeffekter"
          description="Ljud för handlingar och notiser"
        >
          <Toggle
            enabled={settings.soundEffects}
            onChange={(enabled) => updateSettings({ soundEffects: enabled })}
          />
        </SettingItem>

        <SettingItem
          icon={<Vibrate size={20} />}
          title="Haptisk feedback"
          description="Vibrationer för feedback"
        >
          <Toggle
            enabled={settings.hapticFeedback}
            onChange={(enabled) => updateSettings({ hapticFeedback: enabled })}
          />
        </SettingItem>
      </SettingSection>
    </div>
  );

  const renderAvatarTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8 bg-slate-800/50 rounded-xl">
        {/* Avatar Preview */}
        <div
          className="w-24 h-24 mx-auto rounded-full mb-4 flex items-center justify-center"
          style={{ backgroundColor: colors.skin }}
        >
          <div
            className="w-16 h-20 rounded-lg"
            style={{ backgroundColor: colors.shirt }}
          />
        </div>
        <div className="text-white font-medium mb-2">Din Avatar</div>
        <button
          onClick={() => setShowAvatarPanel(true)}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Anpassa Avatar
        </button>
      </div>

      <SettingSection title="Snabbval">
        <div className="grid grid-cols-3 gap-3">
          {(['blue', 'green', 'purple', 'red', 'orange', 'teal'] as const).map((color) => (
            <button
              key={color}
              onClick={() => setShowAvatarPanel(true)}
              className="p-4 bg-slate-700/50 rounded-xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full"
                style={{
                  backgroundColor:
                    color === 'blue' ? '#4f86f7' :
                    color === 'green' ? '#22c55e' :
                    color === 'purple' ? '#a855f7' :
                    color === 'red' ? '#ef4444' :
                    color === 'orange' ? '#f97316' : '#14b8a6',
                }}
              />
              <span className="text-slate-300 text-xs capitalize">{color}</span>
            </button>
          ))}
        </div>
      </SettingSection>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <SettingSection title="Påminnelser">
        <SettingItem
          icon={<Bell size={20} />}
          title="Träningspåminnelser"
          description="Påminn mig om att träna"
        >
          <Toggle
            enabled={settings.exerciseReminders}
            onChange={(enabled) => updateSettings({ exerciseReminders: enabled })}
          />
        </SettingItem>

        {settings.exerciseReminders && (
          <SettingItem
            icon={<Bell size={20} />}
            title="Påminnelsetid"
          >
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => updateSettings({ reminderTime: e.target.value })}
              className="bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-600"
            />
          </SettingItem>
        )}

        <SettingItem
          icon={<Bell size={20} />}
          title="Smärtloggning"
          description="Påminnelser att logga smärta"
        >
          <Toggle
            enabled={settings.painLogReminders}
            onChange={(enabled) => updateSettings({ painLogReminders: enabled })}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection title="Uppdateringar">
        <SettingItem
          icon={<Bell size={20} />}
          title="Framstegsuppdateringar"
          description="Veckovisa sammanfattningar"
        >
          <Toggle
            enabled={settings.progressUpdates}
            onChange={(enabled) => updateSettings({ progressUpdates: enabled })}
          />
        </SettingItem>

        <SettingItem
          icon={<Bell size={20} />}
          title="Achievements"
          description="Notiser när du låser upp achievements"
        >
          <Toggle
            enabled={settings.achievementAlerts}
            onChange={(enabled) => updateSettings({ achievementAlerts: enabled })}
          />
        </SettingItem>
      </SettingSection>
    </div>
  );

  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      <SettingSection title="Visuellt">
        <SettingItem
          icon={<Eye size={20} />}
          title="Hög kontrast"
          description="Öka kontrasten för bättre synlighet"
        >
          <Toggle
            enabled={settings.highContrast}
            onChange={(enabled) => updateSettings({ highContrast: enabled })}
          />
        </SettingItem>

        <SettingItem
          icon={<Eye size={20} />}
          title="Stor text"
          description="Öka textstorleken"
        >
          <Toggle
            enabled={settings.largeText}
            onChange={(enabled) => updateSettings({ largeText: enabled })}
          />
        </SettingItem>

        <SettingItem
          icon={<Eye size={20} />}
          title="Färgblindhet"
          description="Anpassa färger för färgblindhet"
        >
          <select
            value={settings.colorBlindMode}
            onChange={(e) =>
              updateSettings({
                colorBlindMode: e.target.value as SettingsState['colorBlindMode'],
              })
            }
            className="bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-600"
          >
            <option value="none">Ingen</option>
            <option value="protanopia">Protanopi</option>
            <option value="deuteranopia">Deuteranopi</option>
            <option value="tritanopia">Tritanopi</option>
          </select>
        </SettingItem>
      </SettingSection>

      <SettingSection title="Rörelse">
        <SettingItem
          icon={<Accessibility size={20} />}
          title="Reducerad rörelse"
          description="Minska animationer och övergångar"
        >
          <Toggle
            enabled={settings.reducedMotion}
            onChange={(enabled) => updateSettings({ reducedMotion: enabled })}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection title="Skärmläsare">
        <SettingItem
          icon={<Accessibility size={20} />}
          title="Skärmläsarläge"
          description="Optimera för skärmläsare"
        >
          <Toggle
            enabled={settings.screenReaderMode}
            onChange={(enabled) => updateSettings({ screenReaderMode: enabled })}
          />
        </SettingItem>
      </SettingSection>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <SettingSection title="Datadelning">
        <SettingItem
          icon={<Shield size={20} />}
          title="Dela framsteg"
          description="Tillåt att dela framsteg med vårdgivare"
        >
          <Toggle
            enabled={settings.shareProgress}
            onChange={(enabled) => updateSettings({ shareProgress: enabled })}
          />
        </SettingItem>

        <SettingItem
          icon={<Shield size={20} />}
          title="Anonym dataanalys"
          description="Hjälp till att förbättra appen"
        >
          <Toggle
            enabled={settings.allowAnonymousData}
            onChange={(enabled) => updateSettings({ allowAnonymousData: enabled })}
          />
        </SettingItem>
      </SettingSection>

      <SettingSection title="Datahantering">
        <button
          onClick={handleExportData}
          className="w-full flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Download size={20} className="text-cyan-400" />
            <div>
              <div className="text-white font-medium">Exportera data</div>
              <div className="text-slate-400 text-sm">Ladda ner all din data</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-400" />
        </button>

        <button
          onClick={handleDeleteData}
          className="w-full flex items-center justify-between p-4 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors mt-3"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={20} className="text-red-400" />
            <div>
              <div className="text-red-400 font-medium">Radera all data</div>
              <div className="text-red-400/60 text-sm">Permanent radering</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-red-400" />
        </button>
      </SettingSection>
    </div>
  );

  const renderAboutTab = () => (
    <div className="space-y-6">
      <div className="text-center py-8 bg-slate-800/50 rounded-xl">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-white">RF</span>
        </div>
        <div className="text-white font-bold text-xl">RehabFlow</div>
        <div className="text-slate-400 text-sm">Version 2.0.0</div>
      </div>

      <SettingSection title="Information">
        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-slate-400" />
            <span className="text-white">Användarvillkor</span>
          </div>
          <ChevronRight size={20} className="text-slate-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-slate-400" />
            <span className="text-white">Integritetspolicy</span>
          </div>
          <ChevronRight size={20} className="text-slate-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-700/50 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <HelpCircle size={20} className="text-slate-400" />
            <span className="text-white">Hjälp & Support</span>
          </div>
          <ChevronRight size={20} className="text-slate-400" />
        </button>
      </SettingSection>

      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
        >
          <LogOut size={20} />
          Logga ut
        </button>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'avatar':
        return renderAvatarTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'accessibility':
        return renderAccessibilityTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'about':
        return renderAboutTab();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Inställningar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Stäng"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-700 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3
                border-b-2 transition-colors
                ${activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-white'
                }
              `}
            >
              {tab.icon}
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">{renderTabContent()}</div>
      </div>

      {/* Avatar Customization Panel */}
      {showAvatarPanel && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <AvatarCustomizationPanel onClose={() => setShowAvatarPanel(false)} />
        </div>
      )}
    </>
  );
};

export default SettingsPanel;
