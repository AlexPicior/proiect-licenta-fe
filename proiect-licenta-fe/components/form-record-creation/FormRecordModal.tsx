"use client";

import React, {
    useState,
    useEffect
} from 'react'
import { 
    Input,
    Typography,
    Select, 
    InputNumber,
    Switch,
    Flex, 
    Button, 
    DatePicker,
} from 'antd';
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    PlusOutlined
} from '@ant-design/icons';
import FORM_FIELD_TYPES from '../form-creation/formTypes';
import dayjs from 'dayjs';
import '@ant-design/v5-patch-for-react-19';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
const BROKER_URL = 'http://localhost:8080/ws'; // TODO Replace with your RabbitMQ WebSocket URL


const API_URL = process.env.NEXT_PUBLIC_API_URL;

const { Text } = Typography;
const { TextArea } = Input;


const FormRecordModal = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [formFieldRecords, setFormFieldRecords] = useState([[]]);
    const [forms, setForms] = useState<any>({});
    const [formOptions, setFormOptions] = useState([]);
    const [formKey, setFormKey] = useState(0);

    useEffect(() => {
        fetch(`${API_URL}/form/organisation/${1}`)
        .then(response => response.json())
        .then(formJsons => {
            const formsAvaiableForOrganisation: any = {};
            formJsons.forEach((form: any) => {
                formsAvaiableForOrganisation[form.id] = form;
            });
            setForms((prev: any) => formsAvaiableForOrganisation);
            const formOptions = formJsons.map((form: any) => {
                return {
                    value: form.id,
                    label: form.label
                }
            });
            setFormOptions((prev) => formOptions);
        })
        .catch(error => {
            console.error('Error fetching forms:', error);
        });
    }, []);

    const setFormRecordFields = (formId: any) => {
        setFormKey(formId);
        setFormFieldRecords(() => forms[formId].pages.map((page: any) => {
            const newPage = page.map((field: any) => {
                return {
                    formField: {
                        ...field,
                        options: field.options.length > 0 ? field.options.map((option: any) => {
                            return {
                                label: option,
                                value: option
                            }
                        }) : [],
                    },
                    value: "",
                    arrayValues: [],
                }
            })
            return newPage;
        }));
    }

    const getFormFieldView = (formFieldRecord: any) => {
        const { formField, value, arrayValues } = formFieldRecord;
        switch(formField.type) {
            case FORM_FIELD_TYPES.SINGLE_TEXT:
                return (
                    <Input
                        allowClear
                        className='w-[300px]'
                        value={(value as string)}
                        onChange={(e) => onChangeHandler(e, formFieldRecord)}
                    ></Input>
                )
            case FORM_FIELD_TYPES.MULTI_TEXT:
                return (
                    <Select
                        mode="tags"
                        className='w-[300px]'
                        value={(arrayValues as string)}
                        onChange={(e) => onChangeHandler(e, formFieldRecord)}
                        options={formField.options}
                    />
                )
            case FORM_FIELD_TYPES.TEXT_AREA:
                return (
                    <TextArea
                        allowClear
                        className='w-[500px] h-[120px] resize-none'
                        value={(value as string)}
                        onChange={(e) => onChangeHandler(e, formFieldRecord)}
                    ></TextArea>
                )
            case FORM_FIELD_TYPES.SINGLE_SELECT:
                return (
                    <Select
                        showSearch
                        className='w-[200px]'
                        value={(value as string)}
                        onChange={(e) => onChangeHandler(e, formFieldRecord)}
                        options={formField.options ? formField.options : [] }
                    />
                )
            case FORM_FIELD_TYPES.MULTI_SELECT:
                return (
                    <Select
                        mode="multiple"
                        className='w-[300px]'
                        value={arrayValues}
                        onChange={(e) => onChangeHandler(e, formFieldRecord)}
                        options={formField.options ? formField.options : []}
                    />
                )
            case FORM_FIELD_TYPES.NUMBER:
                return (
                    <InputNumber
                        value={(value as number)}
                        onChange={(e) => onChangeHandler(e, formFieldRecord)}
                    ></InputNumber>
                )
            case FORM_FIELD_TYPES.BOOLEN:
                return (
                    <Switch
                        className='w-[50px]'
                        value={(value as boolean)}
                        onChange={(e) => onChangeHandler(e, formFieldRecord)}
                    ></Switch>
                )
            case FORM_FIELD_TYPES.DATE:
                return (
                    <DatePicker
                        format="MM-DD-YYYY"
                        className='w-[120px]'
                        value={value !== "" ? dayjs(value, 'MM-DD-YYYY') : ""}
                        onChange={(e, dateString) => onChangeHandler(dateString, formFieldRecord)}
                    ></DatePicker>
                )
            // case FORM_FIELD_TYPES.UPLOAD:
        }
    }

    const onChangeHandler = (value: any, formFieldRecord: any) => {
        value = value.target ? value.target.value : value;
        const formField = formFieldRecord.formField;
        setFormFieldRecords((prev: any) => {
            const newPage = [...prev];
            if(Array.isArray(value)) {
                newPage[formField.pageNumber-1][formField.index].arrayValues = value;
            } else {
                newPage[formField.pageNumber-1][formField.index].value = value;
            }
            return newPage;
        })
    }

    const onSend = async () => {
        if (formKey === 0) return;
        try {
            const response = await fetch(`${API_URL}/workflowInstance/trigger`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                personKey: 3,
                formKey: formKey,
                formRecord: {
                    formId: formKey.toString(),
                    form: forms[formKey],
                    userId: String(3),
                    completedAt: dayjs().format('MM-DD-YYYY'),
                    fieldRecords: getFlatFormFieldRecords(),
                }
              }),
            });
            if (!response.ok) throw new Error("Failed to send");
        } catch (err) {
            console.error('Error sending form record:', err);
        }
    }

    const [currentUserId, setCurrentUserId] = useState(3); // TODO Replace with your current user ID logic
    
    useEffect(() => {
        if (!currentUserId) return;
    
        const client = new Client({
            webSocketFactory: () => new SockJS(BROKER_URL),
            debug: str => console.log('[STOMP]', str),
            reconnectDelay: 5000,
            onConnect: () => {
            const queue = `/topic/user.${currentUserId}`;
            client.subscribe(queue, msg => {
                const msgBody = JSON.parse(msg.body);
                console.log('Received msg:', msgBody);});
            },
        });
    
        client.activate();
        return () => {
            client.deactivate();
        };
    }, [currentUserId]);

    const sendReply = async () => {
        await fetch(`${API_URL}/reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                correlationId: 1, 
                textMessage: "test",
                replyForm: {
                    formId: formKey.toString(),
                    form: forms[formKey],
                    userId: String(3),
                    completedAt: dayjs().format('MM-DD-YYYY'),
                    fieldRecords: getFlatFormFieldRecords(),
                }
            }),
        });
    };

    const getFlatFormFieldRecords = () => {
        const flatFormFieldRecords: any = [];
        formFieldRecords.forEach((page: any) => {
            page.forEach((formFieldRecord: any) => {
                flatFormFieldRecords.push(formFieldRecord);
            })
        })
        return flatFormFieldRecords;
    }

    return (
        <div>
            <div 
                className="h-[85vh] w-[45vw] pb-6 flex items-center justify-center bg-white rounded-lg shadow"
            >
                <Flex vertical className='h-full w-full'>
                    <div className='h-[80px] mb-3'>
                        <Flex gap={10} align='center' className='h-full px-8 border-b border-gray-100'>
                            <Text className='text-[15px] font-semibold'>Form type:</Text>
                            <Select
                                onChange={(formId) => setFormRecordFields(formId)}
                                style={{ width: 230 }}
                                options={formOptions}
                            />
                        </Flex>
                    </div>
                    <div className='flex-1 p-1 px-8 overflow-y-auto'>
                        <Flex vertical className='h-full w-full'>
                            {(formFieldRecords[currentPage - 1].map((formFieldRecord: any, index: number) => {
                                return (
                                    <Flex key={index} vertical className={`w-full ${formFieldRecord.formField.type !== FORM_FIELD_TYPES.TEXT_AREA ? "h-[80px]" : "h-fit"} p-2 `} gap={10}>
                                        <Text>{formFieldRecord.formField.label}</Text>
                                        {getFormFieldView(formFieldRecord)}
                                    </Flex>
                                )
                            }))}
                        </Flex>
                    </div>
                    <Flex vertical className='h-[80px] pt-3 px-8 border-t border-gray-100' gap={12}>
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
                                disabled={currentPage >= formFieldRecords.length}
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
                            <Button onClick={onSend} color="default" variant="solid">
                                Send
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>

            </div>
            <div>
                <Button onClick={() => sendReply()}>Send Reply</Button>
            </div>
        </div>
    )
}

export default FormRecordModal