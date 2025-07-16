import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define settings type
type Settings = {
  showGuideAssistant: boolean;
  assistantEnabled: boolean;
};

// Default settings
const defaultSettings: Settings = {
  showGuideAssistant: true,
  assistantEnabled: true,
};

// Create context
type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
type SettingsProviderProps = {
  children: ReactNode;
};

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...parsedSettings,
        }));
      } catch (error) {
        console.error('Error parsing stored settings:', error);
      }
    }
  }, []);

  // Update settings and save to localStorage
  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prevSettings) => {
      const updatedSettings = {
        ...prevSettings,
        ...newSettings,
      };
      
      // Store updated settings in localStorage
      localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  const value = {
    settings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook for using settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};