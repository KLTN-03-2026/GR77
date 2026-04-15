'use client';

import { GlobeAltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface LanguageSettingsProps {
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
}

export function LanguageSettings({ activeLanguage, setActiveLanguage }: LanguageSettingsProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl shrink-0">
          <GlobeAltIcon className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Language</h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">Select your preferred language for the application interface.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          className={`relative cursor-pointer flex items-center p-4 rounded-2xl border-2 transition-all ${activeLanguage === 'english'
            ? 'border-cyan-500 bg-cyan-50/50'
            : 'border-gray-100 bg-white hover:border-cyan-200'
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
            <div className="w-10 h-7 rounded-sm overflow-hidden shadow-sm border border-gray-100 shrink-0">
              <img src="https://flagcdn.com/w80/us.png" alt="English" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className={`font-bold ${activeLanguage === 'english' ? 'text-cyan-700' : 'text-gray-900'}`}>English</p>
              <p className={`text-xs font-medium ${activeLanguage === 'english' ? 'text-cyan-600/70' : 'text-gray-500'}`}>Default</p>
            </div>
            {activeLanguage === 'english' && <CheckCircleIcon className="w-6 h-6 text-cyan-600" />}
          </div>
        </label>

        <label
          className={`relative cursor-pointer flex items-center p-4 rounded-2xl border-2 transition-all ${activeLanguage === 'vietnamese'
            ? 'border-cyan-500 bg-cyan-50/50'
            : 'border-gray-100 bg-white hover:border-cyan-200'
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
            <div className="w-10 h-7 rounded-sm overflow-hidden shadow-sm border border-gray-100 shrink-0">
              <img src="https://flagcdn.com/w80/vn.png" alt="Tiếng Việt" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className={`font-bold ${activeLanguage === 'vietnamese' ? 'text-cyan-700' : 'text-gray-900'}`}>Tiếng Việt</p>
              <p className={`text-xs font-medium ${activeLanguage === 'vietnamese' ? 'text-cyan-600/70' : 'text-gray-500'}`}>Vietnamese</p>
            </div>
            {activeLanguage === 'vietnamese' && <CheckCircleIcon className="w-6 h-6 text-cyan-600" />}
          </div>
        </label>
      </div>
    </div>
  );
}
