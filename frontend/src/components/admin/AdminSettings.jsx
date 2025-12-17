import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useSettings } from '../../context/SettingsContext';
import Button from '../ui/Button';
import './AdminSettings.scss';

const AdminSettings = () => {
  const { settings: globalSettings, refreshSettings } = useSettings();
  const [settings, setSettings] = useState({
    enableHourlySlots: false,
    allowMultipleSlots: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings/');
      setSettings(response.data);
      setOriginalSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      alert('Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/settings/', settings);
      setSettings(response.data);
      setOriginalSettings(response.data);
      // Обновляем глобальные настройки
      await refreshSettings();
      alert('Настройки успешно сохранены!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(error.response?.data?.detail || 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) {
    return <div className="admin-settings__loading">Загрузка...</div>;
  }

  return (
    <div className="admin-settings">
      <div className="admin-settings__header">
        <h2>Настройки системы</h2>
      </div>

      <div className="admin-settings__section">
        <h3 className="admin-settings__section-title">Режим бронирования</h3>
        <p className="admin-settings__section-description">
          Выберите режим работы системы бронирования переговорных комнат
        </p>

        <div className="admin-settings__options">
          <div className="admin-settings__option">
            <div className="admin-settings__option-header">
              <div className="admin-settings__option-info">
                <h4>Почасовые слоты</h4>
                <p>
                  Включить систему почасовых слотов. День делится на 24 слота по часу каждый.
                  Пользователи выбирают конкретные временные слоты (например, 14:00-15:00).
                </p>
              </div>
              <label className="admin-settings__toggle">
                <input
                  type="checkbox"
                  checked={settings.enableHourlySlots}
                  onChange={() => handleToggle('enableHourlySlots')}
                />
                <span className="admin-settings__toggle-slider"></span>
              </label>
            </div>
          </div>

          {settings.enableHourlySlots && (
            <div className="admin-settings__option admin-settings__option--nested">
              <div className="admin-settings__option-header">
                <div className="admin-settings__option-info">
                  <h4>Бронирование больше 1 слота</h4>
                  <p>
                    Разрешить пользователям бронировать несколько слотов подряд.
                    Если выключено, можно забронировать только один час.
                  </p>
                </div>
                <label className="admin-settings__toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowMultipleSlots}
                    onChange={() => handleToggle('allowMultipleSlots')}
                  />
                  <span className="admin-settings__toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>

        {!settings.enableHourlySlots && (
          <div className="admin-settings__info-box">
            <span className="material-icons">info</span>
            <div>
              <strong>Свободный режим бронирования</strong>
              <p>
                Пользователи могут бронировать переговорные на любое время с точностью до минуты.
                Указывается количество часов бронирования.
              </p>
            </div>
          </div>
        )}

        {settings.enableHourlySlots && (
          <div className="admin-settings__info-box admin-settings__info-box--warning">
            <span className="material-icons">schedule</span>
            <div>
              <strong>Режим почасовых слотов активен</strong>
              <p>
                На фронтенде будет отображаться таймлайн с 24 часовыми слотами.
                Бронирование возможно только на целые часы (например, 14:00-15:00).
                Если существующее бронирование начинается в нецелое время, весь час будет заблокирован.
              </p>
            </div>
          </div>
        )}
      </div>

      {hasChanges && (
        <div className="admin-settings__actions">
          <Button 
            onClick={handleSave} 
            variant="primary" 
            disabled={saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
          <Button 
            onClick={handleReset} 
            variant="secondary"
            disabled={saving}
          >
            Отменить
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;

