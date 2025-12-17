import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AdminRooms from '../components/admin/AdminRooms';
import AdminFeatures from '../components/admin/AdminFeatures';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSettings from '../components/admin/AdminSettings';
import './AdminPanel.scss';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rooms');

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-panel">
      <div className="container">
        <h1 className="admin-panel__title">Панель администратора</h1>

        <div className="admin-panel__tabs">
          <button
            className={`admin-panel__tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            Переговорные
          </button>
          <button
            className={`admin-panel__tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Тэги
          </button>
          <button
            className={`admin-panel__tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </button>
          <button
            className={`admin-panel__tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Настройки
          </button>
        </div>

        <div className="admin-panel__content">
          {activeTab === 'rooms' && <AdminRooms />}
          {activeTab === 'features' && <AdminFeatures />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

