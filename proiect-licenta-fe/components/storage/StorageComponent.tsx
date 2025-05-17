'use client';

import React, { useState, useEffect } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import type { GetProp, RadioChangeEvent, TableProps } from 'antd';
import { Form, Radio, Space, Switch, Table, Button, message } from 'antd';
import FormRecordModal from '../form-record-creation/FormRecordModal';
import { useGlobalContext } from '@/components/context/GlobalContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SizeType = TableProps['size'];
type ColumnsType<T extends object> = GetProp<TableProps<T>, 'columns'>;
type TablePagination<T extends object> = NonNullable<Exclude<TableProps<T>['pagination'], boolean>>;
type TablePaginationPosition = NonNullable<TablePagination<any>['position']>[number];
type ExpandableConfig<T extends object> = TableProps<T>['expandable'];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
  key: number;
  formRecordId: number;
  formType: string;
  completedAt: string;
  completedBy: string;
  formRecord: any;
}

const StorageComponent = () => {
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

  const [storageFormRecordData, setStorageFormRecordData] = useState<any>({});

  useEffect(() => {
    fetch(`${API_URL}/formRecord/storage/organisation/${authInfo.userInfo.organisationId}`)
    .then(response => response.json())
    .then(storageFormRecordJSON => {
      setStorageFormRecordData(storageFormRecordJSON);
      setLoading(false);
    })
    .catch(error => {
        console.error('Error fetching forms:', error);
    });
  }, []);

  const defaultExpandable: ExpandableConfig<DataType> = {
    expandedRowRender: (record: DataType) => ( record.formRecord ? (
    <div className='flex items-center justify-center w-full'>
      <FormRecordModal
        formRecordData={record.formRecord}
        isForFormRecordCreation={false}
        isReadOnly={ true}
        isForApproval={ false }
      ></FormRecordModal>
    </div>) : (<></>)) ,
  };

  const [loading, setLoading] = useState(true);
  const [expandable, setExpandable] = useState<ExpandableConfig<DataType>>(defaultExpandable);
  const [rowSelection, setRowSelection] = useState<TableRowSelection<DataType> | undefined>({});
  const [tableLayout, setTableLayout] = useState<string>('fixed');
  const [top, setTop] = useState<TablePaginationPosition>('none');
  const [bottom, setBottom] = useState<TablePaginationPosition>('bottomRight');
  const [ellipsis, setEllipsis] = useState(false);
  const [yScroll, setYScroll] = useState(false);
  const [xScroll, setXScroll] = useState<string>('unset');
  const { authInfo, setAuthInfo } = useGlobalContext();

  const getTableData = () => {
    if (!Array.isArray(storageFormRecordData)) {
      return [];
    }
    const tableData: DataType[] = storageFormRecordData.map<DataType>((storageFormRecord: any, index: number) => ({
      key: index,
      formRecordId: (storageFormRecord.id as number),
      formType: storageFormRecord.form.label as string,
      completedAt: getFormatedSentAt(storageFormRecord.completedAt),
      completedBy: (storageFormRecord.completedBy.email as string),
      formRecord: (storageFormRecord as any),
    }));
    return tableData;
  }

  const getFormatedSentAt = (completedAt: string) => {
    const date = new Date(completedAt);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  const deleteFormRecord = async (formRecordId: number) => {
    try {
      const response =  await fetch(`${API_URL}/formRecord/${formRecordId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    
      setStorageFormRecordData((prevData: any) => {
        return prevData.filter((formRecord: any) => formRecord.id !== formRecordId);
      });
      setShowMessage({
        type: 'success',
        message: 'Record deleted successfully'
      });
    } catch (error) {
      setShowMessage({
        type: 'error',
        message: 'Error deleting record'
      });
    }
  };
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'Form type',
      dataIndex: 'formType',
      // sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Completed at',
      dataIndex: 'completedAt',
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
      title: 'Completed by',
      dataIndex: 'completedBy',
    },
    {
      title: '',
      key: 'action',
      // sorter: true,
      render: (record: DataType) => (
        <Space size="middle">
          <Button type="text" onClick={() => deleteFormRecord(record.formRecordId)}>
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
    expandable,
    title: () => '',
    showHeader: true,
    footer: () => '',
    // rowSelection,
    scroll,
    tableLayout: tableLayout === 'unset' ? undefined : (tableLayout as TableProps['tableLayout']),
  };

  return (<>
    {contextHolder}
    <div className='w-full'>
      <Table<DataType>
        {...tableProps}
        pagination={{ position: [top, bottom] }}
        columns={tableColumns}
        dataSource={getTableData()}
        scroll={scroll}
        className='w-full'
      />
    </div>
  </>)
}

export default StorageComponent