import React from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { FaTrash } from 'react-icons/fa';
import { getMarkerEnd, getMarkerStart, handleCardinalityChange as cycleCardinality } from './CardinalityMarkers';

const foreignObjectSize = 40;

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, data }) {
    const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const buttonStyle = {
    cursor: 'pointer',
    background: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    lineHeight: '1'
  };

    const handleCardinalityChange = (id, currentCardinality) => {
    cycleCardinality(id, currentCardinality, data.onCardinalityChange);
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={getMarkerEnd(data.cardinality?.target)}
        markerStart={getMarkerStart(data.cardinality?.source)}
      />
      <EdgeLabelRenderer>
        <>
          {/* Cardinality Button */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button 
              className="edgebutton"
              style={buttonStyle}
              onClick={() => handleCardinalityChange(id, data.cardinality)}
              title="Click to change cardinality"
            >
              {data.cardinality?.source || '1'}:{data.cardinality?.target || 'N'}
            </button>
          </div>

          {/* Delete Button */}
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -150%) translate(${targetX}px,${targetY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button 
              className="edgebutton"
              style={buttonStyle}
              onClick={(event) => { event.stopPropagation(); data.onEdgeDelete(id); }}
            >
              <FaTrash size={12} />
            </button>
          </div>
        </>
      </EdgeLabelRenderer>
    </>
  );
}
