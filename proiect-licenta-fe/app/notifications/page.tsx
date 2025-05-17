import React from 'react';
import NotificationsComponent from '@/components/notifications/NotificationsComponent';
import NOTIFICATION_TYPE from '@/components/notifications/notificationType';

export default function NotificationsPage() {
    return (
      <div className="flex items-center justify-center w-full">
        <NotificationsComponent notificationType={NOTIFICATION_TYPE.SIMPLE} />
      </div>
    );
}