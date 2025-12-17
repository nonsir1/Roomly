import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import RoomModal from './RoomModal';
import './AdminRooms.scss';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms/?limit=100');
      // console.log('rooms loaded:', response.data);
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const fetchFeatures = async () => {
    try {
      const response = await api.get('/features/');
      setFeatures(response.data);
    } catch (error) {
      console.error('Failed to fetch features:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchRooms(), fetchFeatures()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту переговорную?')) {
      return;
    }

    try {
      await api.delete(`/admin/rooms/${roomId}`);
      await fetchRooms();
    } catch (error) {
      alert(error.response?.data?.detail || 'Не удалось удалить переговорную');
    }
  };

  const handleModalClose = async (shouldRefresh) => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    if (shouldRefresh) {
      await fetchRooms();
    }
  };

  if (loading) {
    return <div className="admin-rooms__loading">Загрузка...</div>;
  }

  return (
    <div className="admin-rooms">
      <div className="admin-rooms__header">
        <h2>Управление переговорными</h2>
        <Button onClick={handleAdd} variant="primary">
          <span className="material-icons">add</span>
          Добавить переговорную
        </Button>
      </div>

      <div className="admin-rooms__list">
        {rooms.length === 0 ? (
          <p className="admin-rooms__empty">Нет переговорных</p>
        ) : (
          rooms.map(room => (
            <div key={room.id} className="admin-rooms__item">
              <div className="admin-rooms__item-image">
                {room.image_url ? (
                  <img src={room.image_url} alt={room.name} />
                ) : (
                  <div className="admin-rooms__item-placeholder">
                    <span className="material-icons">meeting_room</span>
                  </div>
                )}
              </div>
              <div className="admin-rooms__item-info">
                <h3>{room.name}</h3>
                <p className="description">{room.description}</p>
                <div className="meta">
                  <span className="capacity">
                    <span className="material-icons">people</span>
                    {room.capacity} чел.
                  </span>
                  {room.features && room.features.length > 0 && (
                    <div className="features">
                      {room.features.map(feature => (
                        <span key={feature.id} className="feature-tag">
                          {feature.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-rooms__item-actions">
                <Button onClick={() => handleEdit(room)} variant="secondary" className="btn-sm">
                  <span className="material-icons">edit</span>
                  Редактировать
                </Button>
                <Button onClick={() => handleDelete(room.id)} variant="danger" className="btn-sm">
                  <span className="material-icons">delete</span>
                  Удалить
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <RoomModal
          room={selectedRoom}
          features={features}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AdminRooms;

