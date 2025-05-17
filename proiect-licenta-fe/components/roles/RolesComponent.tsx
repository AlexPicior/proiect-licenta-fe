'use client';

import React, { useState, useEffect } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { GetProp, RadioChangeEvent, TableProps } from 'antd';
import { Flex, Radio, Space, Switch, Table, Button, Form, Input, message } from 'antd';
import { useGlobalContext } from '@/components/context/GlobalContext';
import FormCreationModal from '../form-creation/FormCreationModal';
import dayjs from 'dayjs';
import '@ant-design/v5-patch-for-react-19';


const API_URL = process.env.NEXT_PUBLIC_API_URL;

type SizeType = TableProps['size'];
type ColumnsType<T extends object> = GetProp<TableProps<T>, 'columns'>;
type TablePagination<T extends object> = NonNullable<Exclude<TableProps<T>['pagination'], boolean>>;
type TablePaginationPosition = NonNullable<TablePagination<any>['position']>[number];
type ExpandableConfig<T extends object> = TableProps<T>['expandable'];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
  key: number;
  roleId: number;
  label: string;
  role: any;
}

type RoleType = {
  label: string|null;
};

const RolesComponent = () => {
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

  const [roleData, setRoleData] = useState<any>({});
  const [triggerReload, setTriggerReload] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/role/organisation/${authInfo.userInfo.organisationId}`)
    .then(response => response.json())
    .then(roleJSON => {
        setRoleData((prev:any) => { 
            return roleJSON.reverse();
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
    if (!Array.isArray(roleData)) {
      return [];
    }
    const tableData: DataType[] = roleData.map<DataType>((role: any, index: number) => ({
      key: (role.id as number),
      roleId: (role.id as number),
      label: role.label ? (role.label as string) : 'N/A',
      role: (role as any),
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

  const deleteRole = async (roleId: number) => {
    try {
      const response = await fetch(`${API_URL}/role/${roleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error("Failed to fetch data");
    
      setRoleData((prevData: any) => {
        return prevData.filter((role: any) => role.id !== roleId);
      });
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'Role deleted successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to delete role!' });
    }
  };

  const createRole = async () => {
    try {
      const response = await fetch(`${API_URL}/role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: null,
            organisationId: authInfo.userInfo.organisationId,
            label: null,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const responseBody = await response.json();
      setRoleData((prevData: any) => {
          const newData = [...prevData];
          newData.unshift(responseBody);
          return newData;
      });
      setExpandedRowKeys((prev: any) => [...prev, responseBody.id]);
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'Role created successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to create role!' });
    } 
  }

  const saveRole = async (values: any) => {
    try {
      const response = await fetch(`${API_URL}/role`, {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({
              id: values.id,
              organisationId: authInfo.userInfo.organisationId,
              label: values.label.trim(),
          }),
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'Role saved successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to save role!' });
    } 
  }
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'Label',
      dataIndex: 'label',
      // sorter: (a, b) => a.age - b.age,
    },
    {
      title: '',
      key: 'action',
      width: '7%',
      // sorter: true,
      render: (record: DataType) => (
        <Space size="middle">
          <Button type="text" onClick={() => deleteRole(record.roleId)}>
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

  return ( <>
    {contextHolder}
    <Flex vertical className='w-full max-w-[80vw]'>
        <Flex>
            <Button color="default" variant='solid' onClick={createRole}>
                <PlusOutlined />
            </Button>
        </Flex>
        <Table<DataType>
        {...tableProps}
        expandable={{
            expandedRowRender: (record: DataType) => ( record.role ? (
                <div className='flex justify-center items-center pl-5 w-full'>
                    <Form
                        layout="vertical"
                        name="basic"
                        initialValues={{
                            label: record.label != 'N/A' ? record.label : '',
                            id: record.roleId,
                        }}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: 400, maxWidth: 600 }}
                        onFinish={saveRole}
                        autoComplete="off"
                    >
                        <Form.Item<RoleType>
                            label="Label"
                            name="label"
                            rules={[{ required: true, message: 'Please set a label for the role!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item name="id" hidden>
                            <Input />
                        </Form.Item>

                        <Form.Item label={null}>
                            <Button color='default' variant='solid' htmlType="submit">
                                Save
                            </Button>
                        </Form.Item>
                    </Form>
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

export default RolesComponent