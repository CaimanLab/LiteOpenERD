import { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, { useNodesState, useEdgesState, addEdge, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import { APP_VERSION } from './config';

import './App.css';
import Toolbar from './Toolbar';
import Header from './Header';
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
      return {
        ...initialDiagram,
        metadata: {
          ...initialDiagram.metadata,
          // workspaceSize: {
          //   width: '100vw',
          //   height: '100vh'
          // }
        }
      };
    }
    const parsed = JSON.parse(serializedState);
    // Ensure backward compatibility
    if (!parsed.metadata) {
      parsed.metadata = {};
    }
    // if (!parsed.metadata.workspaceSize) {
    //   parsed.metadata.workspaceSize = {
    //     width: '100vw',
    //     height: '100vh'
    //   };
    // }
    return parsed;
  } catch (err) {
    console.error("Could not load state", err);
    return {
      ...initialDiagram,
      metadata: {
        ...initialDiagram.metadata,
        workspaceSize: {
          width: '100vw',
          height: '100vh'
        }
      }
    };
  }
};

function App() {
  const { t } = useTranslation();
    const [diagram, setDiagram] = useState(loadState);
  const [relationCreation, setRelationCreation] = useState({ active: false, source: null });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, edgeId: null });
  const [deleteTableConfirmation, setDeleteTableConfirmation] = useState({ isOpen: false, tableId: null });
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // const [workspaceSize, setWorkspaceSize] = useState(
  //   diagram.metadata?.workspaceSize || { width: '100vw', height: '100vh' }
  // );

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
        columns: table.columns
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
      setRelationCreation({ ...relationCreation, source: node });
      // Optionally, add visual feedback for the source node
    } else {
      const newRelationId = uuidv4();
              const sourceTable = diagram.tables[relationCreation.source.id];
        const targetTable = diagram.tables[node.id];

        // Find primary key of target table
        const primaryKey = Object.keys(targetTable.columns).find(colName => 
          targetTable.columns[colName].constraints?.some(c => c.type === 'PRIMARY KEY')
        ) || 'id'; // fallback to 'id'

        const fkColumnName = `${targetTable.tableName.toLowerCase()}_${primaryKey}`;

        // Add FK column to source table
        const newSourceTableColumns = {
          ...sourceTable.columns,
          [fkColumnName]: {
            dataType: targetTable.columns[primaryKey]?.dataType || 'integer',
                                    constraints: [{
              type: 'FOREIGN KEY',
              references: targetTable.tableName,
              on: primaryKey,
              metadata: { relationObjectId: newRelationId }
            }],
            extra: ['Not Null']
          }
        };

        const newSourceTable = { ...sourceTable, columns: newSourceTableColumns };

        const newRelation = {
          objectId: newRelationId,
          relationName: `${relationCreation.source.data.label}_${node.data.label}`,
                    cardinality: { source: '1', target: 'N' }, // Default to One-to-Many
          relatedTables: [{ objectId: relationCreation.source.id, tableName: relationCreation.source.data.label }, { objectId: node.id, tableName: node.data.label }],
          fkColumn: fkColumnName,
          metadata: {},
        };

        setDiagram(prev => ({
          ...prev,
          tables: { ...prev.tables, [relationCreation.source.id]: newSourceTable },
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
      const newRelations = { ...prev.relations };
      const table = newTables[tableId];

      if (table && table.columns[oldName] && !table.columns[newName]) {
        const columnData = { ...table.columns[oldName] };
        delete table.columns[oldName];
        table.columns[newName] = columnData;

        // If the renamed column is a FK, update the relation
                const fkConstraint = columnData.constraints?.find(c => c.type === 'FOREIGN KEY');
        if (fkConstraint && fkConstraint.metadata?.relationObjectId) {
          const relation = newRelations[fkConstraint.metadata.relationObjectId];
          if (relation) {
            relation.fkColumn = newName;
          }
        }
      }

      return { ...prev, tables: newTables, relations: newRelations };
    });
  };

  const handleColumnTypeChange = (tableId, columnName, newType) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const table = newTables[tableId];
      if (table && table.columns[columnName]) {
        table.columns[columnName].dataType = newType;
      }
      return { ...prev, tables: newTables };
    });
  };

      const handleColumnDelete = (tableId, columnName) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const newRelations = { ...prev.relations };
      const table = newTables[tableId];

      if (table && table.columns[columnName]) {
        // Check if the column is a foreign key
                const fkConstraint = table.columns[columnName].constraints?.find(c => c.type === 'FOREIGN KEY');
        if (fkConstraint && fkConstraint.metadata?.relationObjectId) {
          // Delete the associated relation
          delete newRelations[fkConstraint.metadata.relationObjectId];
        }

        // Delete the column
        delete table.columns[columnName];
      }

      return { ...prev, tables: newTables, relations: newRelations };
    });
  };

    const handleColumnPropertyChange = (tableId, columnName, property, value) => {
    setDiagram(prev => {
      const newTables = { ...prev.tables };
      const column = newTables[tableId]?.columns[columnName];
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
        const newColumnName = `columna_${Object.keys(table.columns).length + 1}`;
        table.columns[newColumnName] = {
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
            delete newTables[sourceTableId].columns[relation.fkColumn];
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
      const newTables = { ...prev.tables };
      const relationToDelete = newRelations[deleteConfirmation.edgeId];

      if (relationToDelete) {
        // Find the source table and the FK column to delete
        const sourceTableId = relationToDelete.relatedTables[0].objectId;
        const fkColumn = relationToDelete.fkColumn;

        if (newTables[sourceTableId] && newTables[sourceTableId].columns[fkColumn]) {
          delete newTables[sourceTableId].columns[fkColumn];
        }

        // Delete the relation
        delete newRelations[deleteConfirmation.edgeId];
      }

      return { ...prev, relations: newRelations, tables: newTables };
    });

    setDeleteConfirmation({ isOpen: false, edgeId: null });
  };

  const handleAddTable = () => {
    const newTableId = uuidv4();
    const newTable = {
      objectId: newTableId,
      tableName: `NuevaTabla_${Object.keys(diagram.tables).length + 1}`,
      columns: {
        id: {
          dataType: 'integer',
          extra: ['Not Null', 'Auto Increment'],
          constraints: [{ type: 'PRIMARY KEY' }],
        },
      },
      metadata: {
        position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position for new tables
      },
    };

    setDiagram(prev => ({
      ...prev,
      tables: {
        ...prev.tables,
        [newTableId]: newTable,
      },
    }));
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

      // Usando la versión desde el archivo de configuración

  const handleExport = (type = 'full') => {
    let exportData = {
      ...diagram,
      metadata: {
        ...diagram.metadata,
        versionLiteOpenERD: APP_VERSION,
        exportedAt: new Date().toISOString()
      }
    };
    if (type === 'simple') {
      // Create a deep copy of the diagram without internal metadata
      exportData = {
        tables: {},
        relations: {},
        metadata: {
          versionLiteOpenERD: APP_VERSION,
          exportedAt: new Date().toISOString()
        }
      };

      // Process tables (copy only necessary data)
      Object.entries(diagram.tables).forEach(([id, table]) => {
        exportData.tables[id] = {
          ...table,
          metadata: undefined, // Remove position metadata
          columns: { ...table.columns }
        };

        // Clean up column data
        Object.values(exportData.tables[id].columns).forEach(column => {
          if (column.constraints) {
            column.constraints = column.constraints.map(({ type, references, on }) => ({
              type,
              ...(references && on ? { references, on } : {})
            }));
          }
        });
      });

      // Process relations (copy only necessary data)
      Object.entries(diagram.relations).forEach(([id, relation]) => {
        exportData.relations[id] = {
          objectId: relation.objectId,
          relationName: relation.relationName,
          cardinality: relation.cardinality,
          relatedTables: relation.relatedTables,
          fkColumn: relation.fkColumn
        };
      });

       exportData = buildSimpleJSON(exportData);
    }

   

    const dataStr = JSON.stringify(exportData, null, 2);
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${type==='full'?'rawDiagram':'exportedDiagram'}.json`;
    link.click();
  };


  const buildSimpleJSON = (rawJson) => {
    const simpleData = {
      tables: [],
      relations: []
    };  

    // Process tables (copy only necessary data)
    Object.values(rawJson.tables).forEach(table => {
      const simple = {
        tableName: table.tableName,
        columns: table.columns
      }

      simpleData.tables.push(simple)
    })

    // Object.values(rawJson.relations).forEach(relation => {
    //   const simple = {
    //     relationName: relation.relationName,
    //     cardinality: relation.cardinality,
    //     relatedTables: relation.relatedTables,
    //     fkColumn: relation.fkColumn
    //   }

    //   simpleData.relations.push(simple)
    // })

    return simpleData;
    
  }

  const handleExportSql = () => {
    let sqlScript = '';
    const { tables, relations } = diagram;

    // Generate CREATE TABLE statements
    for (const tableId in tables) {
      const table = tables[tableId];
      const columnDefinitions = [];
      const primaryKeys = [];

      for (const columnName in table.columns) {
        const column = table.columns[columnName];
        let columnDef = `  \`${columnName}\` ${column.dataType.toUpperCase()}`;

        const constraints = new Set(column.constraints?.map(c => c.type) || []);
        const extras = new Set(column.extra || []);

        if (extras.has('Not Null')) columnDef += ' NOT NULL';
        if (extras.has('Auto Increment')) columnDef += ' AUTO_INCREMENT';
        if (constraints.has('UNIQUE')) columnDef += ' UNIQUE';
        if (constraints.has('PRIMARY KEY')) primaryKeys.push(`\`${columnName}\``);

        columnDefinitions.push(columnDef);
      }

      if (primaryKeys.length > 0) {
        columnDefinitions.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`);
      }

      sqlScript += `CREATE TABLE \`${table.tableName}\` (\n${columnDefinitions.join(',\n')}\n);\n\n`;
    }

    // Generate ALTER TABLE for FOREIGN KEY constraints
    for (const relationId in relations) {
      const relation = relations[relationId];
      const sourceTable = tables[relation.relatedTables[0].objectId];
      const fkColumnName = relation.fkColumn;
      const fkConstraint = sourceTable?.columns[fkColumnName]?.constraints.find(c => c.type === 'FOREIGN KEY');

      if (sourceTable && fkColumnName && fkConstraint) {
        sqlScript += `ALTER TABLE \`${sourceTable.tableName}\` ADD CONSTRAINT \`fk_${sourceTable.tableName}_${fkConstraint.references}\` FOREIGN KEY (\`${fkColumnName}\`) REFERENCES \`${fkConstraint.references}\`(\`${fkConstraint.on}\`);\n`;
      }
    }

    // Trigger download
    const blob = new Blob([sqlScript], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef(null);

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      });

      const importedData = JSON.parse(fileContent);
      
      // Verificar si es un archivo LiteOpenERD válido
      if (!importedData.metadata || !importedData.metadata.versionLiteOpenERD || importedData.metadata.versionLiteOpenERD !== APP_VERSION) {
        console.error(t('common.notValidFile'));
        throw new Error(t('common.notValidFile'));
      }

      // Verificar compatibilidad de versión
      // const fileVersion = importedData.metadata.versionLiteOpenERD;
      // if (fileVersion !== APP_VERSION) {
      //   if (!window.confirm(`Este archivo fue creado con la versión ${fileVersion} de LiteOpenERD.\n\n` +
      //                     `Estás usando la versión ${APP_VERSION}.\n\n` +
      //                     `¿Deseas intentar importarlo de todos modos?\n\n` +
      //                     `Nota: Algunas características podrían no funcionar correctamente.`)) {
      //     throw new Error('Importación cancelada por el usuario');
      //   }
      // }

      // Si llegamos aquí, el archivo es válido o el usuario quiere continuar
      // Extraer los datos del diagrama y los metadatos
      const { metadata = {}, ...diagramData } = importedData;
      
      // Asegurarse de que el workspaceSize del archivo importado tenga prioridad
      // const newWorkspaceSize = metadata.workspaceSize || { width: '100vw', height: '100vh' };
      
      // Actualizar el estado del tamaño del área de trabajo
      // setWorkspaceSize(newWorkspaceSize);
      
      // Actualizar el diagrama con los datos importados y metadatos actualizados
      setDiagram({
        ...diagramData,
        metadata: {
          ...metadata,
          // workspaceSize: newWorkspaceSize,
          versionLiteOpenERD: APP_VERSION
        }
      });
      
    } catch (error) {
      console.error("Error al importar el archivo:", error);
      if (error.message !== 'Importación cancelada por el usuario') {
        alert(t('common.notValidFile'));
      }
    } finally {
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // const updateWorkspaceSize = (dimension, value) => {
  //   const newValue = value.endsWith('%') || value.endsWith('px') || value.endsWith('vw') || value.endsWith('vh') 
  //     ? value 
  //     : value + 'px';
      
  //   setWorkspaceSize(prev => ({
  //     ...prev,
  //     [dimension]: newValue
  //   }));

  //   // Update in diagram metadata
  //   setDiagram(prev => ({
  //     ...prev,
  //     metadata: {
  //       ...prev.metadata,
  //       workspaceSize: {
  //         ...(prev.metadata?.workspaceSize || { width: '100vw', height: '100vh' }),
  //         [dimension]: newValue
  //       }
  //     }
  //   }));
  // };

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', height: '2500px' }}>
      <Header />
      <Toolbar 
          onAddTable={handleAddTable} 
          onAddRelation={toggleRelationMode} 
          onExport={handleExport} 
          onImport={handleImport} 
          onExportSql={handleExportSql} 
          isRelationMode={relationCreation.active}
          fileInputRef={fileInputRef}
          // workspaceSize={workspaceSize}
          // onWorkspaceSizeChange={updateWorkspaceSize}
        />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '50px' }}>
        
        <div style={{ flex: 1, position: 'relative'}} >
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
            <Controls />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
      <ConfirmModal 
        isOpen={deleteConfirmation.isOpen}
        message={t('relation.deleteConfirm')}
        onConfirm={handleEdgeDelete}
        onCancel={() => setDeleteConfirmation({ isOpen: false, edgeId: null })}
      />
      <ConfirmModal 
        isOpen={deleteTableConfirmation.isOpen}
        message={t('table.deleteConfirm')}
        onConfirm={handleTableDelete}
          onCancel={() => setDeleteTableConfirmation({ isOpen: false, tableId: null })}
        />
    </div>
  );
}

export default App;
