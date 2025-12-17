import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '../ui/Button';
import Tag from '../ui/Tag';
import './RoomFilter.scss';

const RoomFilter = ({ onFilter }) => {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedTags, setSelectedTags] = useState(searchParams.getAll('tags') || []);
    
    const urlStart = searchParams.get('start_time');
    const urlEnd = searchParams.get('end_time');
    
    const [date, setDate] = useState(() => {
        if (urlStart) return urlStart.split('T')[0];
        return '';
    });
    
    const [timeStart, setTimeStart] = useState(() => {
        if (urlStart) return urlStart.split('T')[1]?.slice(0, 5);
        return '';
    });
    
    const [timeEnd, setTimeEnd] = useState(() => {
        if (urlEnd) return urlEnd.split('T')[1]?.slice(0, 5);
        return '';
    });
    
    const [isTagsOpen, setIsTagsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsTagsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let startDateTime = null;
        let endDateTime = null;

        if (date && timeStart && timeEnd) {
            startDateTime = new Date(`${date}T${timeStart}`).toISOString();
            endDateTime = new Date(`${date}T${timeEnd}`).toISOString();
        }

        onFilter({
            search: search || undefined, 
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            start_time: startDateTime,
            end_time: endDateTime
        });
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const tags = ["Проектор", "Маркерная доска", "TV", "Кондиционер", "Кофемашина", "Звукоизоляция", "Apple TV", "Видеосвязь"];

    return (
        <form className="room-filter-inline" onSubmit={handleSubmit}>
            <div className="input-wrapper search-wrapper">
                <span className="material-symbols-outlined icon">search</span>
                <input 
                    type="text" 
                    placeholder="Название..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="filter-input"
                />
            </div>
            
            <div className="input-wrapper tags-wrapper" ref={dropdownRef}>
                 <div className="tags-input-area" onClick={() => setIsTagsOpen(!isTagsOpen)}>
                    {selectedTags.length === 0 ? (
                        <span className="placeholder">Выберите удобства...</span>
                    ) : (
                        <div className="selected-tags">
                            {selectedTags.map(tag => (
                                <Tag 
                                    key={tag} 
                                    onDelete={() => toggleTag(tag)}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {tag}
                                </Tag>
                            ))}
                        </div>
                    )}
                    <span className="material-symbols-outlined arrow">expand_more</span>
                 </div>

                 {isTagsOpen && (
                     <div className="tags-dropdown">
                         {tags.map(tag => (
                             <div 
                                key={tag} 
                                className={`dropdown-item ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                onClick={() => toggleTag(tag)}
                             >
                                 {tag}
                                 {selectedTags.includes(tag) && <span className="material-symbols-outlined check">check</span>}
                             </div>
                         ))}
                     </div>
                 )}
            </div>

            <div className="input-wrapper time-wrapper">
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="filter-input date-input"
                />
                <input 
                    type="time" 
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="filter-input time-input"
                />
                <span className="separator">-</span>
                <input 
                    type="time" 
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="filter-input time-input"
                />
            </div>
            
            <Button type="submit" variant="primary">
                Найти
            </Button>
        </form>
    );
};

export default RoomFilter;
