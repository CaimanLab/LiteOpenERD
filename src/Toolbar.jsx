import React, { useRef } from 'react';
import { FaPlus, FaProjectDiagram, FaFileExport, FaFileImport } from 'react-icons/fa';

const toolbarStyle = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  zIndex: 4,
  backgroundColor: 'white',
  padding: '10px',
  borderRadius: '5px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
};

const buttonStyle = {
  margin: '0 5px',
  padding: '8px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: '1px solid #ccc',
  backgroundColor: 'white',
  borderRadius: '4px'
};

export default function Toolbar({ onAddTable, onAddRelation, isRelationMode, onExport, onImport }) {
  const importInputRef = React.useRef(null);

  const handleImportClick = () => {
    importInputRef.current.click();
  };

  return (
    <div style={toolbarStyle}>
      <button style={buttonStyle} onClick={onAddTable} title="Crear Tabla"><FaPlus /> Tabla</button>
      <button 
        style={{...buttonStyle, backgroundColor: isRelationMode ? '#ddd' : 'white'}}
        onClick={onAddRelation}
        title="Crear Relación"
      >
        <FaProjectDiagram /> {isRelationMode ? 'Seleccionando...' : 'Relación'}
      </button>
      <button style={buttonStyle} onClick={onExport} title="Exportar JSON"><FaFileExport /> Exportar</button>
      <input type="file" ref={importInputRef} style={{ display: 'none' }} onChange={onImport} accept=".json" />
      <button style={buttonStyle} onClick={handleImportClick} title="Importar JSON"><FaFileImport /> Importar</button>
    </div>
  );
}
