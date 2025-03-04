import React , {
    useState
} from 'react'
import PROPERTIES_TYPES from './drawerPropertiesTypes';
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

const getForm = (properties: any, setNodes: any, taskId: any) => {
    return (
        <div className='w-full h-full overflow-y-auto'>
            {Object.entries(properties).map(([propertyKey, property]: any, index) => {
                return (
                    <div key={index} className='flex flex-col'>
                        <Text className='mb-2'>{property.label}:</Text>
                        {getComponentByType(property, propertyKey, setNodes, taskId)}
                        <div className='mb-4'></div>
                    </div>
                )
            })}
        </div>
    )
}

const getTaskProperties = (nodes: [], taskId: any) => {
    const clickedNode: any = nodes.filter((node: any) => node.id === taskId)[0];
    const task: Task = clickedNode.data.task;
    return {...task.properties};
}

const onChangeHandler = (e: any, propertyKey: any, setNodes: any, taskId: any, propertyType: any) => {
    const inputValue = propertyType === PROPERTIES_TYPES.SINGLE_TEXT || propertyType === PROPERTIES_TYPES.TEXT_AREA ? e.target.value : e;
    setNodes((nodes: any) =>         
        nodes.map((node: any) => {
            if(node.id === taskId) {
                const propertiesChanged = {...node.data.task.properties}
                const propertyChanged = {...propertiesChanged[propertyKey], value: inputValue}
                propertiesChanged[propertyKey] = propertyChanged
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

const getComponentByType = (property: TaskProperty, propertyKey: any, setNodes: any, taskId: any) => {
    switch(property.type) {
        case PROPERTIES_TYPES.SINGLE_TEXT:
            return (
                <Input
                    allowClear
                    value={(property.value as string)}
                    onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property.type)}
                ></Input>
            )
        case PROPERTIES_TYPES.MULTI_TEXT:
            return (
                <Select
                    mode="tags"
                    value={(property.value as string)}
                    onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property.type)}
                    options={property.options}
                />
            )
        case PROPERTIES_TYPES.TEXT_AREA:
            return (
                <TextArea
                    allowClear
                    value={(property.value as string)}
                    onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property.type)}
                ></TextArea>
            )
        case PROPERTIES_TYPES.SINGLE_SELECT:
            return (
                <Select
                    value={(property.value as string)}
                    onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property.type)}
                    options={property.options}
                />
            )
        case PROPERTIES_TYPES.MULTI_SELECT:
            return (
                <Select
                    mode="multiple"
                    value={(property.value as string)}
                    onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property.type)}
                    options={property.options}
                />
            )
        case PROPERTIES_TYPES.NUMBER:
            return (
                <InputNumber
                    value={(property.value as number)}
                    onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId, property.type)}
                ></InputNumber>
            )
        case PROPERTIES_TYPES.BOOLEN:
            return (
                <Switch
                    className='w-[10%]'
                    value={(property.value as boolean)}
                    onChange={(e) => onChangeHandler(e, propertyKey, setNodes, taskId,property.type)}
                ></Switch>
            )
        default:
            return (
                <div></div>
            )
    }
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

const DrawerForm = (props: any) => {
    const {taskId, nodes, setNodes} = props;
    const [propertiesValues, setpropertiesValues] = useState(getInitialPropertiesValues(nodes, taskId));
    
    return (
        <div>
            {getForm(getTaskProperties(nodes, taskId), setNodes, taskId)}
        </div>
    )
}

export default DrawerForm