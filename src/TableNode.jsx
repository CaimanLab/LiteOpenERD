import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlus, FaTrash, FaKey } from 'react-icons/fa';

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

function Column({ name, type, tableId, onNameChange, onTypeChange, onDelete, onColumnPropertyChange, isLast, columnData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    fontSize: '14px',
    cursor: 'pointer'
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

  const detailsStyle = {
    backgroundColor: '#f9f9f9',
    padding: '8px 10px',
    fontSize: '12px',
    borderBottom: isLast ? 'none' : '1px solid #eee',
  };

  const labelStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    cursor: 'pointer' 
  };

  const isPrimaryKey = columnData?.constraints?.some(c => c.type === 'PRIMARY KEY');
  const isUnique = columnData?.constraints?.some(c => c.type === 'UNIQUE');
  const isNotNull = columnData?.extra?.includes('Not Null');
  const isAutoIncrement = columnData?.extra?.includes('Auto Increment');

  return (
    <>
      <div style={columnStyle} onClick={() => setIsExpanded(!isExpanded)}>
        {isEditing ? (
          <input 
            type="text" 
            value={currentName} 
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()} // Prevent closing the details view
            autoFocus
            style={{ width: '100px' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {isPrimaryKey && <FaKey title="Primary Key" style={{ color: '#f0ad4e' }}/>}
            <span onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }} title="Double click to edit">{name}</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <select 
            value={type} 
            onChange={(e) => onTypeChange(tableId, name, e.target.value)} 
            onClick={(e) => e.stopPropagation()} // Prevent closing the details view
            style={{ marginLeft: '10px', border: '1px solid #ccc', borderRadius: '3px' }}
          >
            {DATA_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
          </select>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(tableId, name); }} 
            style={deleteButtonStyle} 
            title="Delete column"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div style={detailsStyle} onClick={(e) => e.stopPropagation()}>
          <label style={labelStyle}><input type="checkbox" checked={isNotNull} onChange={(e) => onColumnPropertyChange(tableId, name, 'Not Null', e.target.checked)} /> Not Null</label>
          <label style={labelStyle}><input type="checkbox" checked={isAutoIncrement} onChange={(e) => onColumnPropertyChange(tableId, name, 'Auto Increment', e.target.checked)} /> Auto Increment</label>
          <label style={labelStyle}><input type="checkbox" checked={isPrimaryKey} onChange={(e) => onColumnPropertyChange(tableId, name, 'PRIMARY KEY', e.target.checked)} /> PRIMARY KEY</label>
          <label style={labelStyle}><input type="checkbox" checked={isUnique} onChange={(e) => onColumnPropertyChange(tableId, name, 'UNIQUE', e.target.checked)} /> UNIQUE</label>
        </div>
      )}
    </>
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
            columnData={col}
            onNameChange={data.onColumnNameChange} 
            onTypeChange={data.onColumnTypeChange}
            onDelete={data.onColumnDelete}
            onColumnPropertyChange={data.onColumnPropertyChange}
            isLast={index === arr.length - 1}
          />
        ))}
      </div>
      <button style={addButtonStyle} onClick={() => data.onAddColumn(data.id)}>+</button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
