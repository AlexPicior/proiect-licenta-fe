'use client';

import React, { useState, useEffect } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import type { GetProp, RadioChangeEvent, TableProps } from 'antd';
import { Form, Radio, Space, Switch, Table, Button, message } from 'antd';
import FormRecordModal from '../form-record-creation/FormRecordModal';
import { useGlobalContext } from '@/components/context/GlobalContext';
import NOTIFICATION_TYPE from './notificationType';
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
  notificationId: number;
  message: string;
  formType: string;
  sentAt: string;
  status: string;
  formRecord: any;
  correlationId: string;
}

const NotificationsComponent = (props: any) => {
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

  const { authInfo, setAuthInfo } = useGlobalContext();
  const { notificationType } = props;
  const [notificationData, setNotificationData] = useState<any>({});

  const { notificationsNumber, requestNotificationsNumber, approvalNotificationsNumber, triggerNotificationsReload } = useGlobalContext();

  useEffect(() => {
    fetch(`${API_URL}/notifications/type/${notificationType}/receiver/${authInfo.userInfo.id}`)
    .then(response => response.json())
    .then(notificationsJSON => {
      setNotificationData((prev:any) => {
        notificationsJSON.sort((a: DataType, b: DataType) => dayjs(b.sentAt).unix() - dayjs(a.sentAt).unix())
        return notificationsJSON;
      })
      setLoading(false);
    })
    .catch(error => {
        console.error('Error fetching forms:', error);
    });
  }, [notificationsNumber, requestNotificationsNumber, approvalNotificationsNumber, triggerNotificationsReload]);

  const defaultExpandable: ExpandableConfig<DataType> = {
    expandedRowRender: (record: DataType) => ( record.formRecord ? (
    <div className='flex items-center justify-center w-full'>
      <FormRecordModal
        formRecordData={record.formRecord}
        isForFormRecordCreation={false}
        isReadOnly={ notificationType === NOTIFICATION_TYPE.REQUEST ? (record.status === "WAITING" ? false : true) : true}
        isForApproval={ notificationType === NOTIFICATION_TYPE.APPROVAL && record.status === "WAITING" }
        correlationId={record.correlationId}
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

  const getTableData = () => {
    if (!Array.isArray(notificationData)) {
      return [];
    }
    const tableData: DataType[] = notificationData.map<DataType>((notification: any, index: number) => ({
      key: index,
      notificationId: (notification.id as number),
      message: (notification.message as string),
      formType: notification.formRecord ? (notification.formRecord.form.label as string) : "-",
      sentAt: getFormatedSentAt(notification.sentAt.replace(/-/g, '.')),
      status: (notification.status as string),
      formRecord: (notification.formRecord as any),
      correlationId: (notification.correlationId as string),
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

  const deleteNotification = async (notificationId: number) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    
      setNotificationData((prevData: any) => {
        return prevData.filter((notification: any) => notification.id !== notificationId);
      });
      setShowMessage({ type: 'success', message: 'Notification deleted successfully' });
    } catch (error) {
      setShowMessage({ type: 'error', message: 'Error deleting notification' });
    }
  };
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'Message',
      dataIndex: 'message',
      width: '45%',
    },
    {
      title: 'Form type',
      dataIndex: 'formType',
      width: '23%',
      // sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Sent at',
      dataIndex: 'sentAt',
      width: '15%',
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
      title: 'Status',
      dataIndex: 'status',
      width: '10%',
    },
    {
      title: '',
      key: 'action',
      width: '7%',
      // sorter: true,
      render: (record: DataType) => (
        <Space size="middle">
          <Button type="text" onClick={() => deleteNotification(record.notificationId)}>
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
        columns={notificationType === NOTIFICATION_TYPE.SIMPLE ? tableColumns.filter((tableColumn) => tableColumn.title !== "Status") : tableColumns}
        dataSource={getTableData()}
        scroll={scroll}
        className='w-full'
      />
    </div>
  </>)
}

export default NotificationsComponent