'use client';

import { useState } from 'react';
import { GlobeAltIcon, MoonIcon, CheckCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeLanguage, setActiveLanguage] = useState('english');
  const [activeTheme, setActiveTheme] = useState('light');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-8 bg-[#f9fafb] min-h-screen text-slate-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Cog6ToothIcon className="w-8 h-8 text-cyan-500" />
              Settings
            </h1>
            <p className="text-sm text-gray-400 ml-10">
              DEMO
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language Details */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <GlobeAltIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1d2951]">Language</h3>
                <p className="text-sm text-[#8ea1c1] font-medium">Select your preferred language for the application interface.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`relative cursor-pointer flex items-center p-4 rounded-2xl border-2 transition-all ${activeLanguage === 'english'
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-100 bg-white hover:border-blue-200'
                  }`}
              >
                <input
                  type="radio"
                  name="language"
                  value="english"
                  checked={activeLanguage === 'english'}
                  onChange={() => setActiveLanguage('english')}
                  className="sr-only"
                />
                <div className="flex items-center gap-4 w-full">
                  <span className="text-3xl">🇺🇸</span>
                  <div className="flex-1">
                    <p className={`font-bold ${activeLanguage === 'english' ? 'text-blue-700' : 'text-[#1d2951]'}`}>English</p>
                    <p className="text-xs text-[#8ea1c1] font-medium">Default</p>
                  </div>
                  {activeLanguage === 'english' && <CheckCircleIcon className="w-6 h-6 text-blue-500" />}
                </div>
              </label>

              <label
                className={`relative cursor-pointer flex items-center p-4 rounded-2xl border-2 transition-all ${activeLanguage === 'vietnamese'
                  ? 'border-blue-500 bg-blue-50/50'
                  : 'border-gray-100 bg-white hover:border-blue-200'
                  }`}
              >
                <input
                  type="radio"
                  name="language"
                  value="vietnamese"
                  checked={activeLanguage === 'vietnamese'}
                  onChange={() => setActiveLanguage('vietnamese')}
                  className="sr-only"
                />
                <div className="flex items-center gap-4 w-full">
                  <span className="text-3xl">🇻🇳</span>
                  <div className="flex-1">
                    <p className={`font-bold ${activeLanguage === 'vietnamese' ? 'text-blue-700' : 'text-[#1d2951]'}`}>Tiếng Việt</p>
                    <p className="text-xs text-[#8ea1c1] font-medium">Vietnamese</p>
                  </div>
                  {activeLanguage === 'vietnamese' && <CheckCircleIcon className="w-6 h-6 text-blue-500" />}
                </div>
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <MoonIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1d2951]">Appearance</h3>
                <p className="text-sm text-[#8ea1c1] font-medium">Choose how the application looks for you.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <label
                className={`relative cursor-pointer flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${activeTheme === 'light'
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-gray-100 bg-white hover:border-purple-200'
                  }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={activeTheme === 'light'}
                  onChange={() => setActiveTheme('light')}
                  className="sr-only"
                />
                <div className="w-full h-24 bg-gray-50 rounded-xl mb-4 border border-gray-200 shadow-inner flex flex-col p-2 space-y-2">
                  <div className="w-1/2 h-4 bg-white rounded-md shadow-sm"></div>
                  <div className="w-full h-8 bg-white rounded-md shadow-sm"></div>
                </div>
                <p className={`font-bold text-center w-full flex justify-center items-center gap-2 ${activeTheme === 'light' ? 'text-purple-700' : 'text-[#1d2951]'}`}>
                  Light Mode
                  {activeTheme === 'light' && <CheckCircleIcon className="w-5 h-5 text-purple-500" />}
                </p>
              </label>

              <label
                className={`relative cursor-pointer flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${activeTheme === 'dark'
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-gray-100 bg-white hover:border-purple-200'
                  }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={activeTheme === 'dark'}
                  onChange={() => setActiveTheme('dark')}
                  className="sr-only"
                />
                <div className="w-full h-24 bg-gray-900 rounded-xl mb-4 border border-gray-700 shadow-inner flex flex-col p-2 space-y-2">
                  <div className="w-1/2 h-4 bg-gray-800 rounded-md"></div>
                  <div className="w-full h-8 bg-gray-800 rounded-md"></div>
                </div>
                <p className={`font-bold text-center w-full flex justify-center items-center gap-2 ${activeTheme === 'dark' ? 'text-purple-700' : 'text-[#1d2951]'}`}>
                  Dark Mode
                  {activeTheme === 'dark' && <CheckCircleIcon className="w-5 h-5 text-purple-500" />}
                </p>
              </label>

              <label
                className={`relative cursor-pointer flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${activeTheme === 'system'
                  ? 'border-purple-500 bg-purple-50/50'
                  : 'border-gray-100 bg-white hover:border-purple-200'
                  }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={activeTheme === 'system'}
                  onChange={() => setActiveTheme('system')}
                  className="sr-only"
                />
                <div className="w-full h-24 rounded-xl mb-4 border border-gray-200 shadow-inner overflow-hidden flex relative">
                  <div className="w-1/2 h-full bg-gray-50 flex flex-col p-2 space-y-2">
                    <div className="w-3/4 h-4 bg-white rounded-md shadow-sm"></div>
                  </div>
                  <div className="w-1/2 h-full bg-gray-900 flex flex-col p-2 space-y-2 border-l border-gray-700">
                    <div className="w-3/4 h-4 bg-gray-800 rounded-md"></div>
                  </div>
                </div>
                <p className={`font-bold text-center w-full flex justify-center items-center gap-2 ${activeTheme === 'system' ? 'text-purple-700' : 'text-[#1d2951]'}`}>
                  System Match
                  {activeTheme === 'system' && <CheckCircleIcon className="w-5 h-5 text-purple-500" />}
                </p>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center min-w-[200px]"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving settings...</span>
                </div>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
