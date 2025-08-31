import { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import './App.css';
import Toolbar from './Toolbar';
import TableNode from './TableNode';
import CustomEdge from './CustomEdge';
import { CardinalityMarkers } from './CardinalityMarkers';
import ConfirmModal from './ConfirmModal';

const nodeTypes = { table: TableNode };
const edgeTypes = { custom: CustomEdge };
const initialDiagram = {
  tables: {},
  relations: {},
};

// Function to load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('diagramState');
    if (serializedState === null) {
      return initialDiagram;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state", err);
    return initialDiagram;
  }
};

function App() {
    const [diagram, setDiagram] = useState(loadState);
  const [relationCreation, setRelationCreation] = useState({ active: false, source: null });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, edgeId: null });
  const [deleteTableConfirmation, setDeleteTableConfirmation] = useState({ isOpen: false, tableId: null });
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Save state to localStorage whenever diagram changes
  useEffect(() => {
    try {
      const serializedState = JSON.stringify(diagram);
      localStorage.setItem('diagramState', serializedState);
    } catch (err) {
      console.error("Could not save state", err);
    }
  }, [diagram]);

  // Convert our diagram state to ReactFlow nodes and edges
  useEffect(() => {
    const newNodes = Object.values(diagram.tables).map(table => ({
      id: table.objectId,
      type: 'table',
      position: table.metadata.position,
      data: {
        id: table.objectId,
        label: table.tableName,
        onTableNameChange: handleTableNameChange,
        onAddColumn: handleAddColumn,
          onColumnNameChange: handleColumnNameChange,
          onColumnTypeChange: handleColumnTypeChange,
          onColumnDelete: handleColumnDelete,
                    onColumnPropertyChange: handleColumnPropertyChange,
          onDeleteTable: requestTableDelete,
        columns: table.columnas
      },
    }));
    const newEdges = Object.values(diagram.relations).map(relation => ({
      id: relation.objectId,
      source: relation.relatedTables[0].objectId,
      target: relation.relatedTables[1].objectId,
      type: 'custom',
                  data: { 
        onEdgeDelete: requestEdgeDelete,
        onCardinalityChange: handleCardinalityChange,
        cardinality: relation.cardinality
      },
    }));
    setNodes(newNodes);
    setEdges(newEdges);
  }, [diagram, setNodes, setEdges]);

    const onNodesChange = useCallback((changes) => {
    onNodesChangeInternal(changes);

    setDiagram(currentDiagram => {
      const nextTables = { ...currentDiagram.tables };
      let changed = false;

      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          const table = nextTables[change.id];
          if (table) {
            table.metadata.position = change.position;
            changed = true;
          }
        }
      });

      if (changed) {
        return { ...currentDiagram, tables: nextTables };
      }
      return currentDiagram;
    });
  }, [onNodesChangeInternal, setDiagram]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (!relationCreation.active) return;

    if (!relationCreation.source) {
      setRelationCreation({ ...relationCreation, source: node.id });
      // Optionally, add visual feedback for the source node
    } else {
      const newRelationId = uuidv4();
              const sourceTable = diagram.tables[relationCreation.source];
        const targetTable = diagram.tables[node.id];

        // Find primary key of target table
        const primaryKey = Object.keys(targetTable.columnas).find(colName => 
          targetTable.columnas[colName].constraints?.some(c => c.type === 'PRIMARY KEY')
        ) || 'id'; // fallback to 'id'

        const fkColumnName = `${targetTable.tableName.toLowerCase()}_${primaryKey}`;

        // Add FK column to source table
        const newSourceTableColumns = {
          ...sourceTable.columnas,
          [fkColumnName]: {
            dataType: targetTable.columnas[primaryKey]?.dataType || 'integer',
            constraints: [{ type: 'FOREIGN KEY', references: targetTable.tableName, on: primaryKey }],
            extra: ['Not Null']
          }
        };

        const newSourceTable = { ...sourceTable, columnas: newSourceTableColumns };

        const newRelation = {
          objectId: newRelationId,
          relationName: `Rel_${relationCreation.source}_${node.id}`,
                    cardinality: { source: '1', target: 'N' }, // Default to One-to-Many
          relatedTables: [{ objectId: relationCreation.source }, { objectId: node.id }],
          fkColumn: fkColumnName,
          metadata: {},
        };

        setDiagram(prev => ({
          ...prev,
          tables: { ...prev.tables, [relationCreation.source]: newSourceTable },
          relations: {
            ...prev.relations,
            [newRelationId]: newRelation,
          },
        }));

        setRelationCreation({ active: false, source: null });


      setRelationCreation({ active: false, source: null });
    }
  }, [relationCreation, setDiagram]);

  const toggleRelationMode = () => {
    setRelationCreation(prev => ({ active: !prev.active, source: null }));
  };

    const handleTableNameChange = (tableId, newName) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      if (newTables[tableId]) {
        newTables[tableId].tableName = newName;
      }
      return { ...prev, tables: newTables };
    });
  };

      const handleColumnNameChange = (tableId, oldName, newName) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const table = newTables[tableId];
      if (table && table.columnas[oldName] && !table.columnas[newName]) {
        table.columnas[newName] = table.columnas[oldName];
        delete table.columnas[oldName];
      }
      return { ...prev, tables: newTables };
    });
  };

  const handleColumnTypeChange = (tableId, columnName, newType) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const table = newTables[tableId];
      if (table && table.columnas[columnName]) {
        table.columnas[columnName].dataType = newType;
      }
      return { ...prev, tables: newTables };
    });
  };

    const handleColumnDelete = (tableId, columnName) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const table = newTables[tableId];
      if (table && table.columnas[columnName]) {
        delete table.columnas[columnName];
      }
      return { ...prev, tables: newTables };
    });
  };

    const handleColumnPropertyChange = (tableId, columnName, property, value) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const column = newTables[tableId]?.columnas[columnName];
      if (!column) return prev;

      const constraints = new Set(column.constraints?.map(c => c.type) || []);
      const extras = new Set(column.extra || []);

      switch (property) {
        case 'PRIMARY KEY':
        case 'UNIQUE':
          value ? constraints.add(property) : constraints.delete(property);
          column.constraints = Array.from(constraints).map(type => ({ type }));
          break;
        case 'Not Null':
        case 'Auto Increment':
          value ? extras.add(property) : extras.delete(property);
          column.extra = Array.from(extras);
          break;
      }

      return { ...prev, tables: newTables };
    });
  };

  const handleAddColumn = (tableId) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const table = newTables[tableId];
      if (table) {
        const newColumnName = `columna_${Object.keys(table.columnas).length + 1}`;
        table.columnas[newColumnName] = {
          dataType: "varchar",
          extra: [],
          constraints: []
        };
      }
      return { ...prev, tables: newTables };
    });
  };

      const requestTableDelete = (tableId) => {
    setDeleteTableConfirmation({ isOpen: true, tableId });
  };

  const handleTableDelete = () => {
    if (!deleteTableConfirmation.tableId) return;

    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const newRelations = { ...prev.relations };

      // Delete the table
      delete newTables[deleteTableConfirmation.tableId];

      // Delete relations connected to the table
      Object.keys(newRelations).forEach(relationId => {
        const relation = newRelations[relationId];
        if (relation.relatedTables[0].objectId === deleteTableConfirmation.tableId || relation.relatedTables[1].objectId === deleteTableConfirmation.tableId) {
          // If a relation is deleted, also remove the FK column from the source table
          const sourceTableId = relation.relatedTables[0].objectId;
          if (newTables[sourceTableId] && relation.fkColumn) {
            delete newTables[sourceTableId].columnas[relation.fkColumn];
          }

          delete newRelations[relationId];
        }
      });

      return { ...prev, tables: newTables, relations: newRelations };
    });

    setDeleteTableConfirmation({ isOpen: false, tableId: null });
  };

    const handleCardinalityChange = (relationId, newCardinality) => {
    setDiagram(prev => {
      const newRelations = { ...prev.relations };
      if (newRelations[relationId]) {
        newRelations[relationId].cardinality = newCardinality;
      }
      return { ...prev, relations: newRelations };
    });
  };

  const onNodesDelete = useCallback((deletedNodes) => {
    setDiagram(currentDiagram => {
      const newTables = { ...currentDiagram.tables };
      deletedNodes.forEach(node => {
        delete newTables[node.id];
      });
      return { ...currentDiagram, tables: newTables };
    });
  }, [setDiagram]);

      const requestEdgeDelete = (edgeId) => {
    setDeleteConfirmation({ isOpen: true, edgeId });
  };

  const handleEdgeDelete = () => {
    if (!deleteConfirmation.edgeId) return;

    setDiagram(prev => {
      const newRelations = { ...prev.relations };
            delete newRelations[deleteConfirmation.edgeId];
            return { ...prev, relations: newRelations };
    });
    setDeleteConfirmation({ isOpen: false, edgeId: null });
  };

  const onEdgesDelete = useCallback((deletedEdges) => {
    setDiagram(currentDiagram => {
      const newRelations = { ...currentDiagram.relations };
      deletedEdges.forEach(edge => {
        delete newRelations[edge.id];
      });
      return { ...currentDiagram, relations: newRelations };
    });
  }, [setDiagram]);

    const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(diagram, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "diagram.json";
    link.click();
  };

  const handleImport = (event) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const importedDiagram = JSON.parse(e.target.result);
        // Basic validation
        if (importedDiagram.tables && importedDiagram.relations) {
          setDiagram(importedDiagram);
        } else {
          alert('Archivo JSON no válido.');
        }
      } catch (error) {
        alert('Error al leer el archivo JSON.');
        console.error(error);
      }
    };
    if (event.target.files[0]) {
      fileReader.readAsText(event.target.files[0]);
    }
    // Reset file input
    event.target.value = null;
  };

  const handleAddTable = () => {
    const newTableId = uuidv4();
    const newTable = {
      objectId: newTableId,
      tableName: `Tabla_${Object.keys(diagram.tables).length + 1}`,
      columnas: {
        id: {
          dataType: "integer",
          extra: ["Not Null", "Auto Increment"],
          constraints: [{ type: "PRIMARY KEY" }, { type: "UNIQUE" }]
        }
      },
      metadata: {
        position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 }
      }
    };

    setDiagram(prevDiagram => ({
      ...prevDiagram,
      tables: {
        ...prevDiagram.tables,
        [newTableId]: newTable,
      },
    }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
            <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#666" />
        </marker>
      </defs>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
      >
        <Toolbar 
          onAddTable={handleAddTable} 
          onAddRelation={toggleRelationMode}
          isRelationMode={relationCreation.active}
          onExport={handleExport}
          onImport={handleImport}
        />
        <Controls />
                        <Background variant="dots" gap={12} size={1} />
        <CardinalityMarkers />
                <ConfirmModal 
          isOpen={deleteConfirmation.isOpen}
          message="¿Estás seguro de que quieres eliminar esta relación?"
          onConfirm={handleEdgeDelete}
          onCancel={() => setDeleteConfirmation({ isOpen: false, edgeId: null })}
        />
        <ConfirmModal 
          isOpen={deleteTableConfirmation.isOpen}
          message="¿Estás seguro de que quieres eliminar esta tabla? Se eliminarán todas sus relaciones."
          onConfirm={handleTableDelete}
          onCancel={() => setDeleteTableConfirmation({ isOpen: false, tableId: null })}
        />
      </ReactFlow>
    </div>
  );
}

export default App;
