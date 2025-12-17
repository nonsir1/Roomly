import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './Modal.scss';

const RoomModal = ({ room, features, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    image_url: '',
    features: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name || '',
        description: room.description || '',
        capacity: room.capacity || '',
        image_url: room.image_url || '',
        features: room.features ? room.features.map(f => f.id) : []
      });
    }
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFeatureToggle = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };

      if (room) {
        await api.put(`/admin/rooms/${room.id}`, data);
      } else {
        await api.post('/rooms/', data);
      }

      onClose(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{room ? 'Редактировать переговорную' : 'Добавить переговорную'}</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Название *</label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Например, Переговорная А"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Описание *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Описание переговорной"
              rows="4"
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Вместимость *</label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              placeholder="Количество мест"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image_url">URL изображения</label>
            <Input
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Теги</label>
            <div className="features-grid">
              {features.map(feature => (
                <label key={feature.id} className="feature-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature.id)}
                    onChange={() => handleFeatureToggle(feature.id)}
                  />
                  <span>{feature.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <Button type="button" variant="secondary" onClick={() => onClose(false)}>
              Отмена
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;

