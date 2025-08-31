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
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <foreignObject
            width={60}
            height={40}
            x={labelX - 30}
            y={labelY - 20}
            className="edgebutton-foreignobject"
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <body xmlns="http://www.w3.org/1999/xhtml">
              <button 
                className="edgebutton" 
                onClick={() => handleCardinalityChange(id, data.cardinality)}
                title="Click to change cardinality"
              >
                {data.cardinality?.source || '1'}:{data.cardinality?.target || 'N'}
              </button>
            </body>
          </foreignObject>

          <foreignObject
            width={20}
            height={20}
            x={targetX - 10}
            y={targetY - 30}
            className="edgebutton-foreignobject"
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <body xmlns="http://www.w3.org/1999/xhtml">
              <button className="edgebutton" onClick={(event) => { event.stopPropagation(); data.onEdgeDelete(id); }}>
                <FaTrash />
              </button>
            </body>
          </foreignObject>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
