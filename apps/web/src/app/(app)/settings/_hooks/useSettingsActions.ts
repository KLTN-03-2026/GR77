'use client';

import { useState } from 'react';

export function useSettingsActions() {
  const [activeLanguage, setActiveLanguage] = useState('english');
  const [activeTheme, setActiveTheme] = useState('light');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return {
    activeLanguage,
    setActiveLanguage,
    activeTheme,
    setActiveTheme,
    isSaving,
    handleSave
  };
}
