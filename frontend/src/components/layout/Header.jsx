import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import './Header.scss';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isAdmin = user && user.role === 'ADMIN';

  // Закрываем мобильное меню при изменении размера экрана
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Блокируем скролл при открытом мобильном меню
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="main-header">
      <div className="container header-container">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          Roomly
        </Link>
        
        {/* Кнопка гамбургер-меню для мобильных */}
        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        {/* Десктопная навигация и мобильное меню */}
        <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              {isAdmin && (
                <Link to="/admin" className="admin-link" onClick={closeMobileMenu}>
                  <Button variant="secondary" className="btn-sm btn-icon">
                    <span className="material-icons">build</span>
                    Настройки
                  </Button>
                </Link>
              )}
              <Link to="/my-bookings" onClick={closeMobileMenu}>
                  <Button variant="secondary" className="btn-sm">Мои брони</Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="btn-sm">
                Выйти
              </Button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" onClick={closeMobileMenu}>
                <Button variant="secondary" className="btn-sm">Войти</Button>
              </Link>
              <Link to="/register" onClick={closeMobileMenu}>
                <Button variant="primary" className="btn-sm">Регистрация</Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Оверлей для мобильного меню */}
        {mobileMenuOpen && (
          <div 
            className="mobile-menu-overlay" 
            onClick={closeMobileMenu}
          />
        )}
      </div>
    </header>
  );
};

export default Header;

