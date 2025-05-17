"use client";

import React, {
    useState,
    useEffect,
    use
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
    message
} from 'antd';
import {
    ArrowLeftOutlined,
    ArrowRightOutlined,
    PlusOutlined
} from '@ant-design/icons';
import FORM_FIELD_TYPES from '../form-creation/formTypes';
import dayjs from 'dayjs';
import { useGlobalContext } from '@/components/context/GlobalContext';
import '@ant-design/v5-patch-for-react-19';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const { Text } = Typography;
const { TextArea } = Input;


const FormRecordModal = (props: any) => {
    const {formRecordData, isForFormRecordCreation, isReadOnly, isForApproval, correlationId} = props;
    const [currentPage, setCurrentPage] = useState(0);
    const [formFieldRecords, setFormFieldRecords] = useState([[]]);
    const [forms, setForms] = useState<any>({});
    const [formOptions, setFormOptions] = useState([]);
    const [formKey, setFormKey] = useState(0);
    const { setTriggerNotificationsReload, authInfo } = useGlobalContext();
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
    

    useEffect(() => {
        fetch(`${API_URL}/form/organisation/${authInfo.userInfo.organisationId}`)
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

    useEffect(() => {
        if (formRecordData) {
            setFormKey(formRecordData.formId);
            setFormFieldRecords(() => getAndSetPagesFromFlatFormFieldRecords());
        } else {
            setFormKey(0);
            setFormFieldRecords([[]]);
        }
    }, [formRecordData]);

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
                        allowClear={!isReadOnly}
                        className='w-[300px]'
                        value={(value as string)}
                        onChange={isReadOnly ? (()=>{}) : ((e) => onChangeHandler(e, formFieldRecord))}
                    ></Input>
                )
            case FORM_FIELD_TYPES.MULTI_TEXT:
                return (
                    <Select
                        mode="tags"
                        className='w-[300px]'
                        value={(arrayValues as string)}
                        onChange={isReadOnly ? (()=>{}) : ((e) => onChangeHandler(e, formFieldRecord))}
                        options={formField.options}
                    />
                )
            case FORM_FIELD_TYPES.TEXT_AREA:
                return (
                    <TextArea
                        allowClear={!isReadOnly}
                        className='w-[500px] h-[120px] resize-none'
                        value={(value as string)}
                        onChange={isReadOnly ? (()=>{}) : ((e) => onChangeHandler(e, formFieldRecord))}
                    ></TextArea>
                )
            case FORM_FIELD_TYPES.SINGLE_SELECT:
                return (
                    <Select
                        showSearch
                        className='w-[200px]'
                        value={(value as string)}
                        onChange={isReadOnly ? (()=>{}) : ((e) => onChangeHandler(e, formFieldRecord))}
                        options={formField.options ? formField.options : [] }
                    />
                )
            case FORM_FIELD_TYPES.MULTI_SELECT:
                return (
                    <Select
                        mode="multiple"
                        className='w-[300px]'
                        value={arrayValues}
                        onChange={isReadOnly ? (()=>{}) : ((e) => onChangeHandler(e, formFieldRecord))}
                        options={formField.options ? formField.options : []}
                    />
                )
            case FORM_FIELD_TYPES.NUMBER:
                return (
                    <InputNumber
                        className='w-[300px]'
                        value={(value as number)}
                        onChange={isReadOnly ? (()=>{}) : ((e) => onChangeHandler(e, formFieldRecord))}
                    ></InputNumber>
                )
            case FORM_FIELD_TYPES.BOOLEN:
                return (
                    <Switch
                        className='w-[50px]'
                        value={(value as boolean)}
                        onChange={isReadOnly ? (()=>{}) : ((e) => onChangeHandler(e, formFieldRecord))}
                    ></Switch>
                )
            case FORM_FIELD_TYPES.DATE:
                return (
                    <DatePicker
                        format="MM-DD-YYYY"
                        className='w-[120px]'
                        value={value !== "" ? dayjs(value, 'MM-DD-YYYY') : ""}
                        onChange={isReadOnly ? (()=>{}) : ((e, dateString) => onChangeHandler(dateString, formFieldRecord))}
                    ></DatePicker>
                )
            // case FORM_FIELD_TYPES.UPLOAD:
        }
    }

    const onChangeHandler = (value: any, formFieldRecord: any) => {
        value = value && value.target ? value.target.value : value;
        const formField = formFieldRecord.formField;
        setFormFieldRecords((prev: any) => {
            const newPage = [...prev];
            if(Array.isArray(value)) {
                newPage[formField.pageNumber][formField.index].arrayValues = value;
            } else {
                newPage[formField.pageNumber][formField.index].value = value;
            }
            return newPage;
        })
    }

    const onSend = async () => {
        if (formKey === 0) return;
        try {
            setShowMessage({ type: 'success', message: 'Form record sent successfully!' });
            const response = await fetch(`${API_URL}/workflowInstance/trigger`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                personKey: authInfo.userInfo.id,
                formKey: formKey,
                formRecord: {
                    formId: formKey.toString(),
                    form: forms[formKey],
                    userId: String(authInfo.userInfo.id),
                    completedAt: dayjs().format('MM-DD-YYYY'),
                    fieldRecords: getFlatFormFieldRecords(),
                    organisationId: authInfo.userInfo.organisationId, 
                    completedBy: null
                }
              }),
            });
            if (!response.ok) throw new Error("Failed to send");
            
        } catch (err) {
            setShowMessage({ type: 'error', message: 'Failed to send form record!' });
        }
    }

    const getAndSetPagesFromFlatFormFieldRecords = () => {
        const pages: any = [[]];
        formRecordData.fieldRecords.forEach((formFieldRecord: any) => {
            if (!pages[formFieldRecord.formField.pageNumber]) {
                pages[formFieldRecord.formField.pageNumber] = [];
            }
            pages[formFieldRecord.formField.pageNumber][formFieldRecord.formField.index] = {
                ...formFieldRecord,
                formField: {
                    ...formFieldRecord.formField,
                    options: formFieldRecord.formField.options.length > 0 ? formFieldRecord.formField.options.map((option: any) => {
                        return {
                            label: option,
                            value: option
                        }
                    }) : [],
                },
            };
        })
        setFormFieldRecords((prev) => pages);
        return pages;
    }

    const sendReply = async () => {
        try {
            const response = await fetch(`${API_URL}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    correlationId: correlationId, 
                    textMessage: "test",
                    replyForm: {
                        id: formRecordData ? formRecordData.id : null,
                        formId: formKey.toString(),
                        form: forms[formKey],
                        userId: String(authInfo.userInfo.id),
                        completedAt: dayjs().format('MM-DD-YYYY'),
                        fieldRecords: getFlatFormFieldRecords(),
                    }
                }),
            });
            if (!response.ok) throw new Error("Failed to send reply");
            setTriggerNotificationsReload((prev: any) => !prev);
            setShowMessage({ type: 'success', message: 'Reply sent successfully!' });
        } catch (err) {
            setShowMessage({ type: 'error', message: 'Failed to send reply!' });
        }
    };

    const sendApprovalReply = async (verdict: string) => {
        try {
            const response = await fetch(`${API_URL}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    correlationId: correlationId, 
                    textMessage: verdict,
                    replyForm: null
                }),
            });
            if (!response.ok) throw new Error("Failed to send approve");
            setTriggerNotificationsReload((prev: any) => !prev);
            setShowMessage({ type: 'success', message: 'Response sent successfully!' });
        } catch (err) {
            setShowMessage({ type: 'error', message: 'Failed to send response!' });
        }
    };

    const getFlatFormFieldRecords = () => {
        const flatFormFieldRecords: any = [];
        formFieldRecords.forEach((page: any) => {
            page.forEach((formFieldRecord: any) => {
                flatFormFieldRecords.push({
                    ...formFieldRecord,
                    formField: {
                        ...formFieldRecord.formField,
                        options: formFieldRecord.formField.options.length > 0 ? formFieldRecord.formField.options.map((option: any) => {
                            return option.value;
                        }) : [],
                    },
                });
            })
        })
        return flatFormFieldRecords;
    }

    return (<>
        {contextHolder}
        <div>
            <div 
                className="h-[85vh] w-[45vw] pb-6 flex items-center justify-center bg-white rounded-lg shadow"
            >
                <Flex vertical className='h-full w-full'>
                    {isForFormRecordCreation ? (<div className='h-[80px] w-full mb-3'>
                        <Flex gap={10} align='center' className='h-full px-8 border-b border-gray-100'>
                            <Text className='text-[15px] font-semibold'>Form type:</Text>
                            <Select
                                onChange={(formId) => setFormRecordFields(formId)}
                                style={{ width: 230, }}
                                options={formOptions}
                            />
                        </Flex>
                    </div>) : (<></>)}
                    <div className='flex-1 p-1 px-8 overflow-y-auto'>
                        <Flex vertical className='h-full w-full'>
                            {(formFieldRecords[currentPage].map((formFieldRecord: any, index: number) => {
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
                                disabled={currentPage + 1 >= formFieldRecords.length}
                                color="default" 
                                variant="filled"
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                <ArrowRightOutlined className='h-[10px] w-[10px]' />
                            </Button>
                        </Flex>
                        {!isReadOnly ? ( <Flex justify='flex-end' className='h-[50%]'>
                            {/* <Button color="default" variant="solid">
                                Preview
                            </Button> */}
                            <Button onClick={isForFormRecordCreation ? (onSend) : (sendReply)} color="default" variant="solid">
                                {isForFormRecordCreation ? "Send" : "Send Reply"}
                            </Button>
                        </Flex>) : (<></>)}
                        {isForApproval ? (<Flex justify='center' className='h-[50%]' gap={10}>
                            <Button onClick={() => sendApprovalReply("reject")} color="danger" style={{width: 85,}} variant="solid">
                                Reject
                            </Button>
                            <Button onClick={() => sendApprovalReply("approved")} type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', width: 85, }} variant="solid">
                                Approve
                            </Button>
                        </Flex>) : (<></>)}
                    </Flex>
                </Flex>

            </div>
        </div>
    </>)
}

export default FormRecordModal