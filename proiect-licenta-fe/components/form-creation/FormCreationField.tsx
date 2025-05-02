import React from 'react'
import { Flex, Typography, Input, Select, Button } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { Form, FormField } from './formTypes';
import FORM_FIELD_TYPES from './formTypes';


const { Text } = Typography;

const moveItemUp = (arr:any, index:any) => {
    if (index <= 0 || index >= arr.length) return arr; 
  
    const newArr = [...arr]; 
    [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
    return newArr;
}

const moveItemDown = (arr:any, index:any) => {
    if (index < 0 || index >= arr.length - 1) return arr; 
  
    const newArr = [...arr]; 
    [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];
    return newArr;
}

const FormCreationField = ({fieldData, index, onFieldChange, setForm, currentPage}: {fieldData: FormField, index: number, onFieldChange: any, setForm: any, currentPage: number}) => {
    const onFieldMove = (movementType: string) => {
        setForm((prev: Form) => {
            const {pages} = prev
            switch(movementType) {
                case "up": 
                    pages[currentPage] = moveItemUp(prev.pages[currentPage], index)
                    break;
                case "down":
                    pages[currentPage] = moveItemDown(prev.pages[currentPage], index)
                    break;
                case "delete": 
                    pages[currentPage] = prev.pages[currentPage].filter((e, i) => i !== index)
                    break;
            }
            
            return {
                ...prev,
                pages: pages
            }
        })
    }
    return (
        <div className='h-[70px] w-[98%]'>
            <Flex className='w-full' justify='flex-end' gap={15}>
                <Flex className='flex-1' vertical gap={2}>
                    <Text>Label</Text>
                    <Input value={fieldData.label} onChange={(e) => onFieldChange(e, index, "label")} variant="filled" className='w-full' />
                </Flex>
                <Flex className='w-[25%]' vertical gap={2}>
                    <Text>Type</Text>
                    <Select
                        value={fieldData.type}
                        onChange={(e) => onFieldChange(e, index, "type")}
                        defaultValue={FORM_FIELD_TYPES.SINGLE_TEXT}
                        className='w-full'
                        options={[
                            { value: FORM_FIELD_TYPES.SINGLE_TEXT, label: 'Text' },
                            { value: FORM_FIELD_TYPES.MULTI_TEXT, label: 'Multiple text' },
                            { value: FORM_FIELD_TYPES.TEXT_AREA, label: 'Text area' },
                            { value: FORM_FIELD_TYPES.SINGLE_SELECT, label: 'Single select' },
                            { value: FORM_FIELD_TYPES.MULTI_SELECT, label: 'Multiple select' },
                            { value: FORM_FIELD_TYPES.NUMBER, label: 'Number' },
                            { value: FORM_FIELD_TYPES.BOOLEN, label: 'TrueFals' },
                            { value: FORM_FIELD_TYPES.DATE, label: 'Date' },
                            // { value: FORM_FIELD_TYPES.UPLOAD, label: 'Upload' },
                        ]}
                    />
                </Flex>
                { fieldData.type === FORM_FIELD_TYPES.SINGLE_SELECT || fieldData.type === FORM_FIELD_TYPES.MULTI_SELECT ? 
                    (<Flex className='w-[30%]' vertical gap={2}>
                        <Text>Options</Text>
                        <Select
                            value={fieldData.options ? fieldData.options : []}
                            onChange={(e) => onFieldChange(e, index, "options")}
                            maxTagCount= 'responsive'
                            mode="tags"
                            className='w-full'
                        />
                    </Flex>) : (<></>)
                }
                <Flex vertical className='w-[12%]'>
                    <Text>{'\u200B'}</Text>
                    <Flex className='flex-1' justify='center' align='center'>
                        <Button 
                            onClick={() => onFieldMove('up')} 
                            className='h-[20px] w-[15px]' 
                            type="text"
                        >
                            <ArrowUpOutlined />
                        </Button>
                        <Button
                            onClick={() => onFieldMove('down')} 
                            className='h-[20px] w-[15px]' 
                            type="text"
                        >
                            <ArrowDownOutlined />
                        </Button>
                        <Button 
                            onClick={() => onFieldMove('delete')} 
                            className='h-[20px] w-[15px]' 
                            type="text"
                        >
                            <DeleteOutlined />
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </div>
    )
}

export default FormCreationField