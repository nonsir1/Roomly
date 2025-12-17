import React, { useMemo } from 'react';

const HourlySlotTimeline = ({ 
  bookings, 
  selectedDate, 
  user,
  onSlotSelect,
  onEventClick,
  selectedSlots = [],
  allowMultipleSlots 
}) => {
  const HOUR_HEIGHT = 60;

  const slots = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(selectedDate);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      const booking = bookings.find(b => {
        const bStart = new Date(b.start_time);
        const bEnd = new Date(b.end_time);
        
        return (bStart < slotEnd && bEnd > slotStart);
      });

      return {
        hour,
        start: slotStart,
        end: slotEnd,
        booking,
        isBooked: !!booking
      };
    });
  }, [bookings, selectedDate]);

  const handleSlotClick = (hour) => {
    if (!user) {
      alert('Войдите в систему для бронирования');
      return;
    }

    const slot = slots[hour];
    if (slot.isBooked) {
      return;
    }

    if (!allowMultipleSlots) {
      onSlotSelect([hour]);
    } else {
      const isSelected = selectedSlots.includes(hour);
      if (isSelected) {
        onSlotSelect(selectedSlots.filter(h => h !== hour));
      } else {
        onSlotSelect([...selectedSlots, hour].sort((a, b) => a - b));
      }
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const bookingsToRender = useMemo(() => {
    const rendered = [];
    const processedBookings = new Set();

    bookings.forEach(booking => {
      if (processedBookings.has(booking.id)) return;
      
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);
      
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const durationMinutes = (end - start) / 1000 / 60;
      
      const displayStartHour = Math.floor(startMinutes / 60);
      const displayEndHour = Math.ceil((startMinutes + durationMinutes) / 60);
      
      const top = displayStartHour * HOUR_HEIGHT;
      const height = (displayEndHour - displayStartHour) * HOUR_HEIGHT;

      rendered.push({
        booking,
        top,
        height,
        start,
        end
      });

      processedBookings.add(booking.id);
    });

    return rendered;
  }, [bookings, HOUR_HEIGHT]);

  return (
    <>
      <div className="time-labels">
        {slots.map(slot => (
          <div key={slot.hour} className="time-label" style={{ height: `${HOUR_HEIGHT}px` }}>
            {String(slot.hour).padStart(2, '0')}:00
          </div>
        ))}
      </div>

      <div className="events-grid slot-mode" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
        {slots.map(slot => (
          <div 
            key={`line-${slot.hour}`} 
            className="grid-line" 
            style={{ 
              height: `${HOUR_HEIGHT}px`, 
              top: `${slot.hour * HOUR_HEIGHT}px` 
            }} 
          />
        ))}

        {slots.map(slot => {
          if (slot.isBooked) return null;
          
          const isSelected = selectedSlots.includes(slot.hour);
          
          return (
            <div
              key={`slot-${slot.hour}`}
              className={`time-slot-clickable ${isSelected ? 'selected' : ''}`}
              style={{
                top: `${slot.hour * HOUR_HEIGHT}px`,
                height: `${HOUR_HEIGHT}px`
              }}
              onClick={() => handleSlotClick(slot.hour)}
            >
              {isSelected && (
                <div className="slot-selected-indicator">
                  <span className="material-icons">check_circle</span>
                </div>
              )}
            </div>
          );
        })}

        {bookingsToRender.map(({ booking, top, height, start, end }) => {
          const isMyBooking = booking.user_id === user?.id;
          // const isPast = end < new Date();
          const isAdmin = user?.role === 'ADMIN';
          const showFullInfo = isMyBooking || isAdmin;
          const canEdit = isMyBooking;

          return (
            <div
              key={`booking-${booking.id}`}
              className={`event-card ${isMyBooking ? 'my-event' : 'other-event'} ${isAdmin && !isMyBooking ? 'admin-view' : ''}`}
              style={{
                top: `${top}px`,
                height: `${height}px`,
                cursor: canEdit ? 'pointer' : (isAdmin ? 'default' : 'not-allowed')
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (canEdit && onEventClick) {
                  onEventClick(booking);
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

        {selectedSlots.length > 0 && (
          <div
            className="selection-preview-slots"
            style={{
              top: `${Math.min(...selectedSlots) * HOUR_HEIGHT}px`,
              height: `${(Math.max(...selectedSlots) - Math.min(...selectedSlots) + 1) * HOUR_HEIGHT}px`
            }}
          />
        )}
      </div>
    </>
  );
};

export default HourlySlotTimeline;
