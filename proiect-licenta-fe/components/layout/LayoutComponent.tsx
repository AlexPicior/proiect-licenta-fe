'use client';

import React, { useState, useEffect } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  FormOutlined,
  BellOutlined,
  HomeOutlined,
  SnippetsOutlined,
  CheckSquareOutlined,
  DatabaseOutlined,
  CopyOutlined,
  NodeIndexOutlined,
  SolutionOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import { Breadcrumb, Layout, Menu, theme, Badge, Flex, Spin } from 'antd';
import { useGlobalContext } from '@/components/context/GlobalContext';
import { usePathname } from 'next/navigation';
import { requireAuth } from '@/utils/auth-utils';
import AUTHORITY_TYPE from '@/components/login/authorityType';
import { getAuthInfo } from '@/utils/auth-utils';
import NOTIFICATION_TYPE from '../notifications/notificationType';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
const BROKER_URL = 'http://localhost:8080/ws'; // TODO Replace with your RabbitMQ WebSocket URL


const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const siderStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
  };

const LayoutComponent = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
    const pathname = usePathname();

    const { authInfo, setAuthInfo, notificationsNumber, setNotificationsNumber,
        requestNotificationsNumber, setRequestNotificationsNumber, 
        approvalNotificationsNumber, setApprovalNotificationsNumber 
    } = useGlobalContext();
    const [collapsed, setCollapsed] = useState(false);

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    

    const getSelectedTab = () => {
        switch (pathname) {
            case '/':
                return '1';
            case '/complete-form':
                return '2';
            case '/notifications':
                return '3';
            case '/requests':
                return '4';
            case '/approvals':
                return '5';
            case '/storage':
                return '6';
            case '/workflows':
                return '7';
            case '/forms':
                return '8';
            case '/roles':
                return '9';
            case '/users':
                return '10';
            default:
                return '1';
        }
    }

    const getBreadcrumbItems = () => {
        switch (pathname) {
            case '/':
                return [{ title: 'Home' }];
            case '/complete-form':
                return [{ title: 'Complete Form' }];
            case '/notifications':
                return [{ title: 'Notifications' }];
            case '/requests':
                return [{ title: 'Requests' }];
            case '/approvals':
                return [{ title: 'Approvals' }];
            case '/storage':
                return [{ title: 'Storage' }];
            case '/workflows':
                return [{ title: 'Workflows' }];
            case '/forms':
                return [{ title: 'Forms' }];
            case '/roles':
                return [{ title: 'Roles' }];
            case '/users':
                return [{ title: 'Users' }];
            default:
                return [{ title: 'Home' }];
        }
    }

    useEffect(() => {
        requireAuth([AUTHORITY_TYPE.ADMIN, AUTHORITY_TYPE.CLIENT, AUTHORITY_TYPE.EMPLOYEE, AUTHORITY_TYPE.SUPER_ADMIN], (authInfo: any) => {
            window.scrollTo(0, 0);
            setAuthInfo(authInfo);
        });
    }, []);
        
    useEffect(() => {
        const authInfo = getAuthInfo();
        if (!authInfo) return;
    
        const client = new Client({
            webSocketFactory: () => new SockJS(BROKER_URL),
            debug: str => console.log('[STOMP]', str),
            reconnectDelay: 5000,
            onConnect: () => {
                const queue = `/topic/user.${authInfo.userInfo.id}`;
                client.subscribe(queue, msg => {
                    const msgBody = JSON.parse(msg.body);
                    if (msgBody.type === NOTIFICATION_TYPE.SIMPLE) {
                        setNotificationsNumber(prev => prev + 1);
                    } else if (msgBody.type === NOTIFICATION_TYPE.REQUEST) {
                        setRequestNotificationsNumber(prev => prev + 1);
                    } else if (msgBody.type === NOTIFICATION_TYPE.APPROVAL) {
                        setApprovalNotificationsNumber(prev => prev + 1);
                    }
                    
                });
                
            },
        });
    
        client.activate();
        return () => {
            client.deactivate();
        };
    }, []);

    const getMenuItems = () => {
        const items: MenuItem[] = [
            getItem(<Link href="/" >Home</Link>, '1', <HomeOutlined />),
            getItem(<Link href="/complete-form"  >Complete Form</Link>, '2', <FormOutlined />),
            getItem(
                <Link href="/notifications" onClick={() => setNotificationsNumber(() => 0)} >
                    Notifications
                    <Badge count={notificationsNumber} offset={[10, 0]} style={{ boxShadow: 'none', border: 'none', }}>
                    </Badge>
                </Link>
            , '3', <BellOutlined />),
            getItem(
                <Link href="/requests" onClick={() => setRequestNotificationsNumber(() => 0)} >
                    Requests
                    <Badge count={requestNotificationsNumber} offset={[10, 0]} style={{ boxShadow: 'none', border: 'none', }}>
                    </Badge>
                </Link>
            , '4', <SnippetsOutlined />),
            getItem(
                <Link href="/approvals" onClick={() => setApprovalNotificationsNumber(() => 0)} >
                    Approvals
                    <Badge count={approvalNotificationsNumber} offset={[10, 0]} style={{ boxShadow: 'none', border: 'none', }}>
                    </Badge>
                </Link>
            , '5', <CheckSquareOutlined />),
            getItem(<Link href="/storage">Storage</Link>, '6', <DatabaseOutlined />),
            getItem(<Link href="/workflows">Workflows</Link>, '7', <NodeIndexOutlined />),
            getItem(<Link href="/forms">Forms</Link>, '8', <CopyOutlined />),
            getItem(<Link href="/roles">Roles</Link>, '9', <SolutionOutlined />),
            getItem(<Link href="/users">Users</Link>, '10', <TeamOutlined />),
        ];

        if (authInfo && authInfo.userInfo.authority === AUTHORITY_TYPE.CLIENT) {
            items.splice(4, 6);
        } else if (authInfo && authInfo.userInfo.authority === AUTHORITY_TYPE.EMPLOYEE) {
            items.splice(6, 4);
        } else if (authInfo && authInfo.userInfo.authority === AUTHORITY_TYPE.ADMIN) {
            items.splice(1, 5);
        }

        return items;
    }

    return (authInfo ? (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider style={siderStyle} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical" />
                <Menu theme="dark" defaultSelectedKeys={[getSelectedTab()]} mode="inline" items={getMenuItems()} />
            </Sider>
            <Layout >
                <Content style={{ margin: '0 16px'}}>
                    <Breadcrumb 
                        items={getBreadcrumbItems()} style={{ margin: '16px 0' }}
                    />
                    <div
                        style={{
                        padding: 24,
                        minHeight: '80vh',
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    DocumentFlow ©{new Date().getFullYear()} Created by Picior Alexandru-Florentin
                </Footer>
            </Layout>
        </Layout>
    ) : (
        <div className="bg-white w-screen h-screen flex justify-center items-center">
            <Spin size="large">
                
            </Spin>
        </div>
    ))
}

export default LayoutComponent