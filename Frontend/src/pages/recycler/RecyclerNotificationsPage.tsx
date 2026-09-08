import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/notifications.api';
import { AppNotification } from '../../types/notification.types';
import { DUMMY_NOTIFICATIONS_RECYCLER } from '../../utils/dummyNotifications';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Loader } from '../../components/common/Loader';
import { formatRelativeTime } from '../../utils/formatters';
import { Bell, CheckCheck, Trash2, Check, Factory } from 'lucide-react';

export const RecyclerNotificationsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApi.getNotifications(1, 50);
      if (res.data?.notifications && res.data.notifications.length > 0) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications(DUMMY_NOTIFICATIONS_RECYCLER);
      }
    } catch {
      setNotifications(DUMMY_NOTIFICATIONS_RECYCLER);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
    } catch {
      // Local fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    success('Marked as read');
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
    } catch {
      // Local fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    success('All notifications marked as read');
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
    } catch {
      // Local fallback
    }
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    success('Notification deleted');
  };

  const handleDeleteRead = async () => {
    try {
      await notificationsApi.deleteReadNotifications();
    } catch {
      // Local fallback
    }
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    success('Cleared read notifications');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Recycler Notifications</h2>
          <p className="text-xs text-gray-500">
            Real-time updates on available scrap lots, seller offer acceptances, driver handovers, and EPR certificates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            leftIcon={<CheckCheck className="w-4 h-4" />}
            className="tap-bounce"
          >
            Mark All Read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteRead}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 tap-bounce"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Clear Read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Loader text="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="You will be notified when new scrap lots matching your category prices are listed."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors hover:bg-gray-50/80 ${
                !notif.isRead ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    !notif.isRead
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                    {notif.priority === 'high' && (
                      <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-sm">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-gray-400 block pt-0.5">
                    {formatRelativeTime(notif.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif._id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
