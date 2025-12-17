import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import Tag from './ui/Tag';
import './RoomCard.scss';

const RoomCard = ({ room }) => {
  return (
    <div className="room-card">
      <div className="room-image-wrapper">
        <img 
            src={room.image_url || 'https://via.placeholder.com/400x300?text=Room'} 
            alt={room.name} 
            className="room-image" 
        />
        <div className="room-capacity">
            <span className="material-symbols-outlined icon">group</span>
            {room.capacity}
        </div>
      </div>
      
      <div className="room-content">
        <h3 className="room-title">{room.name}</h3>
        
        <div className="room-features">
            {room.features && room.features.slice(0, 3).map(feature => (
                <Tag key={feature.id}>{feature.name}</Tag>
            ))}
             {room.features && room.features.length > 3 && (
                <Tag>+{room.features.length - 3}</Tag>
            )}
        </div>
        
        <Link to={`/room/${room.id}${window.location.search}`}>
            <Button variant="secondary" className="w-full">
                Посмотреть расписание
            </Button>
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;

