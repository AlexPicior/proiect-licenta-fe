import React , {
    useState
} from 'react'
import PROPERTIES_TYPES from './drawerPropertiesTypes';
import VARIABLES_TYPES from './variableTypes';
import { Task, TaskProperty } from './modellerTypes';
import { 
    Input,
    Typography,
    Select, 
    InputNumber,
    Switch
} from 'antd';
import '@ant-design/v5-patch-for-react-19';

const { Text } = Typography;
const { TextArea } = Input;

const DrawerForm = (props: any) => {
    const {taskId, nodes, setNodes, edges, globalOptions, setGlobalOptions} = props;

    const getForm = (properties: any, setNodes: any, taskId: any) => {
        const propertiesArray = Object.entries(properties).sort(([propertyKey1, property1]: any, [propertyKey2, property2]: any) => {
            const orderNumberPorperty1 = property1.orderNumber;
            const orderNumberPorperty2 = property2.orderNumber;

            if (orderNumberPorperty1 > orderNumberPorperty2) {
                return 1;
            } if (orderNumberPorperty1 < orderNumberPorperty2) {
                return -1;
            }
            return 0;
        })
        return (
            <div className='w-full h-full overflow-y-auto'>
                {propertiesArray.map(([propertyKey, property]: any, index:any) => {
                    return (
                        <div key={index}>
                            <div className='flex flex-col'>
                                <Text className='mb-2'>{property.label}:</Text>
                                {getComponentByType(property, propertyKey, setNodes, taskId)}
                                <div className='mb-4'></div>
                            </div>
                            {property.next && property.value ? 
                            (getNextPropertiesComponents(property.next[property.value], property.value, setNodes, taskId))
                            : (<div></div>)}
                        </div>
                    )
                })}
            </div>
        )
    }

    const isTaskBeforeTheOtherTask = (taskId:any, otherTaskId:any) => {
        const edgesMap = calculateTasksOrder(edges)
        if (Object.keys(edgesMap).length != 0) {
            let prev = edgesMap[otherTaskId]
            while(prev) {
                if(prev === taskId) {
                    return true;
                }
                prev = edgesMap[prev];
            }
            return false;
        }
        return false;
    }

    const calculateTasksOrder = (edges: any) => {
        const edgesMap: any = {}
        edges.forEach((e: any) => {
            edgesMap[e.target] = e.source
        });
        return edgesMap
    }

    const getNextPropertiesComponents = (property: any, propertyKey:any, setNodes: any, taskId: any) => {
        return (
            <div className='flex flex-col'>
                <Text className='mb-2'>{property.label}:</Text>
                {getComponentByType(property, propertyKey, setNodes, taskId)}
                <div className='mb-4'></div>
            </div>
        )
    }

    const getTaskProperties = (nodes: [], taskId: any) => {
        const clickedNode: any = nodes.filter((node: any) => node.id === taskId)[0];
        const task: Task = clickedNode.data.task;
        return {...task.properties};
    }

    const onChangeHandler = (e: any, propertyKey: any, setNodes: any, taskId: any, property: any) => {
        setNodes((nodes: any) =>         
            nodes.map((node: any) => {
                if(node.id === taskId) {
                    const propertiesChanged = {...node.data.task.properties}
                    if (property.parentKey) {
                        const parentProperty = {...propertiesChanged[property.parentKey]}
                        const nextProperties = {...parentProperty.next}
                        nextProperties[propertyKey] = {...nextProperties[propertyKey], value: getInputValue(property, e)}
                        propertiesChanged[property.parentKey] = {...parentProperty, next: {...nextProperties}}
                    } else {
                        propertiesChanged[propertyKey] = {...property, value: getInputValue(property, e)}
                    }
                    return {
                        ...node, 
                        data : {
                            ...node.data,
                            task: {
                                ...node.data.task,
                                properties: {
                                    ...propertiesChanged
                                }
                            }
                        }
                    }
                }

                return node;
            })
        )
    }

    const getInputValue = (property: any, e:any) => {
        const propertyType = property.type
        return propertyType === PROPERTIES_TYPES.SINGLE_TEXT 
        || propertyType === PROPERTIES_TYPES.TEXT_AREA
        || propertyType === PROPERTIES_TYPES.VARIABLE 
        ? e.target.value.trim() 
        : e;

    }

    const getComponentByType = (property: TaskProperty, propertyKey: any, setNodes: any, taskId: any) => {
        switch(property.type) {
            case PROPERTIES_TYPES.SINGLE_TEXT:
                property.value = property.value ? property.value : "";
                return (
                    <Input
                        allowClear
                        value={(property.value as string)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                    ></Input>
                )
            case PROPERTIES_TYPES.MULTI_TEXT:
                property.value = property.value ? property.value : [];
                return (
                    <Select
                        mode="tags"
                        value={(property.value as string)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                        options={property.options}
                    />
                )
            case PROPERTIES_TYPES.TEXT_AREA:
                property.value = property.value ? property.value : "";
                return (
                    <TextArea
                        allowClear
                        value={(property.value as string)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                    ></TextArea>
                )
            case PROPERTIES_TYPES.SINGLE_SELECT:
                property.value = property.value ? property.value : "";
                return (
                    <Select
                        value={(property.value as string)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                        options={property.optionsType ? getOptionsForType(property.optionsType, taskId, property.options) : property.options }
                    />
                )
            case PROPERTIES_TYPES.MULTI_SELECT:
                property.value = property.value ? property.value : [];
                return (
                    <Select
                        mode="multiple"
                        value={(property.value as string)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                        options={property.optionsType ? getOptionsForType(property.optionsType, taskId, property.options) : property.options}
                    />
                )
            case PROPERTIES_TYPES.NUMBER:
                property.value = property.value ? property.value : 0;
                return (
                    <InputNumber
                        value={(property.value as number)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                    ></InputNumber>
                )
            case PROPERTIES_TYPES.BOOLEN:
                property.value = property.value ? property.value : false;
                return (
                    <Switch
                        className='w-[10%]'
                        value={(property.value as boolean)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                    ></Switch>
                )
            case PROPERTIES_TYPES.VARIABLE:
                property.value = property.value ? property.value : "";
                return (
                    <Input
                        allowClear
                        placeholder='Set a name to reference this in next tasks'
                        value={(property.value as string)}
                        onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property)}
                    ></Input>
                )
            default:
                return (
                    <div></div>
                )
        }
    }

    const getOptionsForType = (optionsType:any, taskId: any, otherOptions: any) => {
        if (Array.isArray(globalOptions[optionsType]) && globalOptions[optionsType].length > 0) {
            const options = globalOptions[optionsType].filter((option: any) => isTaskBeforeTheOtherTask(option.taskId, taskId) && option.variableName.length > 0)
                                                .map((option: any) => {
                                                    return {
                                                        label: option.variableName,
                                                        value: option.variableName
                                                    }
                                                })
                                                ;
            otherOptions = otherOptions ? otherOptions : [];
            options.push(...otherOptions)
            return options;
        }
        return otherOptions
    }

    const getInitialPropertiesValues = (nodes: [], taskId: any) => {
        const initialPropertiesValues: Record<string, any> = {};
        if (nodes.length > 2) {
            Object.entries(getTaskProperties(nodes, taskId)).forEach(([propertyKey, property]: any, index) => {
                initialPropertiesValues[propertyKey] = Array.isArray(property.value) ? [...property.value] : property.value
            })
        }
        return initialPropertiesValues;
    }
    
    return (
        <div>
            {getForm(getTaskProperties(nodes, taskId), setNodes, taskId)}
        </div>
    )
}

export default DrawerForm