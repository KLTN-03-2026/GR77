'use client';

import { MoonIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface AppearanceSettingsProps {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
}

export function AppearanceSettings({ activeTheme, setActiveTheme }: AppearanceSettingsProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shrink-0">
          <MoonIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Appearance</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">Choose how the application looks for you.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { id: 'light', label: 'Light Mode' },
          { id: 'dark', label: 'Dark Mode' },
          { id: 'system', label: 'System Match' },
        ].map((theme) => (
          <label
            key={theme.id}
            className={`relative cursor-pointer flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${activeTheme === theme.id
              ? 'border-purple-500 bg-purple-50/50'
              : 'border-gray-100 bg-white hover:border-purple-200'
              }`}
          >
            <input
              type="radio"
              name="theme"
              value={theme.id}
              checked={activeTheme === theme.id}
              onChange={() => setActiveTheme(theme.id)}
              className="sr-only"
            />
            {/* Visual Preview */}
            <div className={`w-full h-24 rounded-xl mb-4 border shadow-inner flex relative overflow-hidden ${
              theme.id === 'light' ? 'bg-gray-50 border-gray-200' : 
              theme.id === 'dark' ? 'bg-gray-900 border-gray-700' : 
              'border-gray-200'
            }`}>
              {theme.id === 'system' ? (
                <>
                  <div className="w-1/2 h-full bg-gray-50 flex flex-col p-2 space-y-2">
                    <div className="w-3/4 h-3 bg-white rounded shadow-sm"></div>
                    <div className="w-full h-8 bg-white rounded shadow-sm"></div>
                  </div>
                  <div className="w-1/2 h-full bg-gray-900 flex flex-col p-2 space-y-2 border-l border-gray-700">
                    <div className="w-3/4 h-3 bg-gray-800 rounded"></div>
                    <div className="w-full h-8 bg-gray-800 rounded"></div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col p-2 space-y-2">
                  <div className={`w-1/2 h-3 rounded shadow-sm ${theme.id === 'light' ? 'bg-white' : 'bg-gray-800'}`}></div>
                  <div className={`w-full h-8 rounded shadow-sm ${theme.id === 'light' ? 'bg-white' : 'bg-gray-800'}`}></div>
                  <div className={`w-2/3 h-3 rounded shadow-sm ${theme.id === 'light' ? 'bg-white' : 'bg-gray-800'}`}></div>
                </div>
              )}
            </div>
            <p className={`font-bold text-center w-full flex justify-center items-center gap-2 text-sm ${activeTheme === theme.id ? 'text-purple-700' : 'text-gray-900'}`}>
              {theme.label}
              {activeTheme === theme.id && <CheckCircleIcon className="w-5 h-5 text-purple-500" />}
            </p>
          </label>
        ))}
      </div>
    </div>
  );
}
