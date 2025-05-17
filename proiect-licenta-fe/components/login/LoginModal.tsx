"use client";

import React, {
    useState,
    useEffect
} from 'react'
import { useRouter } from 'next/navigation';
import { Button, Typography, Input, Flex } from 'antd';
import AUTHORITY_TYPE from './authorityType';
import '@ant-design/v5-patch-for-react-19';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const { Text } = Typography;

const LoginModal = () => {
    const [loginRequest, setLoginRequest] = useState({
        username: "",
        password: ""
    });

    const router = useRouter();

    const handleLogin = async () => {    
        if (loginRequest.username !== "" && loginRequest.password !== "") {
            try {
            const res = await fetch(`${API_URL}/authentication/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: loginRequest.username, 
                    password: loginRequest.password
                }),
            });
        
            if (res.ok) {
                const responseAuthDTO = await res.json();
                localStorage.setItem('authInfo', JSON.stringify(responseAuthDTO));
                const {userInfo} = responseAuthDTO
                if (userInfo.authority === AUTHORITY_TYPE.SUPER_ADMIN) {
                    router.push('/');
                } else if (userInfo.authority === AUTHORITY_TYPE.ADMIN) {
                    router.push('/');
                } else if (userInfo.authority === AUTHORITY_TYPE.EMPLOYEE) {
                    router.push('/');
                } else {
                    router.push('/');
                }                
            } else {
                alert('Invalid login');
            }
            } catch (err) {
                console.error('Login error', err);
            }
        }
    };

    return (
        <div className="bg-white p-6 h-screen w-screen flex justify-center items-center">
            <Flex vertical align="center" justify="center">
                <Flex vertical gap={5}>
                    <Text>Username:</Text>
                    <Input 
                        onChange={(e) => setLoginRequest((prev: any) => {
                            return {
                                ...prev,
                                username: e.target.value
                            }
                        })} 
                        placeholder="Enter your username" 
                        style={{ width: '300px', marginBottom: '10px' }} 
                    />
                </Flex>
                <Flex vertical gap={5}>
                    <Text>Password:</Text>
                    <Input
                        onChange={(e) => setLoginRequest((prev: any) => {
                            return {
                                ...prev,
                                password: e.target.value
                            }
                        })}
                        placeholder="Enter your password" 
                        type="password" 
                        style={{ width: '300px', marginBottom: '25px' }} 
                    />
                </Flex>
                <Flex className='w-full pr-4' justify="flex-end" align="center">
                    <Button color="default" variant="solid" onClick={handleLogin}>Login</Button>
                </Flex>
            </Flex>
        </div>
    )
}

export default LoginModal