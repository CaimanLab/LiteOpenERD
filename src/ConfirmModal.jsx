import React from 'react';
import { useTranslation } from 'react-i18next';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '5px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  textAlign: 'center',
};

const buttonContainerStyle = {
  marginTop: '20px',
};

const buttonStyle = {
  margin: '0 10px',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
};

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  const { t } = useTranslation();
  if (!isOpen) {
    return null;
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <p>{message}</p>
        <div style={buttonContainerStyle}>
          <button style={{...buttonStyle, backgroundColor: '#ccc'}} onClick={onCancel}>{t('common.cancel')}</button>
          <button style={{...buttonStyle, backgroundColor: '#e53e3e', color: 'white'}} onClick={onConfirm}>{t('common.confirm')}</button>
        </div>
      </div>
    </div>
  );
}
