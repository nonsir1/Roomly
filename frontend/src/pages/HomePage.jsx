import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import RoomCard from '../components/RoomCard';
import RoomFilter from '../components/search/RoomFilter';
import { useAuth } from '../context/AuthContext';
import '../styles/home.scss';

const HomePage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  
  const [filters, setFilters] = useState(() => {
      const f = {};
      if (searchParams.get('search')) f.search = searchParams.get('search');
      if (searchParams.get('start_time')) f.start_time = searchParams.get('start_time');
      if (searchParams.get('end_time')) f.end_time = searchParams.get('end_time');
      const tags = searchParams.getAll('tags');
      if (tags.length > 0) f.tags = tags;
      return f;
  });
  
  const loadingRef = useRef(false);
  const observerTarget = useRef(null);
  
  const LIMIT = 10;

  const fetchRooms = useCallback(async (offset, currentFilters = {}) => {
      if (offset === 0) {
          loadingRef.current = false;
          setLoading(false);
      }

      if (loadingRef.current) return;
      // console.log('fetching rooms, offset:', offset);
      
      loadingRef.current = true;
      setLoading(true);
      
      try {
          const params = new URLSearchParams({
              skip: offset,
              limit: LIMIT,
              ...currentFilters
          });

          if (!currentFilters.search) params.delete('search');
          if (currentFilters.tags && currentFilters.tags.length > 0) {
              params.delete('tags');
              currentFilters.tags.forEach(tag => params.append('tags', tag));
          } else {
            params.delete('tags');
          }
          
          if (!currentFilters.start_time) params.delete('start_time');
          if (!currentFilters.end_time) params.delete('end_time');

          const response = await api.get(`/rooms/?${params.toString()}`);
          
          if (response.data.length < LIMIT) {
              setHasMore(false);
          }
          // console.log('loaded:', response.data.length, 'rooms');
          
          setRooms(prev => {
             if (offset === 0) return response.data;

             const newRooms = response.data.filter(
                 newRoom => !prev.some(existingRoom => existingRoom.id === newRoom.id)
             );
             return [...prev, ...newRooms];
          });
      } catch (error) {
          console.error("Error loading rooms:", error);
          setError(true);
      } finally {
          loadingRef.current = false;
          setLoading(false);
      }
  }, []);

  const handleFilter = (newFilters) => {
      setFilters(newFilters);
      setRooms([]);
      setHasMore(true);
      // setError(false);
      
      const params = new URLSearchParams();
      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.start_time) params.set('start_time', newFilters.start_time);
      if (newFilters.end_time) params.set('end_time', newFilters.end_time);
      if (newFilters.tags) {
          newFilters.tags.forEach(t => params.append('tags', t));
      }
      setSearchParams(params);

      fetchRooms(0, newFilters);
  };

  useEffect(() => {
    fetchRooms(0, filters);
  }, [fetchRooms]);

  useEffect(() => {
      const observer = new IntersectionObserver(
          entries => {
              const target = entries[0];
              if (target.isIntersecting && hasMore && !loadingRef.current && !error) {
                  fetchRooms(rooms.length, filters);
              }
          },
          { 
              threshold: 0.1,
              rootMargin: '100px'
          }
      );
      
      const currentTarget = observerTarget.current;
      if (currentTarget) {
          observer.observe(currentTarget);
      }
      
      return () => {
          if (currentTarget) {
              observer.unobserve(currentTarget);
          }
      };
  }, [hasMore, error, rooms.length, fetchRooms, filters]);

  return (
    <div className="container home-page">
      <div className="hero-section">
        <h1>
            {user ? `Привет, ${user.email.split('@')[0]}!` : 'Бронируй эффективно'}
        </h1>
        <p>Найди идеальное пространство для встречи за пару кликов.</p>
      </div>

      <RoomFilter onFilter={handleFilter} />

      <section className="rooms-grid">
        {rooms.map(room => (
          <RoomCard key={room.id} room={room} />
        ))}
      </section>

      {error && (
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <p style={{ color: 'red', marginBottom: '1rem' }}>Не удалось загрузить комнаты.</p>
            <button 
                className="btn btn--primary" 
                onClick={() => { setError(false); fetchRooms(rooms.length, filters); }}
            >
                Попробовать снова
            </button>
        </div>
      )}
      
      {hasMore && !error && rooms.length > 0 && (
          <div ref={observerTarget} className="loading-sentinel">
              {loading && <div className="loader">Загрузка комнат...</div>}
          </div>
      )}
      
      {loading && rooms.length === 0 && (
           <div className="loader" style={{textAlign: 'center', marginTop: '2rem'}}>Загрузка...</div>
      )}
      
      {!hasMore && rooms.length > 0 && (
          <p className="end-message">Вы посмотрели все комнаты 🎉</p>
      )}
    </div>
  );
};

export default HomePage;
