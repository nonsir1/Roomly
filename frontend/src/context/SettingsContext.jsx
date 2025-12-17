import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings должен использоваться внутри SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    enableHourlySlots: false,
    allowMultipleSlots: false
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/');
      // console.log('settings fetched:', response.data);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettings({
        enableHourlySlots: false,
        allowMultipleSlots: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    settings,
    loading,
    refreshSettings: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

