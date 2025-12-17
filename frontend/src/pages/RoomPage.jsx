import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Tag from '../components/ui/Tag';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import HourlySlotTimeline from '../components/HourlySlotTimeline';
import '../styles/room-page.scss';

const RoomPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    
    const [room, setRoom] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStartTime, setModalStartTime] = useState('');
    const [modalEndTime, setModalEndTime] = useState('');
    const [bookingTitle, setBookingTitle] = useState('Встреча');
    const [editingBookingId, setEditingBookingId] = useState(null);
    
    const [isCollision, setIsCollision] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(null);
    const [dragCurrentY, setDragCurrentY] = useState(null);
    const timelineRef = useRef(null);

    const [selectedSlots, setSelectedSlots] = useState([]);

    const HOUR_HEIGHT = 60;
    const START_HOUR = 0;
    const END_HOUR = 24;
    const SNAP_MINUTES = 15;
    const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60;

    useEffect(() => {
        const paramStart = searchParams.get('start_time');
        const paramEnd = searchParams.get('end_time');
        const editId = searchParams.get('edit');

        if (editId) {
            setEditingBookingId(parseInt(editId));
        }

        if (paramStart && paramEnd && !editId) {
            const startDate = new Date(paramStart);
            const endDate = new Date(paramEnd);
            
            setSelectedDate(startDate);
            setModalStartTime(formatTime(startDate));
            setModalEndTime(formatTime(endDate));
            setIsModalOpen(true);
        }
    }, [searchParams]);

    const fetchRoomData = async () => {
        try {
            const startDay = new Date(selectedDate);
            startDay.setHours(0,0,0,0);
            
            const endDay = new Date(selectedDate);
            endDay.setHours(23,59,59,999);
            console.log('loading bookings for', selectedDate.toDateString());
            
            const toLocalISOString = (date) => {
                const tzOffset = date.getTimezoneOffset() * 60000;
                const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, -1);
                return localISOTime;
            };

            const [roomRes, bookingsRes] = await Promise.all([
                api.get(`/rooms/${id}`),
                api.get(`/bookings/room/${id}`, {
                    params: {
                        start_date: toLocalISOString(startDay),
                        end_date: toLocalISOString(endDay)
                    }
                })
            ]);
            setRoom(roomRes.data);
            setBookings(bookingsRes.data);
            
            const editId = searchParams.get('edit');
            if (editId) {
                const booking = bookingsRes.data.find(b => b.id === parseInt(editId));
                if (booking) {
                    const start = new Date(booking.start_time);
                    const end = new Date(booking.end_time);
                    setModalStartTime(formatTime(start));
                    setModalEndTime(formatTime(end));
                    setBookingTitle(booking.title || 'Встреча');
                    setIsModalOpen(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
        if (loading) setLoading(false);
    };

    useEffect(() => {
        fetchRoomData();
    }, [id, selectedDate]);

    useEffect(() => {
        if (!isModalOpen || !modalStartTime || !modalEndTime) {
            setIsCollision(false);
            return;
        }

        const [startH, startM] = modalStartTime.split(':').map(Number);
        const [endH, endM] = modalEndTime.split(':').map(Number);
        
        const newStart = new Date(selectedDate);
        newStart.setHours(startH, startM, 0, 0);
        
        const newEnd = new Date(selectedDate);
        newEnd.setHours(endH, endM, 0, 0);

        const hasCollision = bookings.some(b => {
            if (b.id === editingBookingId) return false;
            
            const bStart = new Date(b.start_time);
            bStart.setSeconds(0, 0);
            
            const bEnd = new Date(b.end_time);
            bEnd.setSeconds(0, 0);
            
            const checkStart = newStart.getTime();
            const checkEnd = newEnd.getTime();
            const existStart = bStart.getTime();
            const existEnd = bEnd.getTime();

            return (checkStart < existEnd && checkEnd > existStart);
        });

        setIsCollision(hasCollision);
    }, [modalStartTime, modalEndTime, bookings, editingBookingId, isModalOpen, selectedDate]);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const roundToSnap = (minutes) => {
        return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
    };

    const yToTime = (y) => {
        const totalMinutes = y / PIXELS_PER_MINUTE;
        const snappedMinutes = roundToSnap(totalMinutes);
        
        const hours = Math.floor(snappedMinutes / 60);
        const mins = snappedMinutes % 60;
        
        const date = new Date(selectedDate);
        date.setHours(hours, mins, 0, 0);
        return date;
    };

    const handleMouseDown = (e) => {
        if (settings.enableHourlySlots) return;
        if (!user || e.target.closest('.event-card')) return;
        
        const rect = timelineRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        
        setIsDragging(true);
        setDragStartY(y);
        setDragCurrentY(y);
        
        if (editingBookingId) {
            setEditingBookingId(null);
            setBookingTitle('Встреча');
            navigate(`/room/${id}`, { replace: true });
        } else {
            setEditingBookingId(null);
            setBookingTitle('Встреча');
        }
    };

    const handleMouseMove = (e) => {
        if (settings.enableHourlySlots) return;
        if (!isDragging) return;
        const rect = timelineRef.current.getBoundingClientRect();
        let y = e.clientY - rect.top;
        y = Math.max(0, Math.min(y, (END_HOUR - START_HOUR) * HOUR_HEIGHT));
        setDragCurrentY(y);
    };

    const handleMouseUp = () => {
        if (settings.enableHourlySlots) return;
        if (!isDragging) return;
        setIsDragging(false);
        
        const startY = Math.min(dragStartY, dragCurrentY);
        const endY = Math.max(dragStartY, dragCurrentY);
        const height = Math.max(endY - startY, SNAP_MINUTES * PIXELS_PER_MINUTE); 
        
        const startTime = yToTime(startY);
        const endTime = yToTime(startY + height);

        setModalStartTime(formatTime(startTime));
        setModalEndTime(formatTime(endTime));
        setIsModalOpen(true);
    };

    const handleTimeInputChange = (type, value) => {
        if (settings.enableHourlySlots) {
            const [hours] = value.split(':').map(Number);
            const roundedValue = `${String(hours).padStart(2, '0')}:00`;
            
            if (type === 'start') {
                setModalStartTime(roundedValue);
                const [endH] = modalEndTime.split(':').map(Number);
                const newSlots = [];
                for (let h = hours; h < endH; h++) {
                    newSlots.push(h);
                }
                setSelectedSlots(newSlots);
            } else {
                setModalEndTime(roundedValue);
                const [startH] = modalStartTime.split(':').map(Number);
                const newSlots = [];
                for (let h = startH; h < hours; h++) {
                    newSlots.push(h);
                }
                setSelectedSlots(newSlots);
            }
        } else {
            if (type === 'start') {
                setModalStartTime(value);
            } else {
                setModalEndTime(value);
            }
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        
        if (isCollision) return;
        // if (!user) return;

        const [startH, startM] = modalStartTime.split(':').map(Number);
        const [endH, endM] = modalEndTime.split(':').map(Number);
        
        const startDateTime = new Date(selectedDate);
        startDateTime.setHours(startH, startM, 0, 0);
        
        const endDateTime = new Date(selectedDate);
        endDateTime.setHours(endH, endM, 0, 0);

        const bookingPayload = {
            room_id: room.id,
            user_id: user.id,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            title: bookingTitle || 'Встреча'
        };

        const previousBookings = [...bookings];
        const tempId = Date.now();
        const savedEditingId = editingBookingId;

        setBookings(prev => {
            if (savedEditingId) {
                return prev.map(b => b.id === savedEditingId ? { ...b, ...bookingPayload } : b);
            } else {
                return [...prev, { id: tempId, ...bookingPayload }];
            }
        });

        setIsModalOpen(false);
        setEditingBookingId(null);
        setBookingTitle('Встреча');
        setSelectedSlots([]);
        navigate(`/room/${id}`, { replace: true });

        try {
            if (savedEditingId) {
                await api.put(`/bookings/${savedEditingId}`, bookingPayload);
            } else {
                await api.post('/bookings/', bookingPayload);
            }
            
            await fetchRoomData();

        } catch (error) {
            console.error("Booking error:", error);
            setBookings(previousBookings);
            alert(error.response?.data?.detail || "Ошибка бронирования");
        }
    };

    const handleSlotSelect = (slots) => {
        setSelectedSlots(slots);
        // console.log('selected slots:', slots);
        
        if (slots.length > 0) {
            const startHour = Math.min(...slots);
            const endHour = Math.max(...slots) + 1;
            
            const startTime = new Date(selectedDate);
            startTime.setHours(startHour, 0, 0, 0);
            
            const endTime = new Date(selectedDate);
            endTime.setHours(endHour, 0, 0, 0);
            
            setModalStartTime(formatTime(startTime));
            setModalEndTime(formatTime(endTime));
            setIsModalOpen(true);
        } else {
            if (!editingBookingId) {
                setIsModalOpen(false);
            }
        }
    };

    const handleSlotEventClick = (booking) => {
        if (booking.user_id === user?.id) {
            setEditingBookingId(booking.id);
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);
            setModalStartTime(formatTime(start));
            setModalEndTime(formatTime(end));
            setBookingTitle(booking.title || 'Встреча');
            setIsModalOpen(true);
            setSelectedSlots([]);
        }
    };

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let i = START_HOUR; i < END_HOUR; i++) {
            slots.push(i);
        }
        return slots;
    }, []);

    if (loading && !room) return <div className="loader">Загрузка...</div>;

    const renderGhostEvent = () => {
        if (settings.enableHourlySlots) return null;
        if (!isDragging) return null;
        const top = Math.min(dragStartY, dragCurrentY);
        const height = Math.abs(dragCurrentY - dragStartY);
        return (
            <div className="ghost-event" style={{ top: `${top}px`, height: `${height}px` }} />
        );
    };
    
    const renderSelectionPreview = () => {
        if (settings.enableHourlySlots) return null;
        if (!isModalOpen || !modalStartTime || !modalEndTime) return null;

        const [startH, startM] = modalStartTime.split(':').map(Number);
        const [endH, endM] = modalEndTime.split(':').map(Number);
        
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        const top = (startMinutes / 60) * HOUR_HEIGHT;
        const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;

        if (height <= 0) return null;

        return (
            <div 
                className={`selection-preview ${isCollision ? 'collision' : ''}`}
                style={{ top: `${top}px`, height: `${height}px` }}
            >
                <div className="selection-label">{bookingTitle || 'Новое бронирование'}</div>
            </div>
        );
    };

    return (
        <div className="container room-page-container">
            <aside className="room-sidebar sticky-sidebar">
                <img src={room.image_url} alt={room.name} className="room-hero-image" />
                <div className="room-details">
                    <h1>{room.name}</h1>
                    <div className="capacity-badge">
                        <span className="material-symbols-outlined">group</span>
                        {room.capacity} человек
                    </div>
                    <p className="description">{room.description}</p>
                    <div className="features-list">
                        {room.features.map(f => (
                            <Tag key={f.id}>{f.name}</Tag>
                        ))}
                    </div>
                </div>
                
                {isModalOpen && (
                    <div className="booking-panel">
                        <div className="panel-header">
                            <h3>{editingBookingId ? 'Изменить бронь' : 'Новое бронирование'}</h3>
                            <button className="close-btn" onClick={() => {
                                setIsModalOpen(false);
                                setEditingBookingId(null);
                                setSelectedSlots([]);
                                setBookingTitle('Встреча');
                                navigate(`/room/${id}`, { replace: true });
                            }}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleBookingSubmit}>
                             <div className="form-group">
                                <label>Название</label>
                                <input 
                                    className="simple-input"
                                    value={bookingTitle}
                                    onChange={e => setBookingTitle(e.target.value)}
                                />
                             </div>
                             {settings.enableHourlySlots && selectedSlots.length > 0 && (
                                <div className="slot-info-badge">
                                    <span className="material-icons">schedule</span>
                                    <span>
                                        Выбрано слотов: {selectedSlots.length} 
                                        {selectedSlots.length === 1 ? ' час' : selectedSlots.length < 5 ? ' часа' : ' часов'}
                                    </span>
                                </div>
                             )}
                             <div className="time-inputs">
                                <div className="form-group">
                                    <label>Начало</label>
                                    <input 
                                        type="time" 
                                        className="simple-input"
                                        value={modalStartTime}
                                        onChange={e => handleTimeInputChange('start', e.target.value)}
                                    />
                                </div>
                                <span className="dash">-</span>
                                <div className="form-group">
                                    <label>Конец</label>
                                    <input 
                                        type="time" 
                                        className="simple-input"
                                        value={modalEndTime}
                                        onChange={e => handleTimeInputChange('end', e.target.value)}
                                    />
                                </div>
                             </div>
                             <Button type="submit" variant="primary" className="w-full" disabled={isCollision}>
                                {editingBookingId ? 'Сохранить' : 'Забронировать'}
                             </Button>
                        </form>
                    </div>
                )}
            </aside>

            <main className="calendar-section">
                <div className="calendar-header">
                    <Button variant="secondary" onClick={() => {
                        const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d);
                    }} className="nav-btn">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </Button>
                    <h2>
                        {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </h2>
                    <Button variant="secondary" onClick={() => {
                        const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d);
                    }} className="nav-btn">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </Button>
                </div>

                {settings.enableHourlySlots ? (
                    <div className="timeline-container">
                        <HourlySlotTimeline
                            bookings={bookings}
                            selectedDate={selectedDate}
                            user={user}
                            onSlotSelect={handleSlotSelect}
                            onEventClick={handleSlotEventClick}
                            selectedSlots={selectedSlots}
                            allowMultipleSlots={settings.allowMultipleSlots}
                        />
                    </div>
                ) : (
                    <div className="timeline-container">
                    <div className="time-labels">
                        {timeSlots.map(hour => (
                            <div key={hour} className="time-label" style={{height: `${HOUR_HEIGHT}px`}}>
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    <div 
                        className="events-grid" 
                        ref={timelineRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        style={{height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px`}}
                    >
                        {timeSlots.map(hour => (
                            <div key={hour} className="grid-line" style={{height: `${HOUR_HEIGHT}px`, top: `${hour * HOUR_HEIGHT}px`}} />
                        ))}

                        {bookings.map(booking => {
                            if (booking.id === editingBookingId) return null;

                            const start = new Date(booking.start_time);
                            const end = new Date(booking.end_time);
                            const startMinutes = start.getHours() * 60 + start.getMinutes();
                            const durationMinutes = (end - start) / 1000 / 60;
                            const top = (startMinutes / 60) * HOUR_HEIGHT;
                            const height = (durationMinutes / 60) * HOUR_HEIGHT;
                            const isMyBooking = booking.user_id === user?.id;
                            const isAdmin = user?.role === 'ADMIN';

                            const showFullInfo = isMyBooking || isAdmin;
                            const canEdit = isMyBooking;

                            return (
                                <div 
                                    key={booking.id} 
                                    className={`event-card ${isMyBooking ? 'my-event' : 'other-event'} ${isAdmin && !isMyBooking ? 'admin-view' : ''}`}
                                    style={{ 
                                        top: `${top}px`, 
                                        height: `${height}px`,
                                        cursor: canEdit ? 'pointer' : (isAdmin ? 'default' : 'not-allowed')
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (canEdit) {
                                            setEditingBookingId(booking.id);
                                            setModalStartTime(formatTime(start));
                                            setModalEndTime(formatTime(end));
                                            setBookingTitle(booking.title || 'Встреча');
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    <div className="event-time">{formatTime(start)} - {formatTime(end)}</div>
                                    {showFullInfo ? (
                                        <>
                                            <div className="event-title">{booking.title || "Встреча"}</div>
                                            {isAdmin && !isMyBooking && booking.user && (
                                                <div className="event-user">
                                                    <span className="material-icons">person</span>
                                                    {booking.user.email}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="event-title">[Занято]</div>
                                    )}
                                </div>
                            );
                        })}
                        
                        {renderGhostEvent()}
                        {renderSelectionPreview()}
                    </div>
                </div>
                )}
            </main>
        </div>
    );
};

export default RoomPage;
