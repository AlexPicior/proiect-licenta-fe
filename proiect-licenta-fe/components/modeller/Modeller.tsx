"use client";

import React, { 
  useCallback, 
  useState, 
  useEffect
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
import VARIABLES_TYPES from './variableTypes';
import DrawerForm from './DrawerForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const nodeTypes = { 
  taskComponentNode: TaskComponentNode,
  startNode: StartNode,
  endNode: EndNode
};

const edgeTypes = {
  'edgeComponent': EdgeComponent,
};


// const tasks: Task[] = [
//   {
//     type: "sendEmailTask",
//     label: "Send Email Task",
//     properties: {
//       sendTo: {
//         label: "Send to",
//         type: PROPERTIES_TYPES.MULTI_TEXT,
//         value: []
//       },
//       test1: {
// 				label: "User",
// 				type: PROPERTIES_TYPES.VARIABLE,
//         variableType: VARIABLES_TYPES.PERSON,
// 				value: ""
// 			},
//       testTest: {
//         label: "Test",
//         type: PROPERTIES_TYPES.SINGLE_SELECT,
//         value: "",
//         options: [{ value: 'Form1', label: 'Form1' }, { value: 'Form2', label: 'Form2' }, { value: 'Document1', label: 'Document1' }],
//         next: {
//           Form1: {
// 						label: "Test1Option1",
// 						type: PROPERTIES_TYPES.MULTI_TEXT,
// 						value: [],
// 						parentKey: "testTest"
// 					},
// 					Form2: {
// 						label: "Test1Option2",
// 						type: PROPERTIES_TYPES.NUMBER,
// 						value: 0,
// 						parentKey: "testTest"
// 					},
//           Document1: {
// 						label: "Test1Option3",
// 						type: PROPERTIES_TYPES.SINGLE_TEXT,
// 						value: "",
// 						parentKey: "testTest"
// 					}
//         }
//       },
//       content: {
//         label: "Content",
//         type: PROPERTIES_TYPES.TEXT_AREA,
//         value: ""
//       },
//     }
//   },
//   {
//     type: "storeDocumentTask",
//     label: "Store Document Task",
//     properties: {
//       whatToStore: {
//         label: "Storage",
//         type: PROPERTIES_TYPES.MULTI_SELECT,
//         value: [],
//         options: [{ value: 'Form1', label: 'Form1' }, { value: 'Form2', label: 'Form2' }, { value: 'Document1', label: 'Document1' }]
//       },
//       testT: {
// 				label: "Test2",
// 				type: PROPERTIES_TYPES.SINGLE_SELECT,
// 				value: "",
//         options: [{ value: 'Form1', label: 'Form1' }, { value: 'Form2', label: 'Form2' }, { value: 'Document1', label: 'Document1' }],
// 				optionsType: VARIABLES_TYPES.PERSON
// 			}
//     }
//   },
//   {
//     type: "waitForApprovalTask",
//     label: "Wait For Aproval Task",
//     properties: {
//       byWho: {
//         label: "Approved by who",
//         type: PROPERTIES_TYPES.MULTI_SELECT,
//         value: [],
//         options: [{ value: 'Role1', label: 'Role1' }, { value: 'Role2', label: 'Role2' }, { value: 'Role3', label: 'Role3' }]
//       }
//     }
//   },
// ]

const startNode = {
  id: "startNode", 
  type: "startNode",
  position: {
    x: 0,
    y: 0
  },
  data: {
    task: {
      type: "startNode",
      label: "Start Node",
      properties: {
        byWho: {
          label: "Approved by who",
          type: PROPERTIES_TYPES.MULTI_SELECT,
          value: [],
          options: [{ value: 'Role1', label: 'Role1' }, { value: 'Role2', label: 'Role2' }, { value: 'Role3', label: 'Role3' }]
        }
      }
    }
  }
}

const ModellerWithoutProvider = () => {
    const [taskIdForDrawer, setTaskIdForDrawer] = useState(0);
    const showDrawer = () => {
      setOpen(true);
    };
  
    const [initialNodes, setInitialNodes] = useState<any>([]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<any>>([]);
    const { screenToFlowPosition } = useReactFlow();
    const [open, setOpen] = useState(false);
    const [globalOptions, setGlobalOptions] : any = useState({});
    const [currentWorkflowId, setCurrentWorkflowId] = useState(2);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
      fetch(`${API_URL}/workflowComponent`)
      .then(response => response.json())
      .then(components => {
        const startTask = components.filter((component: any) => component.type === "startNode")[0]
        const componentsWithoutStartTask = components.filter((component: any) => component.type !== "startNode")
        const initialComponents: any[] = [
          {
            id: "startNode", 
            type: "startNode",
            position: {
              x: 0,
              y: 0
            },
            data: {
              task: {
                ...startTask
              },
              showDrawer: showDrawer,
              setTaskIdForDrawer: setTaskIdForDrawer
            }
          },
          {
            id: "endNode", 
            type: "endNode",
            position: {
              x: 1000,
              y: 0
            },
          }
        ]
        setInitialNodes(initialComponents);
        setNodes((nodes) => [...initialComponents])
        setTasks(componentsWithoutStartTask)
      })
      .catch(error => {

      });
    }, []);

    const getNodesTypes = () => {
      const additionalNodeTypes = tasks.reduce((acc, task) => {
        acc[task.type] = TaskComponentNode;
        return acc;
      }, {} as Record<string, typeof TaskComponentNode>);
      return {...nodeTypes, ...additionalNodeTypes}
    }

    const onCloseDrawer = () => {
      setVariablesFromNodes();
      setOpen(false);
    };

    const setVariablesFromNodes = () => {
      const focusedNode: any = nodes.filter((node) => node.id === `${taskIdForDrawer}`)[0]
      if (focusedNode) {
        if (focusedNode.data && focusedNode.data.task.properties) {
          const taskProperties: any = focusedNode.data.task.properties;
          Object.entries(taskProperties).forEach(([propertyKey, property]: any, index:any) => {
            if(property.type === PROPERTIES_TYPES.VARIABLE) {
              setGlobalOptions((globalOptions:any) => {
                if(property.variableType) {
                    let optionsForType = globalOptions[property.variableType] ? [...globalOptions[property.variableType]] : [];
                    const optionAlreadyExisting = optionsForType.filter((option) => option.variableName === property.value)[0]
                    if(optionAlreadyExisting) {
                      optionsForType = optionsForType.filter((option) => option.variableName !== property.value)
                    }
                    optionsForType.push({
                      taskId: taskIdForDrawer,
                      variableName: property.value.trim()
                    })

                    globalOptions[property.variableType] = optionsForType;
                    return {
                        ...globalOptions
                    }
                }
              })
            }
          })
        }
      }
    }

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
        const {id, source, target, sourceHandle } = edge;
        const edgeToSave: any = {
          id: id,
          source: source,
          target: target
        }
        if (sourceHandle) {
          edgeToSave.sourceHandle = sourceHandle;
        }
        return edgeToSave
      })
    
      workflowDefinition.nodes = nodesToSave;
      workflowDefinition.edges = edgesToSave;
      const workflowDefinitionJson = JSON.stringify(workflowDefinition)

      return workflowDefinitionJson
    };

    const saveWorkflow = async () => {
      try {
        const response = await fetch(`${API_URL}/workflowDefinition`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: 1,
            organisationId: 1,
            label: "wf1",
            description: "dsacad",
            createdAt: new Date(),
            jsonDefinition: generateWorkflowDefinition()
          }),
        });
        if (!response.ok) throw new Error("Failed to fetch data");
        const responseBody = await response.json();
        if(responseBody.id) {
          setCurrentWorkflowId(responseBody.id)
        }
      } catch (err) {
      } finally {
      }
    }

    const getWorkflowById = async (workflowId: number) => {
      try {
        const response = await fetch(`${API_URL}/workflowDefinition/${workflowId}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const responseBody = await response.json();
        if (responseBody.jsonDefinition) {
          generateNodesAndEdgesFromWorkflowDefinition(responseBody.jsonDefinition);
        }
      } catch (err) {
      } finally {
      }
    }

    const discardAll = () => {
      setNodes((nodes) => [...initialNodes])
      setEdges([])
    }

    return (
      <div className='h-[60%] w-[90%] flex flex-row'>
        <aside className="w-[25%] h-full bg-white shadow-md rounded-l-lg p-4 overflow-y-auto">
          <div className='flex flex-row'>
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Node Types</h4>
            <Button onClick={saveWorkflow} type="primary">SAVE</Button>
            <Button onClick={() => discardAll()} type="primary">DISCARD</Button>
            <Button onClick={() => getWorkflowById(currentWorkflowId)} type="primary">SHOW SAVED</Button>
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
            { nodes && (nodes.length > 2 || `${taskIdForDrawer}` === "startNode")  ?
            (
            <Drawer title="Properties" onClose={onCloseDrawer} open={open} getContainer={false}>
              <DrawerForm 
                taskId={taskIdForDrawer} 
                nodes={nodes} 
                setNodes={setNodes} 
                edges={edges} 
                globalOptions={globalOptions}
                setGlobalOptions={setGlobalOptions}
              ></DrawerForm>
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
