import React from 'react';
import './Input.scss';

const Input = ({ label, type = 'text', name, value, onChange, placeholder, error, required = false }) => {
  return (
    <div className={`input-group ${error ? 'input-group--error' : ''}`}>
      {label && <label className="input-label" htmlFor={name}>{label} {required && '*'}</label>}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        required={required}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;

