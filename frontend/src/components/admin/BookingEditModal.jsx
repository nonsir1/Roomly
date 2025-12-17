import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './Modal.scss';

const BookingEditModal = ({ booking, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (booking) {
      const formatDateTimeLocal = (isoString) => {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
      };

      setFormData({
        title: booking.title || '',
        start_time: formatDateTimeLocal(booking.start_time),
        end_time: formatDateTimeLocal(booking.end_time)
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        user_id: booking.user_id,
        room_id: booking.room_id,
        title: formData.title,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString()
      };

      await api.put(`/bookings/${booking.id}`, data);
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)} style={{ zIndex: 1001 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать бронирование</h2>
          <button className="modal-close" onClick={() => onClose(false)}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="form-group">
            <label>Переговорная</label>
            <div className="booking-info">
              {booking.room?.name}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Название бронирования *</label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Например, Встреча с командой"
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_time">Время начала *</label>
            <Input
              id="start_time"
              name="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time">Время окончания *</label>
            <Input
              id="end_time"
              name="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
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

export default BookingEditModal;

