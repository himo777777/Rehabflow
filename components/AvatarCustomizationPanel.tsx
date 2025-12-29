/**
 * AvatarCustomizationPanel.tsx
 *
 * UI panel for customizing avatar appearance.
 * Includes skin tone, clothing, hair, and body type options.
 */

import React, { useState } from 'react';
import { X, User, Shirt, Palette, Scissors, Scale, Sparkles, RotateCcw, Check } from 'lucide-react';
import {
  useAvatarCustomization,
  SKIN_TONE_COLORS,
  CLOTHING_COLORS,
  HAIR_COLORS,
  SkinTone,
  ClothingColor,
  HairStyle,
  HairColor,
  BodyType,
  AvatarAccessory,
} from '../services/avatarCustomizationService';

interface AvatarCustomizationPanelProps {
  onClose: () => void;
  compact?: boolean;
}

type TabId = 'skin' | 'clothing' | 'hair' | 'body' | 'accessories';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'skin', label: 'Hudfärg', icon: <User size={18} /> },
  { id: 'clothing', label: 'Kläder', icon: <Shirt size={18} /> },
  { id: 'hair', label: 'Hår', icon: <Scissors size={18} /> },
  { id: 'body', label: 'Kroppstyp', icon: <Scale size={18} /> },
  { id: 'accessories', label: 'Tillbehör', icon: <Sparkles size={18} /> },
];

const HAIR_STYLE_LABELS: Record<HairStyle, string> = {
  none: 'Inget',
  short: 'Kort',
  medium: 'Medium',
  long: 'Långt',
  ponytail: 'Hästsvans',
  bun: 'Knut',
  curly: 'Lockigt',
  buzz: 'Rakad',
};

const BODY_TYPE_LABELS: Record<BodyType, string> = {
  slim: 'Smal',
  average: 'Normal',
  athletic: 'Atletisk',
  broad: 'Bred',
};

const ACCESSORY_LABELS: Record<AvatarAccessory, string> = {
  headband: 'Pannband',
  wristband: 'Handledsband',
  glasses: 'Glasögon',
  watch: 'Klocka',
};

const AvatarCustomizationPanel: React.FC<AvatarCustomizationPanelProps> = ({
  onClose,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('skin');
  const {
    appearance,
    colors,
    options,
    setAppearance,
    resetToDefault,
    toggleAccessory,
    hasAccessory,
  } = useAvatarCustomization();

  const renderSkinTab = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Välj en hudfärg för din avatar</p>
      <div className="grid grid-cols-3 gap-3">
        {options.skinTones.map((tone) => (
          <button
            key={tone}
            onClick={() => setAppearance({ skinTone: tone })}
            className={`
              relative w-full aspect-square rounded-xl transition-all
              ${appearance.skinTone === tone
                ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-800 scale-105'
                : 'hover:scale-105'
              }
            `}
            style={{ backgroundColor: SKIN_TONE_COLORS[tone] }}
            title={tone}
          >
            {appearance.skinTone === tone && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={24} className="text-slate-800" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderClothingTab = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Välj färg på träningskläderna</p>
      <div className="grid grid-cols-5 gap-3">
        {options.clothingColors.map((color) => (
          <button
            key={color}
            onClick={() => setAppearance({ clothingColor: color })}
            className={`
              relative w-full aspect-square rounded-xl transition-all
              ${appearance.clothingColor === color
                ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-800 scale-105'
                : 'hover:scale-105'
              }
            `}
            style={{ backgroundColor: CLOTHING_COLORS[color].primary }}
            title={color}
          >
            {appearance.clothingColor === color && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check size={20} className={color === 'white' ? 'text-slate-800' : 'text-white'} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderHairTab = () => (
    <div className="space-y-6">
      {/* Hair Style */}
      <div>
        <p className="text-slate-400 text-sm mb-3">Frisyr</p>
        <div className="grid grid-cols-4 gap-2">
          {options.hairStyles.map((style) => (
            <button
              key={style}
              onClick={() => setAppearance({ hairStyle: style })}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${appearance.hairStyle === style
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {HAIR_STYLE_LABELS[style]}
            </button>
          ))}
        </div>
      </div>

      {/* Hair Color */}
      {appearance.hairStyle !== 'none' && (
        <div>
          <p className="text-slate-400 text-sm mb-3">Hårfärg</p>
          <div className="flex gap-2 flex-wrap">
            {options.hairColors.map((color) => (
              <button
                key={color}
                onClick={() => setAppearance({ hairColor: color })}
                className={`
                  relative w-10 h-10 rounded-full transition-all
                  ${appearance.hairColor === color
                    ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-800 scale-110'
                    : 'hover:scale-110'
                  }
                `}
                style={{ backgroundColor: HAIR_COLORS[color] }}
                title={color}
              >
                {appearance.hairColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={16} className={color === 'white' || color === 'blonde' || color === 'gray' ? 'text-slate-800' : 'text-white'} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBodyTab = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Välj kroppstyp</p>
      <div className="grid grid-cols-2 gap-3">
        {options.bodyTypes.map((type) => (
          <button
            key={type}
            onClick={() => setAppearance({ bodyType: type })}
            className={`
              p-4 rounded-xl transition-all flex flex-col items-center gap-2
              ${appearance.bodyType === type
                ? 'bg-cyan-500/20 border-2 border-cyan-500'
                : 'bg-slate-700 border-2 border-transparent hover:border-slate-600'
              }
            `}
          >
            {/* Body icon representation */}
            <div className="relative w-12 h-20">
              <div
                className={`absolute left-1/2 -translate-x-1/2 bg-slate-400 rounded-full transition-all`}
                style={{
                  width: type === 'slim' ? '16px' : type === 'broad' ? '28px' : type === 'athletic' ? '24px' : '20px',
                  height: '40px',
                  top: '8px',
                }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-400 rounded-full"
                style={{ top: '-8px' }}
              />
            </div>
            <span className={`text-sm font-medium ${appearance.bodyType === type ? 'text-cyan-400' : 'text-slate-300'}`}>
              {BODY_TYPE_LABELS[type]}
            </span>
          </button>
        ))}
      </div>

      {/* Gender Selection */}
      <div className="pt-4 border-t border-slate-700">
        <p className="text-slate-400 text-sm mb-3">Kroppsform</p>
        <div className="flex gap-2">
          {(['male', 'female', 'neutral'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setAppearance({ gender })}
              className={`
                flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${appearance.gender === gender
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {gender === 'male' ? 'Man' : gender === 'female' ? 'Kvinna' : 'Neutral'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAccessoriesTab = () => (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">Lägg till tillbehör</p>
      <div className="grid grid-cols-2 gap-3">
        {options.accessories.map((accessory) => (
          <button
            key={accessory}
            onClick={() => toggleAccessory(accessory)}
            className={`
              p-4 rounded-xl transition-all flex items-center gap-3
              ${hasAccessory(accessory)
                ? 'bg-cyan-500/20 border-2 border-cyan-500'
                : 'bg-slate-700 border-2 border-transparent hover:border-slate-600'
              }
            `}
          >
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${hasAccessory(accessory) ? 'bg-cyan-500' : 'bg-slate-600'}
            `}>
              {hasAccessory(accessory) ? (
                <Check size={18} className="text-white" />
              ) : (
                <Sparkles size={18} className="text-slate-400" />
              )}
            </div>
            <span className={`text-sm font-medium ${hasAccessory(accessory) ? 'text-cyan-400' : 'text-slate-300'}`}>
              {ACCESSORY_LABELS[accessory]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'skin':
        return renderSkinTab();
      case 'clothing':
        return renderClothingTab();
      case 'hair':
        return renderHairTab();
      case 'body':
        return renderBodyTab();
      case 'accessories':
        return renderAccessoriesTab();
    }
  };

  return (
    <div className={`
      bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden
      ${compact ? 'w-80' : 'w-96'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Palette size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Anpassa Avatar</h3>
            <p className="text-slate-400 text-xs">Gör din avatar personlig</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X size={20} className="text-slate-400" />
        </button>
      </div>

      {/* Preview */}
      <div className="p-4 bg-slate-900/50 flex items-center justify-center">
        <div
          className="w-20 h-32 rounded-xl flex flex-col items-center justify-center gap-2"
          style={{ backgroundColor: colors.shirt }}
        >
          {/* Mini avatar preview */}
          <div
            className="w-10 h-10 rounded-full"
            style={{ backgroundColor: colors.skin }}
          />
          {appearance.hairStyle !== 'none' && (
            <div
              className="w-12 h-3 rounded-full -mt-5"
              style={{ backgroundColor: colors.hair }}
            />
          )}
          <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: colors.shirt }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 flex flex-col items-center gap-1 transition-all
              ${activeTab === tab.id
                ? 'bg-slate-700/50 text-cyan-400 border-b-2 border-cyan-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }
            `}
          >
            {tab.icon}
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 min-h-[200px]">
        {renderTabContent()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 flex justify-between">
        <button
          onClick={resetToDefault}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <RotateCcw size={16} />
          Återställ
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Klar
        </button>
      </div>
    </div>
  );
};

export default AvatarCustomizationPanel;
