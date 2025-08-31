import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlus, FaTrash } from 'react-icons/fa';

const tableNodeStyle = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '3px',
  minWidth: '180px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const headerStyle = {
  backgroundColor: '#2c3e50',
  color: 'white',
  padding: '8px 10px',
  fontWeight: 'bold',
  textAlign: 'center',
  borderTopLeftRadius: '2px',
  borderTopRightRadius: '2px',
};

const addButtonStyle = {
  width: '100%',
  marginTop: '10px',
  padding: '5px',
  cursor: 'pointer',
  border: '1px dashed #ccc',
  backgroundColor: '#f9f9f9',
};

const DATA_TYPES = ['varchar', 'integer', 'double', 'datetime', 'date'];

function Column({ name, type, tableId, onNameChange, onTypeChange, onDelete, isLast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentName, setCurrentName] = useState(name);

  const handleNameChange = (e) => {
    setCurrentName(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false);
      if (currentName !== name && currentName.trim() !== '') {
        onNameChange(tableId, name, currentName);
      }
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (currentName !== name && currentName.trim() !== '') {
      onNameChange(tableId, name, currentName);
    }
  }

  const columnStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 10px',
    borderBottom: isLast ? 'none' : '1px solid #eee',
    fontSize: '14px'
  }

  const deleteButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#aaa',
    display: 'flex',
    alignItems: 'center',
    padding: '0 0 0 5px'
  }

  return (
    <div style={columnStyle}>
      {isEditing ? (
        <input 
          type="text" 
          value={currentName} 
          onChange={handleNameChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
          style={{ width: '100px' }}
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)} title="Double click to edit">{name}</span>
      )}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <select value={type} onChange={(e) => onTypeChange(tableId, name, e.target.value)} style={{ marginLeft: '10px', border: '1px solid #ccc', borderRadius: '3px' }}>
          {DATA_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
        </select>
        <button onClick={() => onDelete(tableId, name)} style={deleteButtonStyle} title="Delete column">
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default function TableNode({ data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tableName, setTableName] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleNameChange = (e) => {
    setTableName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    data.onTableNameChange(data.id, tableName);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  return (
    <div style={tableNodeStyle}>
      <Handle type="target" position={Position.Top} />
      <div style={{...headerStyle, padding: isEditing ? '4px' : '8px 10px'}} onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <input
            type="text"
            value={tableName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          data.label
        )}
      </div>
      <div>
        {Object.entries(data.columns || {}).map(([name, col], index, arr) => (
          <Column 
            key={name} 
            name={name} 
            type={col.dataType} 
            tableId={data.id} 
            onNameChange={data.onColumnNameChange} 
            onTypeChange={data.onColumnTypeChange}
            onDelete={data.onColumnDelete}
            isLast={index === arr.length - 1}
          />
        ))}
      </div>
      <button style={addButtonStyle} onClick={() => data.onAddColumn(data.id)}>+</button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
