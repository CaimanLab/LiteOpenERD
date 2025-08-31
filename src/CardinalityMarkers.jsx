const CrowFootMany = () => (
  <marker
    id="crow-many"
    viewBox="-5 -5 10 10"
    refX="0"
    refY="0"
    markerWidth="12.5"
    markerHeight="12.5"
    orient="auto-start-reverse"
  >
    <path d="M-4,-4 L0,0 L-4,4" stroke="#2c3e50" strokeWidth="1.5" fill="none" />
  </marker>
);

const CrowFootOne = () => (
  <marker
    id="crow-one"
    viewBox="-5 -5 10 10"
    refX="0"
    refY="0"
    markerWidth="12.5"
    markerHeight="12.5"
    orient="auto-start-reverse"
  >
    <path d="M-4,-4 L-4,4" stroke="#2c3e50" strokeWidth="1.5" fill="none" />
  </marker>
);

export const getMarkerEnd = (cardinality) => {
  if (cardinality === 'N' || cardinality === 'M') {
    return 'url(#crow-many)';
  }
  return 'url(#crow-one)';
};

export const getMarkerStart = (cardinality) => {
  if (cardinality === 'N' || cardinality === 'M') {
    return 'url(#crow-many)';
  }
  return 'url(#crow-one)';
};

export const CardinalityMarkers = () => (
  <svg>
    <defs>
      <CrowFootOne />
      <CrowFootMany />
    </defs>
  </svg>
);

export const handleCardinalityChange = (id, currentCardinality, onCardinalityChange) => {
  let next;
  const current = `${currentCardinality.source}:${currentCardinality.target}`;

  if (current === '1:1') {
    next = { source: '1', target: 'N' };
  } else if (current === '1:N') {
    next = { source: 'N', target: 'M' };
  } else {
    next = { source: '1', target: '1' };
  }
  onCardinalityChange(id, next);
};
