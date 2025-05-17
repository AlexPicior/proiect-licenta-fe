import React , {
    useState,
    useEffect
} from 'react'
import PROPERTIES_TYPES from './drawerPropertiesTypes';
import VARIABLES_TYPES from './variableTypes';
import { Task, TaskProperty } from './modellerTypes';
import { 
    Input,
    Typography,
    Select, 
    InputNumber,
    Switch,
    Flex
} from 'antd';
import '@ant-design/v5-patch-for-react-19';
import FORM_FIELD_TYPES, { FormField, FormFieldMap, Option } from '../form-creation/formTypes';

const { Text } = Typography;
const { TextArea } = Input;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const operations = {
    isOptions: [
        {
            label: "is",
            value: "is"
        },
        {
            label: "is not",
            value: "is_not"
        }
    ],
    containsOptions: [
        {
            label: "contains",
            value: "contains"
        },
        {
            label: "not contains",
            value: "not_contains"
        }
    ], 
    numberOptions: [
        {
            label: "=",
            value: "="
        },
        {
            label: "≠",
            value: "!="
        },
        {
            label: ">",
            value: ">"
        },
        {
            label: "<",
            value: "<"
        },
        {
            label: "≥",
            value: ">="
        },
        {
            label: "≤",
            value: "<="
        }
    ]
}


const DrawerForm = (props: any) => {
    const {taskId, nodes, setNodes, edges, globalOptions, setGlobalOptions, fromVariablesFormTypes} = props;
    const [formFieldForCondition, setFormFieldForCondition] = useState<FormFieldMap>({});
    const [optionsFieldForm, setOptionsFieldForm] = useState<Option[]>([]);

    const getTaskProperties = (nodes: [], taskId: any) => {
        const clickedNode: any = nodes.filter((node: any) => node.id === taskId)[0];
        const task: Task = clickedNode.data.task;
        return {...task.properties};
    }

    const getFormVariableNameFromProperties = (properties: any) => {
        if (properties) {
            let formVariableName = "";
            Object.entries(properties).forEach(([propertyKey, property]: any) => {
                if (property.type === PROPERTIES_TYPES.CONDITION && property.value 
                    && property.value.formVariableName && property.value.formVariableName !== "") {
                    formVariableName = property.value.formVariableName;
                }
            })
            return formVariableName;
        }
        return "";
    }

    const getFormIdFromNodes = (formVariableName: any) => {
        if(formVariableName && formVariableName !== "") {
            const fromVariablesFormTypes: any = {};
            nodes.forEach((node: any) => {
                if (node.data && node.data.task && node.data.task.properties) {
                    let selectedFormType: any;
                    Object.entries(node.data.task.properties).forEach(([propertyKey, property]: any) => {
                        if (property.initialOptionTypes && property.initialOptionTypes.length > 0 
                            && property.initialOptionTypes[0] === "forms") {
                            selectedFormType = property.value;
                        }
                    })
                    Object.entries(node.data.task.properties).forEach(([propertyKey, property]: any) => {
                        if (property.variableType === VARIABLES_TYPES.FORM && property.value !== "" && selectedFormType) {
                            fromVariablesFormTypes[property.value] = selectedFormType;
                        }
                    })
                }
            });
            return fromVariablesFormTypes[formVariableName];
        } else {
            return "";
        }
    }

    const [formId, setFormId] = useState(getFormIdFromNodes(getFormVariableNameFromProperties(getTaskProperties(nodes, taskId))));

    useEffect(() => {
        if (formId !== "") {
            fetch(`${API_URL}/form/${formId}`)
            .then(response => response.json())
            .then(responseBody => {
                const fields: any = {};
                const options: any = [];
                if (responseBody.pages) {
                    const {pages} = responseBody
                    pages.forEach((page: []) => {
                        page.forEach((field: FormField) => {
                            fields[field.id ? field.id?.toString() : field.label] = field;
                            options.push({
                                label: field.label,
                                value: field.id?.toString()
                            })
                        })
                    });
                    setFormFieldForCondition(fields)
                }
                setOptionsFieldForm(options);
            })
        }
    }, [formId]);

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
                            {property.next && property.value && property.next[property.value] ? 
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

    const onChangeHandler = (e: any, propertyKey: any, setNodes: any, taskId: any, property: any) => {
        onChangeHandlerWithConditionProperty(e, propertyKey, setNodes, taskId, property, null);
    }

    const onChangeHandlerWithConditionProperty = (e: any, propertyKey: any, setNodes: any, taskId: any, property: any, conditionPropertyType:any) => {
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
                        propertiesChanged[propertyKey] = {
                            ...property, 
                            value: property.type === PROPERTIES_TYPES.CONDITION 
                                ? getConditionPropertyValue(property, e, conditionPropertyType) 
                                : getInputValue(property, e)
                        }
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
        if (propertyType === PROPERTIES_TYPES.TEXT_AREA || propertyType === PROPERTIES_TYPES.SINGLE_TEXT) {
            return e.target.value;
        } else if (propertyType === PROPERTIES_TYPES.VARIABLE) {
            return e.target.value.trim();
        }
        return e;

    }

    const getConditionPropertyValue = (property: any, e:any, conditionPropertyType: any) => {
        const {value} = property;
        switch(conditionPropertyType) {
            case "formVariableName":
                value.formVariableName = e;
                if (e !== "") {
                    setFormId(fromVariablesFormTypes[e]);
                }
                break;
            case "leftOperand":
                value.leftOperand = e;
                value.operation = "";
                value.rightOperand = ""
                break;
            case "operation":
                value.operation = e;
                break;
            case "rightOperand":
                value.rightOperand = e.target ? e.target.value.trim() : e;
                break;
        }
        return value;
    }

    const getFormFieldForConditionType = (propertyKey: any, formVariableName: any) => {
        if (formFieldForCondition[propertyKey]) {
            return formFieldForCondition[propertyKey].type;
        } else {
            // const fromVariablesFormTypes = getFromVariablesFormTypesFromNodes();
            // if (fromVariablesFormTypes && fromVariablesFormTypes[formVariableName]) {
            //     setFormId(fromVariablesFormTypes[formVariableName]);
            // }
            return null;
        }
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
                        showSearch
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
            case PROPERTIES_TYPES.CONDITION:
                property.value = property.value ? property.value : {
                    formVariableName: "",
                    leftOperand: optionsFieldForm.length > 0 ? optionsFieldForm[0].value : "",
                    operation: "",
                    rightOperand: ""
                };
                property.options = []
                return (
                    <Flex vertical gap={15} className='pl-2'>
                        <Flex vertical gap={2}>
                            <Text className='mb-2'>Select form:</Text>
                            <Select
                                showSearch
                                className='w-[150px]'
                                value={(property.value.formVariableName as string)}
                                onChange={(e) => onChangeHandlerWithConditionProperty(e, propertyKey, setNodes, taskId, property, "formVariableName")}
                                options={property.optionsType ? getOptionsForType(property.optionsType, taskId, property.options) : property.options}
                            />
                        </Flex>
                        <Flex vertical>
                            <Text className='mb-2'>Define condition:</Text>
                            <Flex vertical>
                                <Select
                                    showSearch
                                    className='w-[170px]'
                                    value={(property.value.leftOperand as string)}
                                    disabled={property.value.formVariableName === ""}
                                    onChange={(e) => onChangeHandlerWithConditionProperty(e, propertyKey, setNodes, taskId, property, "leftOperand")}
                                    options={ optionsFieldForm }
                                />
                                <Flex>
                                    <Select
                                        className='w-[120px]'
                                        value={(property.value.operation as string)}
                                        disabled={property.value.leftOperand === ""}
                                        onChange={(e) => onChangeHandlerWithConditionProperty(e, propertyKey, setNodes, taskId, property, "operation")}
                                        options={ property.value.leftOperand !== "" ? getOperationByFieldType(getFormFieldForConditionType(property.value.leftOperand, property.value.formVariableName)) : []}
                                    />
                                    {getRightOperandViewByFieldType(property.value.leftOperand !== "" ? getFormFieldForConditionType(property.value.leftOperand, property.value.formVariableName) : "", propertyKey, property)}
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
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

    const getOperationByFieldType = (type: any) => {
        if (!type) {
            return []
        }
        switch(type) {
            case FORM_FIELD_TYPES.SINGLE_TEXT:
                return operations.isOptions.concat(operations.containsOptions)
            case FORM_FIELD_TYPES.MULTI_TEXT:
                return operations.containsOptions
            case FORM_FIELD_TYPES.SINGLE_SELECT:
                return operations.isOptions
            case FORM_FIELD_TYPES.MULTI_SELECT:
                return operations.containsOptions
            case FORM_FIELD_TYPES.TEXT_AREA:
                return operations.isOptions.concat(operations.containsOptions)
            case FORM_FIELD_TYPES.NUMBER:
                return operations.numberOptions
            case FORM_FIELD_TYPES.BOOLEN:
                return operations.isOptions
        }
    }

    const getRightOperandViewByFieldType = (type: any, propertyKey: any, property: any) => {
        switch(type) {
            case FORM_FIELD_TYPES.SINGLE_TEXT:
            case FORM_FIELD_TYPES.MULTI_TEXT:
            case FORM_FIELD_TYPES.TEXT_AREA:
                return (
                <Input
                    allowClear
                    className='w-[180px]'
                    value={(property.value.rightOperand as string)}
                    onChange={(e) => onChangeHandlerWithConditionProperty(e, propertyKey, setNodes, taskId, property, "rightOperand")}
                ></Input>)
            case FORM_FIELD_TYPES.SINGLE_SELECT:
            case FORM_FIELD_TYPES.MULTI_SELECT:
                return (
                    <Select
                        className='w-[150px]'
                        value={(property.value.rightOperand as string)}
                        disabled={property.value.leftOperand === ""}
                        onChange={(e) => onChangeHandlerWithConditionProperty(e, propertyKey, setNodes, taskId, property, "rightOperand")}
                        options={ getOptionsForRightOperand(property) }
                    />
                )
            case FORM_FIELD_TYPES.NUMBER:
                return (
                    <InputNumber
                        className='w-[70px]'
                        value={(property.value.rightOperand as number)}
                        onChange={(e) => onChangeHandlerWithConditionProperty(e?.toString(), propertyKey, setNodes, taskId, property, "rightOperand")}
                    ></InputNumber>
                )
            case FORM_FIELD_TYPES.BOOLEN:
                return (
                    <Select
                        className='w-[70px]'
                        value={(property.value.rightOperand as string)}
                        disabled={property.value.leftOperand === ""}
                        onChange={(e) => onChangeHandlerWithConditionProperty(e, propertyKey, setNodes, taskId, property, "rightOperand")}
                        options={ [{label: "true", value: "true"}, {label: "false", value: "false"}] }
                    />
                )
            default:
                return (
                    <Select
                        className='w-[150px]'
                        disabled
                    />
                )
        }
    }

    const getOptionsForRightOperand = (property: any) => {
        if (formFieldForCondition[property.value.leftOperand] && formFieldForCondition[property.value.leftOperand].options) {
            return formFieldForCondition[property.value.leftOperand].options?.map((option: string) => {
                return {
                    label: option,
                    value: option
                }
            })
        }
        return []
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