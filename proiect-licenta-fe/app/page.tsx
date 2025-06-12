"use client";

import LayoutComponent from '@/components/layout/LayoutComponent';
import { Typography, Flex } from 'antd';
import { getAuthInfo } from '@/utils/auth-utils';

const { Text } = Typography;


export default function Home() {
  return (
    <>
      <LayoutComponent>
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ height: '100%', width: '100%' }}
        >
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Welcome, {`${getAuthInfo().userInfo.email}`}!
          </Text>
        </Flex>
      </LayoutComponent>
    </>
  );
}
