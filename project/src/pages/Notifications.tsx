import React from 'react';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import type { Notification } from '../types';

const Notifications: React.FC = () => {
  // Mock data - replace with actual data in production
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'new',
      message: 'New work order created for Conveyor Belt A1',
      timestamp: '2024-03-15T10:30:00',
      workOrderId: '1'
    },
    {
      id: '2',
      type: 'completed',
      message: 'Work order completed for Packaging Unit B2',
      timestamp: '2024-03-14T17:30:00',
      workOrderId: '2'
    },
    {
      id: '3',
      type: 'pending',
      message: 'Reminder: Pending work order for Industrial Mixer M1',
      timestamp: '2024-03-14T09:15:00',
      workOrderId: '3'
    }
  ];

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getNotificationStyle = (type: Notification['type']) => {
    switch (type) {
      case 'new':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-orange-50 border-orange-200';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${getNotificationStyle(
              notification.type
            )} flex items-start space-x-4`}
          >
            {getNotificationIcon(notification.type)}
            <div className="flex-1">
              <p className="text-gray-900">{notification.message}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(notification.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;