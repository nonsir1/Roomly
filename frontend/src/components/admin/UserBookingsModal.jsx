import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import BookingEditModal from './BookingEditModal';
import './Modal.scss';
import './UserBookingsModal.scss';

const UserBookingsModal = ({ user, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/admin/users/${user.id}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user.id]);

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}`);
      await fetchBookings();
    } catch (error) {
      alert(error.response?.data?.detail || 'Не удалось удалить бронирование');
    }
  };

  const handleEditModalClose = async (shouldRefresh) => {
    setIsEditModalOpen(false);
    setSelectedBooking(null);
    if (shouldRefresh) {
      await fetchBookings();
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastBooking = (endTime) => {
    return new Date(endTime) < new Date();
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Бронирования пользователя: {user.email}</h2>
            <button className="modal-close" onClick={onClose}>
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="user-bookings__loading">Загрузка...</div>
            ) : bookings.length === 0 ? (
              <p className="user-bookings__empty">У пользователя нет бронирований</p>
            ) : (
              <div className="user-bookings__list">
                {bookings.map(booking => (
                  <div 
                    key={booking.id} 
                    className={`user-bookings__item ${isPastBooking(booking.end_time) ? 'past' : ''}`}
                  >
                    <div className="user-bookings__item-image">
                      {booking.room?.image_url ? (
                        <img src={booking.room.image_url} alt={booking.room.name} />
                      ) : (
                        <div className="user-bookings__item-placeholder">
                          <span className="material-icons">meeting_room</span>
                        </div>
                      )}
                    </div>
                    <div className="user-bookings__item-info">
                      <h3>{booking.title}</h3>
                      <p className="room-name">
                        <span className="material-icons">meeting_room</span>
                        {booking.room?.name}
                      </p>
                      <div className="booking-time">
                        <p>
                          <span className="material-icons">schedule</span>
                          <strong>Начало:</strong> {formatDateTime(booking.start_time)}
                        </p>
                        <p>
                          <span className="material-icons">schedule</span>
                          <strong>Конец:</strong> {formatDateTime(booking.end_time)}
                        </p>
                      </div>
                      {isPastBooking(booking.end_time) && (
                        <span className="past-badge">Завершено</span>
                      )}
                    </div>
                    <div className="user-bookings__item-actions">
                      <Button 
                        onClick={() => handleEdit(booking)} 
                        variant="secondary" 
                        className="btn-sm"
                      >
                        <span className="material-icons">edit</span>
                        Редактировать
                      </Button>
                      <Button 
                        onClick={() => handleDelete(booking.id)} 
                        variant="danger" 
                        className="btn-sm"
                      >
                        <span className="material-icons">delete</span>
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && selectedBooking && (
        <BookingEditModal
          booking={selectedBooking}
          onClose={handleEditModalClose}
        />
      )}
    </>
  );
};

export default UserBookingsModal;

