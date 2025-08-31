import React, { useRef } from 'react';
import { FaPlus, FaProjectDiagram, FaFolderOpen, FaDatabase, FaSave, FaGlobe } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

const toolbarStyle = {
  position: 'fixed',
  top: '65px',
  left: '15px',
  zIndex: 4,
  backgroundColor: 'white',
  padding: '8px 12px',
  borderRadius: '8px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  maxWidth: '90%',
  border: '1px solid #e0e0e0'
};

const buttonStyle = {
  padding: '6px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  border: '1px solid #e0e0e0',
  backgroundColor: 'white',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
};

const dividerStyle = {
  width: '1px',
  height: '24px',
  backgroundColor: '#e0e0e0',
  margin: '0 4px'
};

// Button hover styles are now handled inline

export default function Toolbar({ onAddTable, onAddRelation, isRelationMode, onExport, onImport, onExportSql, fileInputRef, workspaceSize, onWorkspaceSizeChange }) {
  const { t, i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = React.useState(false);
  const languageMenuRef = React.useRef(null);

  // Cerrar el menú al hacer clic fuera de él
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setShowLanguageMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div style={toolbarStyle}>
      {/* Diagram Actions */}
      <button 
        style={{
          ...buttonStyle,
          backgroundColor: '#f0f7ff',
          borderColor: '#b8d8ff',
          color: '#0066cc'
        }} 
        onClick={onAddTable} 
        title={t('toolbar.newTable')}
      >
        <FaPlus style={{ fontSize: '14px' }} /> {t('toolbar.newTable')}
      </button>
      
      <button 
        style={{
          ...buttonStyle,
          backgroundColor: isRelationMode ? '#e6f7ff' : 'white',
          borderColor: isRelationMode ? '#91d5ff' : '#e0e0e0',
          color: isRelationMode ? '#0050b3' : '#333'
        }}
        onClick={onAddRelation}
        title={t('toolbar.addRelation')}
      >
        <FaProjectDiagram style={{ fontSize: '14px' }} /> 
        {isRelationMode ? t('common.selecting') : t('toolbar.addRelation')}
      </button>

      <div style={dividerStyle} />

      {/* File Actions */}
      <button 
        style={{
          ...buttonStyle,
          backgroundColor: '#f6ffed',
          borderColor: '#b7eb8f',
          color: '#237804'
        }} 
        onClick={handleImportClick} 
        title={t('toolbar.import')}
      >
        <FaFolderOpen style={{ fontSize: '14px' }} /> {t('toolbar.import')}
      </button>
      
      <button 
        style={{
          ...buttonStyle,
          backgroundColor: '#f6ffed',
          borderColor: '#b7eb8f',
          color: '#237804'
        }} 
        onClick={() => onExport('full')}
        title={t('toolbar.export')}
      >
        <FaSave style={{ fontSize: '14px' }} /> {t('toolbar.export')}
      </button>

      <div style={dividerStyle} />

      {/* Export Actions */}
      <button 
        style={{
          ...buttonStyle,
          backgroundColor: '#fff7e6',
          borderColor: '#ffd591',
          color: '#ad4e00'
        }} 
        onClick={onExportSql}
        title={t('toolbar.exportSQL')}
      >
        <FaDatabase style={{ fontSize: '14px' }} /> {t('toolbar.exportSQL')}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={onImport}
      />

      <div style={dividerStyle} />

      {/* Workspace Size Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="text"
          value={workspaceSize.width}
          onChange={(e) => onWorkspaceSizeChange('width', e.target.value)}
          style={{
            width: '60px',
            padding: '4px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
          title={`${t('toolbar.width')} (100%, 1200px, 80vw)`}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          type="text"
          value={workspaceSize.height}
          onChange={(e) => onWorkspaceSizeChange('height', e.target.value)}
          style={{
            width: '60px',
            padding: '4px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '12px'
          }}
          title={`${t('toolbar.height')} (100%, 800px, 90vh)`}
        />
      </div>

      <div style={dividerStyle} />

      {/* Language Selector */}
      <div style={{ position: 'relative', display: 'inline-block' }} ref={languageMenuRef}>
        <button 
          style={{
            ...buttonStyle,
            backgroundColor: showLanguageMenu ? '#f0e6ff' : '#f9f0ff',
            borderColor: showLanguageMenu ? '#b37feb' : '#d3adf7',
            color: '#722ed1',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          title={t('toolbar.changeLanguage')}
        >
          <FaGlobe style={{ fontSize: '14px' }} />
          {i18n.language === 'es' ? '🇪🇸' : '🇬🇧'}
        </button>
        {showLanguageMenu && (
          <div style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '4px',
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            zIndex: 10,
            minWidth: '120px'
          }}>
          <div 
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: i18n.language === 'es' ? '#f0f5ff' : 'white',
              color: i18n.language === 'es' ? '#2f54eb' : '#333',
              ':hover': {
                backgroundColor: '#f0f5ff'
              }
            }}
            onClick={() => {
              i18n.changeLanguage('es');
              setShowLanguageMenu(false);
            }}
          >
            🇪🇸 Español
          </div>
          <div 
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              backgroundColor: i18n.language === 'en' ? '#f0f5ff' : 'white',
              color: i18n.language === 'en' ? '#2f54eb' : '#333',
              ':hover': {
                backgroundColor: '#f0f5ff'
              }
            }}
            onClick={() => {
              i18n.changeLanguage('en');
              setShowLanguageMenu(false);
            }}
          >
            🇬🇧 English
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
