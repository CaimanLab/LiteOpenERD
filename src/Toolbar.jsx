import React, { useRef } from 'react';
import { FaPlus, FaProjectDiagram, FaFolderOpen, FaDatabase, FaSave } from 'react-icons/fa';

const toolbarStyle = {
  position: 'absolute',
  top: '15px',
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

const buttonHoverStyle = {
  ...buttonStyle,
  '&:hover': {
    backgroundColor: '#f5f5f5',
    borderColor: '#999',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

export default function Toolbar({ onAddTable, onAddRelation, isRelationMode, onExport, onImport, onExportSql }) {
  const importInputRef = React.useRef(null);

  const handleImportClick = () => {
    importInputRef.current.click();
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
        title="Crear Tabla"
      >
        <FaPlus style={{ fontSize: '14px' }} /> Tabla
      </button>
      
      <button 
        style={{
          ...buttonStyle,
          backgroundColor: isRelationMode ? '#e6f7ff' : 'white',
          borderColor: isRelationMode ? '#91d5ff' : '#e0e0e0',
          color: isRelationMode ? '#0050b3' : '#333'
        }}
        onClick={onAddRelation}
        title="Crear Relación"
      >
        <FaProjectDiagram style={{ fontSize: '14px' }} /> 
        {isRelationMode ? 'Seleccionando...' : 'Relación'}
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
        title="Abrir diagrama guardado"
      >
        <FaFolderOpen style={{ fontSize: '14px' }} /> Abrir
      </button>
      
      <button 
        style={{
          ...buttonStyle,
          backgroundColor: '#f6ffed',
          borderColor: '#b7eb8f',
          color: '#237804'
        }} 
        onClick={() => onExport('full')}
        title="Guardar diagrama"
      >
        <FaSave style={{ fontSize: '14px' }} /> Guardar
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
        title="Exportar a SQL"
      >
        <FaDatabase style={{ fontSize: '14px' }} /> Exportar SQL
      </button>

      <input type="file" ref={importInputRef} style={{ display: 'none' }} onChange={onImport} accept=".json" />
    </div>
  );
}
