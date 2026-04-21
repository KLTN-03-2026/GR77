'use client';

import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useSettingsActions } from './_hooks/useSettingsActions';
import { LanguageSettings } from './_components/LanguageSettings';
import { AppearanceSettings } from './_components/AppearanceSettings';

export default function SettingsPage() {
  const {
    activeLanguage,
    setActiveLanguage,
    activeTheme,
    setActiveTheme,
    isSaving,
    handleSave
  } = useSettingsActions();

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12 font-sans">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Cog6ToothIcon className="w-7 h-7 text-cyan-500" />
          General Settings
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-9 sm:ml-10 font-medium">
          Customize your application preferences and appearance.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Language Details */}
        <LanguageSettings
          activeLanguage={activeLanguage}
          setActiveLanguage={setActiveLanguage}
        />

        {/* Theme Settings */}
        <AppearanceSettings
          activeTheme={activeTheme}
          setActiveTheme={setActiveTheme}
        />

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="border border-cyan-600 w-full sm:w-[220px] py-3.5 rounded-full bold-3 font-bold text-base text-cyan-600 bg-cyan-50 hover:bg-cyan-100 transition-colors shrink-0 shadow-sm"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
