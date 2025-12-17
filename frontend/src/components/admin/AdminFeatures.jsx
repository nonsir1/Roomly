import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import './AdminFeatures.scss';

const AdminFeatures = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchFeatures = async () => {
    try {
      const response = await api.get('/features/');
      setFeatures(response.data);
    } catch (error) {
      console.error('Failed to fetch features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleEdit = (feature) => {
    setEditingId(feature.id);
    setEditingName(feature.name);
  };

  const handleSaveEdit = async (featureId) => {
    if (!editingName.trim()) {
      alert('Название тега не может быть пустым');
      return;
    }

    try {
      await api.put(`/admin/features/${featureId}`, { name: editingName });
      await fetchFeatures();
      setEditingId(null);
      setEditingName('');
    } catch (error) {
      alert(error.response?.data?.detail || 'Не удалось обновить тег');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (featureId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот тег?')) {
      return;
    }

    try {
      await api.delete(`/admin/features/${featureId}`);
      await fetchFeatures();
    } catch (error) {
      alert(error.response?.data?.detail || 'Не удалось удалить тег');
    }
  };

  const handleAddFeature = async () => {
    if (!newFeatureName.trim()) {
      alert('Название тега не может быть пустым');
      return;
    }

    try {
      await api.post('/features/', { name: newFeatureName });
      await fetchFeatures();
      setNewFeatureName('');
      setIsAdding(false);
    } catch (error) {
      alert(error.response?.data?.detail || 'Не удалось добавить тег');
    }
  };

  if (loading) {
    return <div className="admin-features__loading">Загрузка...</div>;
  }

  return (
    <div className="admin-features">
      <div className="admin-features__header">
        <h2>Управление тегами</h2>
        <Button onClick={() => setIsAdding(true)} variant="primary">
          <span className="material-icons">add</span>
          Добавить тег
        </Button>
      </div>

      {isAdding && (
        <div className="admin-features__add-form">
          <Input
            value={newFeatureName}
            onChange={(e) => setNewFeatureName(e.target.value)}
            placeholder="Название нового тега"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddFeature();
              }
            }}
          />
          <div className="admin-features__add-actions">
            <Button onClick={handleAddFeature} variant="primary" className="btn-sm">
              Сохранить
            </Button>
            <Button 
              onClick={() => {
                setIsAdding(false);
                setNewFeatureName('');
              }} 
              variant="secondary" 
              className="btn-sm"
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      <div className="admin-features__list">
        {features.length === 0 ? (
          <p className="admin-features__empty">Нет тегов</p>
        ) : (
          features.map(feature => (
            <div key={feature.id} className="admin-features__item">
              {editingId === feature.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(feature.id);
                      }
                    }}
                  />
                  <div className="admin-features__item-actions">
                    <Button 
                      onClick={() => handleSaveEdit(feature.id)} 
                      variant="primary" 
                      className="btn-sm"
                    >
                      <span className="material-icons">check</span>
                    </Button>
                    <Button 
                      onClick={handleCancelEdit} 
                      variant="secondary" 
                      className="btn-sm"
                    >
                      <span className="material-icons">close</span>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <span className="admin-features__item-name">{feature.name}</span>
                  <div className="admin-features__item-actions">
                    <Button 
                      onClick={() => handleEdit(feature)} 
                      variant="secondary" 
                      className="btn-sm"
                    >
                      <span className="material-icons">edit</span>
                      Редактировать
                    </Button>
                    <Button 
                      onClick={() => handleDelete(feature.id)} 
                      variant="danger" 
                      className="btn-sm"
                    >
                      <span className="material-icons">delete</span>
                      Удалить
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminFeatures;

