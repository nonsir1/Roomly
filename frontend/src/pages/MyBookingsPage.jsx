import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/home.scss';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                const response = await api.get('/bookings/my');
                setBookings(response.data);
            } catch (error) {
                console.error("Error fetching my bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyBookings();
        }
    }, [user]);

    if (!user) {
        return <div className="container" style={{padding: '2rem'}}>Пожалуйста, войдите в систему.</div>;
    }

    if (loading) {
        return <div className="container"><div className="loader">Загрузка...</div></div>;
    }

    return (
        <div className="container home-page">
            <h1 style={{marginTop: '2rem', marginBottom: '2rem'}}>Мои бронирования</h1>
            
            {bookings.length === 0 ? (
                <p>У вас пока нет активных бронирований.</p>
            ) : (
                <div className="bookings-grid">
                    {bookings.map(booking => (
                        <div key={booking.id} className="room-card" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', transition: 'none', transform: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
                            <h3 style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#1f2937'}}>
                                {booking.title || 'Встреча'}
                            </h3>
                            <p style={{color: '#4b5563', fontSize: '0.95rem'}}>
                                {new Date(booking.start_time).toLocaleDateString([], {day: 'numeric', month: 'long', year: 'numeric'})}, {' '}
                                {new Date(booking.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {' '}
                                {new Date(booking.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            
                            {booking.room && (
                                <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem'}}>
                                    <img 
                                        src={booking.room.image_url} 
                                        alt={booking.room.name} 
                                        style={{width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover'}}
                                    />
                                    <div>
                                        <p style={{fontWeight: '500'}}>{booking.room.name}</p>
                                        <p style={{fontSize: '0.85rem', color: '#6b7280'}}>{booking.room.description?.slice(0, 50)}...</p>
                                    </div>
                                </div>
                            )}

                            <div style={{display: 'flex', gap: '0.5rem', marginTop: 'auto'}}>
                                <Button 
                                    variant="secondary" 
                                    className="w-full"
                                    onClick={() => window.location.href = `/room/${booking.room_id}?edit=${booking.id}`}
                                >
                                    Изменить
                                </Button>
                                <Button 
                                    variant="danger" 
                                    className="w-full"
                                    onClick={async () => {
                                        if(confirm('Удалить бронирование?')) {
                                            try {
                                                await api.delete(`/bookings/${booking.id}`);
                                                setBookings(prev => prev.filter(b => b.id !== booking.id));
                                            } catch(e) {
                                                alert('Ошибка удаления');
                                            }
                                        }
                                    }}
                                >
                                    Удалить
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;

