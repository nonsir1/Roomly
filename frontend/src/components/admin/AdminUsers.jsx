import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import UserBookingsModal from './UserBookingsModal';
import './AdminUsers.scss';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewBookings = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // console.log('changing role for user', userId, 'to', newRole);
      await api.put(`/admin/users/${userId}`, { role: newRole });
      await fetchUsers();
    } catch (error) {
      alert(error.response?.data?.detail || 'Не удалось изменить роль');
    }
  };

  if (loading) {
    return <div className="admin-users__loading">Загрузка...</div>;
  }

  return (
    <div className="admin-users">
      <div className="admin-users__header">
        <h2>Управление пользователями</h2>
      </div>

      <div className="admin-users__list">
        {users.length === 0 ? (
          <p className="admin-users__empty">Нет пользователей</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="admin-users__item">
              <div className="admin-users__item-avatar">
                <span className="material-icons">person</span>
              </div>
              <div className="admin-users__item-info">
                <div className="admin-users__item-main">
                  <h3>{user.email}</h3>
                  <div className="admin-users__item-role">
                    <span className={`role-badge role-badge--${user.role.toLowerCase()}`}>
                      {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
                    </span>
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="USER">Пользователь</option>
                      <option value="ADMIN">Администратор</option>
                    </select>
                  </div>
                </div>
                <p className="admin-users__item-id">
                  ID: {user.id}
                </p>
              </div>
              <div className="admin-users__item-actions">
                <Button 
                  onClick={() => handleViewBookings(user)} 
                  variant="secondary" 
                  className="btn-sm"
                >
                  <span className="material-icons">event</span>
                  Бронирования
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && selectedUser && (
        <UserBookingsModal
          user={selectedUser}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AdminUsers;

