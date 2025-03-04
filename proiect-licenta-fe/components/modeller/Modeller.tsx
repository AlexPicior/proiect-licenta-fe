"use client";

import React, { 
  useCallback, 
  useState
} from 'react'
import {
    ReactFlow,
    ReactFlowProvider,
    addEdge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    useReactFlow,
    MarkerType,
    type Node,
    type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css';
import TaskComponent from './TaskComponent';
import TaskComponentNode from './TaskComponentNode';
import StartNode from './StartNode';
import EndNode from './EndNode';
import EdgeComponent from './EdgeComponent';
import { Task } from './modellerTypes';
import { Drawer, Button } from 'antd';
import PROPERTIES_TYPES from './drawerPropertiesTypes';
import DrawerForm from './DrawerForm';


const nodeTypes = { 
  taskComponentNode: TaskComponentNode,
  startNode: StartNode,
  endNode: EndNode
};

const edgeTypes = {
  'edgeComponent': EdgeComponent,
};

const initialNodes: any = [
  {
    id: "startNode", 
    type: "startNode",
    position: {
      x: 0,
      y: 0
    },
  },
  {
    id: "endNode", 
    type: "endNode",
    position: {
      x: 1000,
      y: 0
    },
  },
];

const tasks: Task[] = [
  {
    type: "sendEmailTask",
    label: "Send Email Task",
    properties: {
      sendTo: {
        label: "Send to",
        type: PROPERTIES_TYPES.MULTI_TEXT,
        value: []
      },
      content: {
        label: "Content",
        type: PROPERTIES_TYPES.TEXT_AREA,
        value: ""
      },
      testTest: {
        label: "Test",
        type: PROPERTIES_TYPES.MULTI_TEXT,
        value: [],
        options: [{ value: 'Form1', label: 'Form1' }, { value: 'Form2', label: 'Form2' }, { value: 'Document1', label: 'Document1' }]
      },
    }
  },
  {
    type: "storeDocumentTask",
    label: "Store Document Task",
    properties: {
      whatToStore: {
        label: "Storage",
        type: PROPERTIES_TYPES.MULTI_SELECT,
        value: [],
        options: [{ value: 'Form1', label: 'Form1' }, { value: 'Form2', label: 'Form2' }, { value: 'Document1', label: 'Document1' }]
      }
    }
  },
  {
    type: "waitForAprovalTask",
    label: "Wait For Aproval Task",
    properties: {
      byWho: {
        label: "Approved by who",
        type: PROPERTIES_TYPES.MULTI_SELECT,
        value: [],
        options: [{ value: 'Role1', label: 'Role1' }, { value: 'Role2', label: 'Role2' }, { value: 'Role3', label: 'Role3' }]
      }
    }
  },
]

let test: any;

const getNodesTypes = () => {
  const additionalNodeTypes = tasks.reduce((acc, task) => {
    acc[task.type] = TaskComponentNode;
    return acc;
  }, {} as Record<string, typeof TaskComponentNode>);
  return {...nodeTypes, ...additionalNodeTypes}
}

const ModellerWithoutProvider = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([]);
    const { screenToFlowPosition } = useReactFlow();
    const [open, setOpen] = useState(false);
    const [taskIdForDrawer, setTaskIdForDrawer] = useState(0);

    const showDrawer = () => {
      setOpen(true);
    };

    const onClose = () => {
      setOpen(false);
    };

    const onConnect = useCallback(
        (params: any) => {
          const edge = {...params, 
            type: "edgeComponent",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
          };
          setEdges((eds) => addEdge(edge, eds))},
        [],
    );

    const onDragOver = useCallback((event: any) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    }, []);
  
    const onDrop = useCallback(
      (event: any) => {
        event.preventDefault();

        const task: Task = JSON.parse(event.dataTransfer.getData("task"));

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
  
        const newNode = {
          id: `${+new Date()}`, 
          type: task.type,
          position: position,
          data: { 
            label: task.label,
            task: {...task},
            showDrawer: showDrawer,
            setTaskIdForDrawer: setTaskIdForDrawer
          },
        };
  
        setNodes((nds) => nds.concat(newNode));
      },
      [screenToFlowPosition, setNodes]
    );

    const generateNodesAndEdgesFromWorkflowDefinition = (workflowDefinitionJson: any) => {
      const workflowDefinition = JSON.parse(workflowDefinitionJson);
      if (workflowDefinition) {
        const {nodes, edges} = workflowDefinition;
      
        setNodes(nodes.map((node: any) => {
          return {
            ...node,
            data: {
              ...node.data,
              showDrawer: showDrawer,
              setTaskIdForDrawer: setTaskIdForDrawer
            }
          }
        }))

        setEdges(edges.map((edge: any) => {
          return {
            ...edge,
            type: "edgeComponent",
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            }
          }
        }))
      }
    };

    const generateWorkflowDefinition = () => {
      const workflowDefinition: any = {};
      let nodesToSave: any = [...nodes]
      let edgesToSave: any = [...edges]
    
      nodesToSave = nodesToSave.map((node: any) => {
        const {id, type, position, data } = node;
        if (data) {
          const {label, task} = data
          return {
            id: id,
            type: type,
            position: position,
            data: {
              label: label,
              task: task
            }
          }
        }
    
        return {
          id: id,
          type: type,
          position: position
        }
      })
    
      edgesToSave = edgesToSave.map((edge: any) => {
        const {id, source, target } = edge;
        return {
          id: id,
          source: source,
          target: target
        }
      })
    
      workflowDefinition.nodes = nodesToSave;
      workflowDefinition.edges = edgesToSave;
      const workflowDefinitionJson = JSON.stringify(workflowDefinition)

      test = workflowDefinitionJson
    };

    const discardAll = () => {
      setNodes((nodes) => initialNodes)
      setEdges([])
    }

    return (
      <div className='h-[60%] w-[90%] flex flex-row'>
        <aside className="w-[25%] h-full bg-white shadow-md rounded-l-lg p-4 overflow-y-auto">
          <div className='flex flex-row'>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Node Types</h4>
            <Button onClick={() => generateWorkflowDefinition()} type="primary">SAVE</Button>
            <Button onClick={() => discardAll()} type="primary">DISCARD</Button>
            <Button onClick={() => generateNodesAndEdgesFromWorkflowDefinition(test)} type="primary">SHOW SAVED</Button>
          </div>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskComponent key={index} task = {task}></TaskComponent>
            ) )}
          </div>
        </aside>
        <div className='h-full w-[75%] relative'>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={getNodesTypes()}
            edgeTypes={edgeTypes}
            onDrop={onDrop} 
            onDragOver={onDragOver}
            className='rounded-r-lg'
            fitView
            style={{ backgroundColor: "#F7F9FB" }}
            >
                <Controls />
                <Background  />
            </ReactFlow>
            { nodes && nodes.length > 2 ?
            (
            <Drawer title="Properties" onClose={onClose} open={open} getContainer={false}>
              <DrawerForm taskId={taskIdForDrawer} nodes={nodes} setNodes={setNodes}></DrawerForm>
            </Drawer>
            ) : (<></>)}
        </div>
      </div>
    )
}

function Modeller(props: any) {
  return (
    <ReactFlowProvider>
      <ModellerWithoutProvider {...props} />
    </ReactFlowProvider>
  );
}

export default Modeller
