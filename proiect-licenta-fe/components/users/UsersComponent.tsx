'use client';

import React, { useState, useEffect } from 'react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { GetProp, RadioChangeEvent, TableProps } from 'antd';
import { Flex, Radio, Space, Switch, Table, Button, Form, Input, Select, message } from 'antd';
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
    userId: number;
    name: string;
    email: string;
    password: string;
    role: any;
    user: any;
}

type UserType = {
    id: number|null;
    name: string|null;
    email: string|null;
    password: string|null;
    roleId: number|null;
};

const UsersComponent = () => {
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

  const [userData, setUserData] = useState<any>({});
  const [triggerReload, setTriggerReload] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/user/employee/organisation/${authInfo.userInfo.organisationId}`)
    .then(response => response.json())
    .then(userJSON => {
        setUserData((prev:any) => { 
            return userJSON.reverse();
        });
        setLoading(false);
        fetch(`${API_URL}/role/organisation/${authInfo.userInfo.organisationId}`)
        .then(response => response.json())
        .then(roleJSON => {
            const options = roleJSON.map((role: any) => ({
                label: role.label,
                value: role.id,
            }));
            setRoleOptions(options);
        })
        .catch(error => {
            console.error('Error fetching forms:', error);
        });
    })
    .catch(error => {
        console.error('Error fetching users:', error);
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
  const [roleOptions, setRoleOptions] = useState([]);

  const getTableData = () => {
    if (!Array.isArray(userData)) {
      return [];
    }
    const tableData: DataType[] = userData.map<DataType>((user: any, index: number) => ({
        key: (user.id as number),
        userId: (user.id as number),
        name: user.name ? (user.name as string) : 'N/A',
        email: user.email ? (user.email as string) : 'N/A',
        password: user.password ? (user.password as string) : 'N/A',
        role: user.role ? (user.role.label as string) : 'N/A',
        user: (user as any),
    }));
    return tableData;
  }

  const deleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}/user/employee/${userId}`, {
        method: 'DELETE',
      });
    
      setUserData((prevData: any) => {
        return prevData.filter((user: any) => user.id !== userId);
      });
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'User deleted successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to delete user!' });
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch(`${API_URL}/user/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id: null,
            organisationId: authInfo.userInfo.organisationId,
            name: null,
            email: null,
            password: null,
            roleId: null,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      const responseBody = await response.json();
      setUserData((prevData: any) => {
          return [responseBody, ...prevData];
      });
      setExpandedRowKeys((prev: any) => [...prev, responseBody.id]);
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'User created successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to create user!' });
    } 
  }

  const saveUser = async (values: any) => {
    try {
      const response = await fetch(`${API_URL}/user/employee`, {
          method: "POST",
          headers: {
          "Content-Type": "application/json",
          },
          body: JSON.stringify({
              id: values.id,
              organisationId: authInfo.userInfo.organisationId,
              name: values.name.trim(),
              email: values.email.trim(),
              password: values.password,
              roleId: values.roleId,
          }),
      });
      if (!response.ok) throw new Error("Failed to fetch data");
      setTriggerReload((prev: any) => !prev);
      setShowMessage({ type: 'success', message: 'User saved successfully!' });
    } catch (err) {
      setShowMessage({ type: 'error', message: 'Failed to save user!' });
    } 
  }
  
  const columns: ColumnsType<DataType> = [
    {
      title: 'Name',
      dataIndex: 'name',
      // sorter: (a, b) => a.age - b.age,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
    },
    {
      title: '',
      key: 'action',
      width: '7%',
      // sorter: true,
      render: (record: DataType) => (
        <Space size="middle">
          <Button type="text" onClick={() => deleteUser(record.userId)}>
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
            <Button color="default" variant='solid' onClick={createUser}>
                <PlusOutlined />
            </Button>
        </Flex>
        <Table<DataType>
        {...tableProps}
        expandable={{
            expandedRowRender: (record: DataType) => ( record.role ? (
                <div className='flex justify-center items-center pl-5 w-full'>
                    <Form
                        key={record.userId}
                        layout="vertical"
                        name={`basic-${record.userId}`}
                        initialValues={{
                            name: record.name != 'N/A' ? record.name : '',
                            id: record.userId,
                            email: record.email != 'N/A' ? record.email : '', 
                            password: record.password != 'N/A' ? record.password : '',
                            roleId: record.user.roleId ? record.user.roleId : null,
                        }}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        style={{ width: 400, maxWidth: 600 }}
                        onFinish={saveUser}
                        autoComplete="off"
                    >
                        <Form.Item<UserType>
                            label="Name"
                            name="name"
                            rules={[{ required: true, message: 'Please set a name for the user!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item<UserType>
                            label="Email"
                            name="email"
                            rules={[{ required: true, message: 'Please set an email for the user!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item<UserType>
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please set a password for the user!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item<UserType>
                            label="Role"
                            name="roleId"
                            rules={[{ required: true, message: 'Please set a role for the user!' }]}
                        >
                            <Select>
                                { roleOptions.length > 0 ? (roleOptions.map((roleOption: any, index: number) => (
                                    <Select.Option key={roleOption.value} value={roleOption.value}>
                                        {roleOption.label}
                                    </Select.Option>
                                ))) : (<></>)}
                            </Select>
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

export default UsersComponent