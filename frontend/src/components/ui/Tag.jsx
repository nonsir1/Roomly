import React from 'react';
import './Tag.scss';

const Tag = ({ children, onDelete, onClick, className = '' }) => {
    return (
        <span 
            className={`ui-tag ${className} ${onDelete ? 'has-delete' : ''}`} 
            onClick={onClick}
        >
            {children}
            {onDelete && (
                <button 
                    type="button" 
                    className="delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                >
                    ×
                </button>
            )}
        </span>
    );
};

export default Tag;

