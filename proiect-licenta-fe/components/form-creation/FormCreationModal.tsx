"use client";

import React, {
    useState
} from 'react'
import { Button, Typography, Input, Flex } from 'antd';
import FormCreationField from './FormCreationField';
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { Form, FormField } from './formTypes';
import FORM_FIELD_TYPES from './formTypes';
import '@ant-design/v5-patch-for-react-19';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const { Text } = Typography;

const FormCreationModal = () => {
    const [form, setForm] = useState<Form>({
        label: "",
        pages: [[], []]
    });
    const [currentPage, setCurrentPage] = useState(1);

    const onLabelChange = (e:any) => {
        setForm((prev: Form) => {
            return {
                ...prev,
                label: e.target.value
            }
        })
    }

    const onFieldChange = (e:any, fieldIndex: number, fieldPropertyType: string) => {
        setForm((prev: Form) => {
            const {pages} = prev
            switch(fieldPropertyType) {
                case "label": 
                    pages[currentPage][fieldIndex].label = e.target.value
                    break;
                case "type":
                    pages[currentPage][fieldIndex].type = e 
                    break;
                case "options": 
                    pages[currentPage][fieldIndex].options = e 
                    break;
            }
            
            return {
                ...prev,
                pages: pages
            }
        })
    }

    const addField = () => {
        setForm((prev: Form) => {
            const {pages} = prev;

            if (!pages[currentPage]) {
                pages[currentPage] = []
            }
            pages[currentPage].push({
                label: "",
                type: FORM_FIELD_TYPES.SINGLE_TEXT
            })
            
            return {
                ...prev,
                pages: pages
            }
        })
    }

    const saveForm = async () => {
        try {
            const response = await fetch(`${API_URL}/form`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...form,
                organisationId: 1
              }),
            });
            if (!response.ok) throw new Error("Failed to fetch data");
        } catch (err) {
        }
    }

    return (
        <div>
            <div 
                className="h-[85vh] w-[60vw] p-8 flex items-center justify-center bg-white rounded-lg shadow"
            >
                <Flex vertical className='h-full w-full'>
                    <div className='h-[40px] mb-3'>
                        <Input onChange={(e) => onLabelChange(e)} className='w-[60%]' placeholder="Form label" variant="underlined" />
                    </div>
                    <div className='flex-1 p-1 overflow-y-auto'>
                        { form.pages[currentPage] && form.pages[currentPage].length > 0 
                            ? form.pages[currentPage].map((field, index) => (
                            <FormCreationField 
                                key={index} 
                                fieldData = {field}
                                index={index}
                                onFieldChange={onFieldChange}
                                setForm={setForm}
                                currentPage={currentPage}
                            ></FormCreationField>
                        ) ) : (<></>)}
                        <Button onClick={addField} color="default" variant="solid">
                            <PlusOutlined />
                        </Button>
                    </div>
                    <Flex vertical className='h-[80px] pt-3 border-t border-gray-100' gap={12}>
                        <Flex className='h-[40%]' gap={10} justify='center' align='center'>
                            <Button 
                                className='h-[15px]' 
                                disabled={currentPage === 1}  
                                color="default" 
                                variant="filled"
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                <ArrowLeftOutlined className='h-[10px] w-[10px]' />
                            </Button>
                            <div className='w-[20px] flex justify-center'>
                                <Text>{currentPage}</Text>
                            </div>
                            <Button 
                                className='h-[15px]' 
                                color="default" 
                                variant="filled"
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                <ArrowRightOutlined className='h-[10px] w-[10px]' />
                            </Button>
                        </Flex>
                        <Flex justify='flex-end' className='h-[50%]'>
                            {/* <Button color="default" variant="solid">
                                Preview
                            </Button> */}
                            <Button onClick={saveForm} color="default" variant="solid">
                                Save
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
            </div>
        </div>
    )
}

export default FormCreationModal