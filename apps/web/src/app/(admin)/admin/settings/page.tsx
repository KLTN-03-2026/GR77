'use client';

import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AdminSettingsPage() {
  const { language, setLanguage, translate } = useAdminLanguage();
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <GlobeAltIcon className="w-6 h-6 text-[#7598C1]" />
          {translate('settings.language')}
        </h2>

        <p className="text-gray-500 text-sm mb-4 font-medium">
          {translate('settings.language.desc')}
        </p>

        <div className="space-y-3 mb-8">
          <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${language === 'vi' ? 'border-[#7598C1] bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
            <input
              type="radio"
              name="language"
              value="vi"
              checked={language === 'vi'}
              onChange={() => setLanguage('vi')}
              className="w-4 h-4 text-[#7598C1] focus:ring-[#7598C1]"
            />
            <span className="ml-3 font-bold text-gray-700">{translate('settings.language.vi')}</span>
          </label>

          <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${language === 'en' ? 'border-[#7598C1] bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
            <input
              type="radio"
              name="language"
              value="en"
              checked={language === 'en'}
              onChange={() => setLanguage('en')}
              className="w-4 h-4 text-[#7598C1] focus:ring-[#7598C1]"
            />
            <span className="ml-3 font-bold text-gray-700">{translate('settings.language.en')}</span>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#7598C1] text-white font-bold rounded-xl shadow-md hover:bg-[#5DA2D5] transition-all"
          >
            {translate('settings.save')}
          </button>
          {showSaved && (
            <span className="text-green-600 font-bold text-sm animate-in zoom-in">
              {translate('settings.saved')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
