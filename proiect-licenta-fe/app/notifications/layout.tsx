import React from 'react';
import LayoutComponent from '@/components/layout/LayoutComponent';

export default function NotificationsLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <LayoutComponent>{children}</LayoutComponent>
    );
}