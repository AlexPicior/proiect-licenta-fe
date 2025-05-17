import React from 'react';
import LayoutComponent from '@/components/layout/LayoutComponent';

export default function CompleteFormLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <LayoutComponent>{children}</LayoutComponent>
    );
}