"use client";

import React, {
    useState, useRef, useEffect
} from 'react'
import { Button, Typography, Input, Flex, message } from 'antd';
import FormCreationField from './FormCreationField';
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { Form, FormField } from './formTypes';
import FORM_FIELD_TYPES from './formTypes';
import { useGlobalContext } from '@/components/context/GlobalContext';
import '@ant-design/v5-patch-for-react-19';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const { Text } = Typography;
const { TextArea } = Input;

const FormCreationModal = (props:any) => {
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

    const { formData, setTriggerReload } = props;
    const [form, setForm] = useState<Form>({
        label: formData.label,
        description: formData.description,
        pages: formData.pages ? formData.pages : [[]],
    });
    const [currentPage, setCurrentPage] = useState(0);
    const containerRef = useRef(null);
    const [addButtonPressed, setAddButtonPressed] = useState(false);
    const { authInfo, setAuthInfo } = useGlobalContext();
    

    useEffect(() => {
        const container: any = containerRef.current;
        if (container) {
        container.scrollTop = container.scrollHeight;
        }
    }, [addButtonPressed]); 

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
        setAddButtonPressed((prev) => !prev);
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
                id: formData.id ? formData.id : null,
                lastModifiedById: authInfo.userInfo.id,
                organisationId: authInfo.userInfo.organisationId,
                lastModifiedAt: (new Date()).toISOString().slice(0, 19),
              }),
            });
            if (!response.ok) throw new Error("Failed to fetch data");
            setTriggerReload((prev: any) => !prev);
            setShowMessage({ type: 'success', message: 'Form saved successfully!' });
        } catch (err) {
            setShowMessage({ type: 'error', message: 'Failed to save form!' });
        }
    }

    return (<>
        {contextHolder}
        <div>
            <div 
                className="h-[600px] w-[60vw] px-8 py-4 flex items-center justify-center bg-white rounded-lg shadow"
            >
                <Flex vertical className='h-full w-full'>
                    <Flex className='h-[10%]' justify='space-between' align='center' gap={10}>
                        <Input 
                            value={form.label ? form.label : ""}
                            onChange={(e) => setForm((prev: Form) => { return {...prev, label: e.target.value}})} 
                            className='w-[200px]' placeholder="Label" variant="underlined" 
                        />
                        <TextArea 
                            value={form.description ? form.description : ""}
                            onChange={(e) => setForm((prev: Form) => { return {...prev, description: e.target.value}})}
                            className='w-[400px]' placeholder="Description" rows={2} 
                        />
                    </Flex>
                    <Flex ref={containerRef} vertical className='h-[80%] px-1 py-5 overflow-y-auto' gap={15}>
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
                        <Button className='w-[40px] min-h-[30px]' onClick={addField} color="default" variant="solid">
                            <PlusOutlined />
                        </Button>
                    </Flex>
                    <Flex vertical className='h-[10%] pt-3 border-t border-gray-100'>
                        <Flex className='h-[40%]' gap={10} justify='center' align='center'>
                            <Button 
                                className='h-[15px]' 
                                disabled={currentPage + 1 === 1}  
                                color="default" 
                                variant="filled"
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                <ArrowLeftOutlined className='h-[10px] w-[10px]' />
                            </Button>
                            <div className='w-[20px] flex justify-center'>
                                <Text>{currentPage + 1}</Text>
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
    </>)
}

export default FormCreationModal