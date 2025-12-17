import React from 'react';
import './Button.scss';

const Button = ({ children, variant = 'primary', type = 'button', onClick, disabled, className = '' }) => {
  return (
    <button 
      type={type} 
      className={`btn btn--${variant} ${className}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;

