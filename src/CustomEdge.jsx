import React from 'react';
import { getSmoothStepPath, EdgeLabelRenderer } from 'reactflow';
import { FaTrash } from 'react-icons/fa';

const foreignObjectSize = 40;

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
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

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrow)"
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
          <button style={buttonStyle} onClick={() => data.onEdgeDelete(id)}>
            <FaTrash />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
