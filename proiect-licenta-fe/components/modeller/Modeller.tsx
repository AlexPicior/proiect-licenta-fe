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
import { Drawer, Button, Typography, Input, Flex, message } from 'antd';
import PROPERTIES_TYPES from './drawerPropertiesTypes';
import VARIABLES_TYPES from './variableTypes';
import DrawerForm from './DrawerForm';
import { useGlobalContext } from '@/components/context/GlobalContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const { Text } = Typography;
const { TextArea } = Input;

const nodeTypes = { 
  taskComponentNode: TaskComponentNode,
  startNode: StartNode,
  endNode: EndNode
};

const edgeTypes = {
  'edgeComponent': EdgeComponent,
};

const ModellerWithoutProvider = (props: any) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [showMessage, setShowMessage] = useState({
      type: '',
      message: ''
  });
  useEffect(() => {
      if (showMessage.type !== '') {
      const { type, message: msgContent } = showMessage;
      if (type === 'success') {
          messageApi.open({
          type: 'success',
          content: msgContent,
          });
      } else if (type === 'error') {
          messageApi.open({
          type: 'error',
          content: msgContent,
          });
      }
      }
  }, [showMessage]);

  const { workflowDefinitionData, setTriggerReload } = props;
  const [workflowDefinitionMetaData, setWorkflowDefinitionMetaData] = useState({
    label: workflowDefinitionData.label,
    description: workflowDefinitionData.description,
  });
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
  const [fromVariablesFormTypes, setFromVariablesFormTypes] = useState({});
  const { authInfo, setAuthInfo } = useGlobalContext();
  

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

        if (workflowDefinitionData) {
          generateNodesAndEdgesFromWorkflowDefinition(workflowDefinitionData.jsonDefinition);
        }
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
        const taskPropertiesList: any = Object.entries(taskProperties);
        let formId: any;
        taskPropertiesList.forEach(([propertyKey, property]: any, index:any) => {
          if (property.type === PROPERTIES_TYPES.SINGLE_SELECT 
            && ((property.initialOptionTypes && property.initialOptionTypes.includes("forms")) 
              || property.optionsType && property.optionsType === VARIABLES_TYPES.FORM)
            && property.value && property.value !== "") {
            formId = property.value;
          }
        })
        taskPropertiesList.forEach(([propertyKey, property]: any, index:any) => {
          if(property.type === PROPERTIES_TYPES.VARIABLE) {
            setGlobalOptions((globalOptions:any) => {
              if(property.variableType) {
                  let optionsForType = globalOptions[property.variableType] ? [...globalOptions[property.variableType]] : [];
                  const optionAlreadyExisting = optionsForType.filter((option) => option.variableName === property.value)[0]
                  if(optionAlreadyExisting) {
                    optionsForType = optionsForType.filter((option) => option.variableName !== property.value)
                  }
                  const optionForType: any = {
                    taskId: taskIdForDrawer,
                    variableName: property.value.trim()
                  };

                  if(formId) {
                    setFromVariablesFormTypes((prevState: any) => {
                      return {
                        ...prevState,
                        [property.value.trim()]: formId
                      }
                    })
                  }

                  optionsForType.push(optionForType);

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
          id: workflowDefinitionData.id ? workflowDefinitionData.id : null,
          lastModifiedById: authInfo.userInfo.id,
          organisationId: authInfo.userInfo.organisationId,
          label: workflowDefinitionMetaData.label.trim(),
          description: workflowDefinitionMetaData.description.trim(),
          lastModifiedAt: (new Date()).toISOString().slice(0, 19),
          jsonDefinition: generateWorkflowDefinition()
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'Workflow saved successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to save workflow!' });
    } 
  }

  const discardAll = () => {
    setNodes((nodes) => [...initialNodes])
    setEdges([])
    setShowMessage({ type: 'success', message: 'Diagram cleared successfully!' });
  }

  return (<>
    {contextHolder}
    <div className='h-full max-h-[600px] w-full flex flex-row'>
      <aside className="w-[25%] h-full max-h-[600px] bg-white shadow-md rounded-l-lg p-4 overflow-y-auto">
        <Flex vertical gap={10} className='h-full w-full'>
          <Flex vertical gap={15} className='h-full w-full border-b border-gray-100 pb-4'>
            <Flex vertical gap={15}>
              <Input 
                value={workflowDefinitionMetaData.label}
                onChange={(e) => setWorkflowDefinitionMetaData((prev: any) => { return {...prev, label: e.target.value}})} 
                className='w-[60%]' placeholder="Label" variant="underlined" 
              />
              <TextArea 
                value={workflowDefinitionMetaData.description}
                onChange={(e) => setWorkflowDefinitionMetaData((prev: any) => { return {...prev, description: e.target.value}})}
                className='w-[95%]' placeholder="Description" rows={4} 
              />
            </Flex>
            <Flex justify='space-between' gap={15}>
              <Button onClick={saveWorkflow} color="default" variant='solid'>Save</Button>
              <Button onClick={() => discardAll()} color="default" variant='solid'>Clear diagram</Button>
            </Flex>
          </Flex>

          <Flex vertical align='center' gap={10}>
            <Text className='text-gray-500 mb-3'>Drag and drop tasks into the diagram</Text>
            {tasks.map((task, index) => (
              <TaskComponent key={index} task = {task}></TaskComponent>
            ) )}
          </Flex>
        </Flex>
      </aside>
      <div className='h-[600px] max-h-[600px] w-[75%] relative'>
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
              fromVariablesFormTypes={fromVariablesFormTypes}
            ></DrawerForm>
          </Drawer>
          ) : (<></>)}
      </div>
    </div>
  </>)
}

function Modeller(props: any) {
  return (
    <ReactFlowProvider>
      <ModellerWithoutProvider {...props} />
    </ReactFlowProvider>
  );
}

export default Modeller
