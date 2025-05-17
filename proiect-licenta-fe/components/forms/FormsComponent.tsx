'use client';

import React, { useState, useEffect } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { GetProp, RadioChangeEvent, TableProps } from 'antd';
import { Flex, Radio, Space, Switch, Table, Button, message } from 'antd';
import { useGlobalContext } from '@/components/context/GlobalContext';
import FormCreationModal from '../form-creation/FormCreationModal';
import dayjs from 'dayjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SizeType = TableProps['size'];
type ColumnsType<T extends object> = GetProp<TableProps<T>, 'columns'>;
type TablePagination<T extends object> = NonNullable<Exclude<TableProps<T>['pagination'], boolean>>;
type TablePaginationPosition = NonNullable<TablePagination<any>['position']>[number];
type ExpandableConfig<T extends object> = TableProps<T>['expandable'];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
  key: number;
  formId: number;
  label: string;
  description: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  form: any;
}

const FormsComponent = () => {
  const [formData, setFormData] = useState<any>({});
  const [triggerReload, setTriggerReload] = useState(false);
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
    .then(formJSON => {
        setFormData((prev:any) => { 
            formJSON.sort((a: DataType, b: DataType) => dayjs(b.lastModifiedAt).unix() - dayjs(a.lastModifiedAt).unix())
            return formJSON;
        });
        setLoading(false);
    })
    .catch(error => {
        console.error('Error fetching forms:', error);
    });
  }, [triggerReload]);

  const [expandedRowKeys, setExpandedRowKeys] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState<TableRowSelection<DataType> | undefined>({});
  const [tableLayout, setTableLayout] = useState<string>('fixed');
  const [top, setTop] = useState<TablePaginationPosition>('none');
  const [bottom, setBottom] = useState<TablePaginationPosition>('bottomRight');
  const [ellipsis, setEllipsis] = useState(false);
  const [yScroll, setYScroll] = useState(false);
  const [xScroll, setXScroll] = useState<string>('unset');
  const { authInfo, setAuthInfo } = useGlobalContext();

  const getTableData = () => {
    if (!Array.isArray(formData)) {
      return [];
    }
    const tableData: DataType[] = formData.map<DataType>((form: any, index: number) => ({
      key: (form.id as number),
      formId: (form.id as number),
      label: form.label ? (form.label as string) : 'N/A',
      description: form.description ? (form.description as string) : 'N/A',
      lastModifiedAt: form.lastModifiedAt ? getFormatedSentAt(form.lastModifiedAt) : 'N/A',
      lastModifiedBy: (form.lastModifiedBy.email as string),
      form: (form as any),
    }));
    return tableData;
  }

  const getFormatedSentAt = (dateString: string) => {
    const fixedInput = dateString.replace(/\./g, '-');

    const date = new Date(fixedInput);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  const deleteForm = async (formId: number) => {
    try {
      const response = await fetch(`${API_URL}/form/${formId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to fetch data");
    
      setFormData((prevData: any) => {
        return prevData.filter((form: any) => form.id !== formId);
      });
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'Form deleted successfully!' });
    } catch (error) {
      setShowMessage({ type: 'error', message: 'Failed to delete form!' });
    }
  };

  const createForm = async () => {
    try {
      const response = await fetch(`${API_URL}/form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastModifiedById: authInfo.userInfo.id,
          organisationId: authInfo.userInfo.organisationId,
          label: null,
          description: null,
          lastModifiedAt: (new Date()).toISOString().slice(0, 19),
          pages: null
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const responseBody = await response.json();
        setFormData((prevData: any) => {
            const newData = [...prevData];
            newData.unshift(responseBody);
            return newData;
        });
        setExpandedRowKeys((prev: any) => [...prev, responseBody.id]);
        setTriggerReload((prev: any) => !prev);
        setShowMessage({ type: 'success', message: 'Form created successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to create form!' });
    } 
  }
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'Label',
      dataIndex: 'label',
      width: '23%',
      // sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '40%',
      // filters: [
      //   {
      //     text: 'London',
      //     value: 'London',
      //   },
      //   {
      //     text: 'New York',
      //     value: 'New York',
      //   },
      // ],
      // onFilter: (value, record) => record.address.indexOf(value as string) === 0,
    },
    {
      title: 'Last modified by',
      dataIndex: 'lastModifiedBy',
      width: '15%',
    },
    {
      title: 'Last modified at',
      dataIndex: 'lastModifiedAt',
      width: '15%',
    },
    {
      title: '',
      key: 'action',
      width: '7%',
      // sorter: true,
      render: (record: DataType) => (
        <Space size="middle">
          <Button type="text" onClick={() => deleteForm(record.formId)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const scroll: { x?: number | string; y?: number | string } = {};
  if (yScroll) {
    scroll.y = 240;
  }
  if (xScroll !== 'unset') {
    scroll.x = '100vw';
  }

  const tableColumns = columns.map((item) => ({ ...item, ellipsis }));
  if (xScroll === 'fixed') {
    tableColumns[0].fixed = true;
    tableColumns[tableColumns.length - 1].fixed = 'right';
  }

  const tableProps: TableProps<DataType> = {
    loading,
    size: 'large',
    title: () => '',
    showHeader: true,
    footer: () => '',
    // rowSelection,
    scroll,
    tableLayout: tableLayout === 'unset' ? undefined : (tableLayout as TableProps['tableLayout']),
  };

  return (<>
    {contextHolder}
    <Flex vertical className='w-full max-w-[80vw]'>
        <Flex>
            <Button color="default" variant='solid' onClick={createForm}>
                <PlusOutlined />
            </Button>
        </Flex>
        <Table<DataType>
        {...tableProps}
        expandable={{
            expandedRowRender: (record: DataType) => ( record.form ? (
                <div className='flex items-center justify-center w-full'>
                    <FormCreationModal 
                        formData={record.form}
                        setTriggerReload={setTriggerReload}
                    />
                </div>) : (<></>)) ,
            expandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
        }}
        pagination={{ position: [top, bottom] }}
        columns={tableColumns}
        dataSource={getTableData()}
        scroll={scroll}
        className=''
        />
    </Flex>
  </>)
}

export default FormsComponent