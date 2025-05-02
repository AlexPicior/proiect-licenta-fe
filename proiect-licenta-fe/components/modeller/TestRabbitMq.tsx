"use client";

import React, { 
    useCallback, 
    useState, 
    useEffect
  } from 'react'
import { Button, Typography, Input, Flex } from 'antd';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import '@ant-design/v5-patch-for-react-19';


const { Text } = Typography;
const BROKER_URL = 'http://localhost:8080/ws'; // TODO Replace with your RabbitMQ WebSocket URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;


const TestRabbitMq = () => {
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
          body: JSON.stringify({ correlationId: 1, content: 'Modified content' }),
        });
    };

    return (
        <div>
            <Button onClick={() => sendReply()}>Send Reply</Button>
        </div>
    )
}

export default TestRabbitMq