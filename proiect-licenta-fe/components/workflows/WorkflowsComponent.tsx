'use client';

import React, { useState, useEffect } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { GetProp, RadioChangeEvent, TableProps } from 'antd';
import { Flex, Radio, Space, Switch, Table, Button, message } from 'antd';
import FormRecordModal from '../form-record-creation/FormRecordModal';
import { useGlobalContext } from '@/components/context/GlobalContext';
import Modeller from '../modeller/Modeller';
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
  workflowDefinitionId: number;
  label: string;
  description: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
  workflowDefinition: any;
}

const WorkflowsComponent = () => {
  const [workflowDefinitionData, setWorkflowDefinitionData] = useState<any>({});
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
    fetch(`${API_URL}/workflowDefinition/organisation/${authInfo.userInfo.organisationId}`)
    .then(response => response.json())
    .then(workflowDefinitionJSON => {
        setWorkflowDefinitionData((prev:any) => { 
            workflowDefinitionJSON.sort((a: DataType, b: DataType) => dayjs(b.lastModifiedAt).unix() - dayjs(a.lastModifiedAt).unix())
            return workflowDefinitionJSON;
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
    if (!Array.isArray(workflowDefinitionData)) {
      return [];
    }
    const tableData: DataType[] = workflowDefinitionData.map<DataType>((workflowDefinition: any, index: number) => ({
      key: (workflowDefinition.id as number),
      workflowDefinitionId: (workflowDefinition.id as number),
      label: workflowDefinition.label ? (workflowDefinition.label as string) : 'N/A',
      description: workflowDefinition.description ? (workflowDefinition.description as string) : 'N/A',
      lastModifiedAt: workflowDefinition.lastModifiedAt ? getFormatedSentAt(workflowDefinition.lastModifiedAt) : 'N/A',
      lastModifiedBy: (workflowDefinition.lastModifiedBy.email as string),
      workflowDefinition: (workflowDefinition as any),
    }));
    return tableData;
  }

  const getFormatedSentAt = (sentAt: string) => {
    const fixedInput = sentAt.replace(/\./g, '-');

    const date = new Date(fixedInput);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
  }

  const deleteWorkflowDefinition = async (workflowDefinitionId: number) => {
    try {
      const response = await fetch(`${API_URL}/workflowDefinition/${workflowDefinitionId}`, {
        method: 'DELETE',
      });
    
      setWorkflowDefinitionData((prevData: any) => {
        return prevData.filter((workflowDefinition: any) => workflowDefinition.id !== workflowDefinitionId);
      });
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'Workflow deleted successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to delete workflow!' });
    }
  };

  const createWorkflow = async () => {
    try {
      const response = await fetch(`${API_URL}/workflowDefinition`, {
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
          jsonDefinition: null
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const responseBody = await response.json();
      setWorkflowDefinitionData((prevData: any) => {
          const newData = [...prevData];
          newData.unshift(responseBody);
          return newData;
      });
      setExpandedRowKeys((prev: any) => [...prev, responseBody.id]);
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'Workflow created successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to create workflow!' });
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
          <Button type="text" onClick={() => deleteWorkflowDefinition(record.workflowDefinitionId)}>
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
    <Flex vertical className='w-full'>
        <Flex>
            <Button color="default" variant='solid' onClick={createWorkflow}>
                <PlusOutlined />
            </Button>
        </Flex>
        <Table<DataType>
        {...tableProps}
        expandable={{
            expandedRowRender: (record: DataType) => ( record.workflowDefinition ? (
                <div className='flex items-center justify-center w-full'>
                    <Modeller workflowDefinitionData={record.workflowDefinition} setTriggerReload={setTriggerReload} ></Modeller>
                </div>) : (<></>)) ,
            expandedRowKeys: expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
        }}
        pagination={{ position: [top, bottom] }}
        columns={tableColumns}
        dataSource={getTableData()}
        scroll={scroll}
        className='w-full'
        />
    </Flex>
  </>)
}

export default WorkflowsComponent