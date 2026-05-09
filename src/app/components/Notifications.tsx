import { useState } from "react";
import {
  Bell, X, Check, Trash2, CheckCheck, Filter, Package,
  Award, MessageSquare, AlertCircle, Calendar, Truck, Settings,
  Circle, Archive
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface NotificationsProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: any;
  actionLabel?: string;
  actionUrl?: string;
}

export function Notifications({ onClose }: NotificationsProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Pickup Completed',
      message: 'Your e-waste collection request REQ-001 has been successfully completed. Certificate is now available.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      read: false,
      icon: CheckCheck,
      actionLabel: 'View Certificate',
      actionUrl: '/certificates'
    },
    {
      id: '2',
      type: 'info',
      title: 'Collector Assigned',
      message: 'Ahmed Khan has been assigned to your pickup request REQ-002. Expected arrival: Today, 2:00 PM',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      icon: Truck,
      actionLabel: 'Track Pickup',
      actionUrl: '/track'
    },
    {
      id: '3',
      type: 'success',
      title: 'Reward Points Earned',
      message: 'Congratulations! You earned 150 reward points from your recent recycling contribution.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      read: true,
      icon: Award,
      actionLabel: 'View Rewards',
      actionUrl: '/rewards'
    },
    {
      id: '4',
      type: 'message',
      title: 'New Message from Collector',
      message: 'Ahmed Khan: "I will arrive at your location in 15 minutes. Please have the items ready."',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      read: true,
      icon: MessageSquare,
      actionLabel: 'Reply',
      actionUrl: '/messages'
    },
    {
      id: '5',
      type: 'warning',
      title: 'Pickup Reminder',
      message: 'Your scheduled pickup is tomorrow at 10:00 AM. Please ensure items are ready for collection.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
      icon: Calendar,
      actionLabel: 'View Details',
      actionUrl: '/track'
    },
    {
      id: '6',
      type: 'info',
      title: 'New Recycling Campaign',
      message: 'Earth Day Special: Earn 2x reward points on all collections this week! Schedule your pickup now.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      read: true,
      icon: Package,
      actionLabel: 'Schedule Pickup',
      actionUrl: '/new'
    },
    {
      id: '7',
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      read: true,
      icon: Settings
    },
  ]);

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    toast.success('Marked as read');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'from-green-50 to-emerald-50 border-green-200';
      case 'info': return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'warning': return 'from-orange-50 to-yellow-50 border-orange-200';
      case 'message': return 'from-purple-50 to-pink-50 border-purple-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-orange-500';
      case 'message': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center relative">
                <Bell className="size-7 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-blue-100 text-sm">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'all'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all text-white flex items-center gap-2"
              >
                <CheckCheck className="size-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="size-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`relative bg-gradient-to-r ${getNotificationColor(notification.type)} border-2 rounded-2xl p-5 transition-all hover:shadow-lg ${
                      !notification.read ? 'ring-2 ring-blue-300 ring-offset-2' : ''
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="absolute top-4 right-4">
                        <Circle className="size-3 text-blue-600 fill-blue-600 animate-pulse" />
                      </div>
                    )}

                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${getIconColor(notification.type)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="size-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{notification.title}</h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{notification.message}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {notification.actionLabel && (
                            <button
                              onClick={() => {
                                toast.info(`Navigating to ${notification.actionLabel}`);
                                onClose();
                              }}
                              className="px-4 py-1.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium"
                            >
                              {notification.actionLabel}
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
                            >
                              <Check className="size-4" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-all text-sm font-medium flex items-center gap-1"
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClearAll}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="size-5" />
              Clear All Notifications
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
