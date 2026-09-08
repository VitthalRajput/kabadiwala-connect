import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { notificationsApi } from '../../api/notifications.api';
import { AppNotification } from '../../types/notification.types';
import { DUMMY_NOTIFICATIONS_SELLER, DUMMY_NOTIFICATIONS_RECYCLER } from '../../utils/dummyNotifications';
import { Bell, Menu, WifiOff, Check, ArrowRight, RefreshCw, UserCheck, Factory } from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

interface TopHeaderProps {
  onMenuToggle: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onMenuToggle }) => {
  const { user, role, switchRole } = useAuth();
  const { isOnline } = useOffline();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notification stats & latest
  useEffect(() => {
    let isMounted = true;

    const fetchNotifs = async () => {
      try {
        const statsRes = await notificationsApi.getStats();
        const listRes = await notificationsApi.getNotifications(1, 5);
        
        if (isMounted) {
          if (listRes.data?.notifications && listRes.data.notifications.length > 0) {
            setNotifications(listRes.data.notifications);
            setUnreadCount(statsRes.data?.unreadCount ?? 0);
          } else {
            // Fallback to role-specific dummy notifications so user always sees live feed
            const defaultNotifs = role === 'recycler' ? DUMMY_NOTIFICATIONS_RECYCLER : DUMMY_NOTIFICATIONS_SELLER;
            setNotifications(defaultNotifs);
            setUnreadCount(defaultNotifs.filter((n) => !n.isRead).length);
          }
        }
      } catch {
        if (isMounted) {
          const defaultNotifs = role === 'recycler' ? DUMMY_NOTIFICATIONS_RECYCLER : DUMMY_NOTIFICATIONS_SELLER;
          setNotifications(defaultNotifs);
          setUnreadCount(defaultNotifs.filter((n) => !n.isRead).length);
        }
      }
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000); // 30s poll

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [role]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await notificationsApi.markAsRead(notif._id);
      } catch {
        // Local mark read fallback
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleSwitchPortal = () => {
    const nextRole = role === 'recycler' ? 'collector' : 'recycler';
    switchRole(nextRole);
    navigate(nextRole === 'recycler' ? '/recycler/dashboard' : '/seller/dashboard');
  };

  const notificationPath =
    role === 'recycler' ? '/recycler/notifications' : '/seller/notifications';
  const profilePath = role === 'recycler' ? '/recycler/profile' : '/seller/profile';

  const userDisplayName = user?.fullName || (role === 'recycler' ? 'Kunal' : 'Ramesh');
  const roleTitle = role === 'recycler' ? 'Recycler (Buyer)' : 'Kabadiwala (Seller)';

  return (
    <header className="h-20 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger & Welcome text */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900">
            Welcome, {userDisplayName}!
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            {role === 'recycler'
              ? 'Find verified scrap material for your recycling operations.'
              : "Let's make recycling simple, transparent and rewarding."}
          </p>
        </div>
      </div>

      {/* Right: Portal switcher, Offline badge, notifications bell & User profile card */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Portal Switcher Button */}
        <button
          type="button"
          onClick={handleSwitchPortal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-saffron-300 bg-saffron-50 hover:bg-saffron-100 text-saffron-800 transition-all tap-bounce cursor-pointer shadow-2xs"
          title="Toggle between Buyer (Recycler) and Seller (Kabadiwala) Portals"
        >
          <RefreshCw className="w-3.5 h-3.5 text-saffron-600" />
          <span className="hidden md:inline">
            Switch to {role === 'recycler' ? 'Collector Portal' : 'Buyer Portal'}
          </span>
          <span className="md:hidden">Switch</span>
        </button>

        {/* Offline Badge */}
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>Offline</span>
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative p-2.5 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-saffron-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 overflow-hidden animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-saffron-600 font-semibold">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-400">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !n.isRead ? 'bg-saffron-50/40' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          !n.isRead ? 'bg-saffron-500' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1 text-xs">
                        <p className="font-semibold text-gray-800">{n.title}</p>
                        <p className="text-gray-500 line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 pt-2 border-t border-gray-100 text-center">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate(notificationPath);
                  }}
                  className="text-xs font-semibold text-saffron-600 hover:text-saffron-700 inline-flex items-center gap-1 py-1"
                >
                  <span>View All Notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Card */}
        <div
          onClick={() => navigate(profilePath)}
          className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-gray-200 cursor-pointer hover:opacity-90 group"
        >
          <div className="w-10 h-10 rounded-full bg-saffron-100 border border-saffron-300 flex items-center justify-center text-saffron-800 font-bold text-sm shadow-xs overflow-hidden shrink-0">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={userDisplayName} className="w-full h-full object-cover" />
            ) : (
              userDisplayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-bold text-gray-900 group-hover:text-saffron-600 transition-colors">
              {userDisplayName}
            </span>
            <span className={`text-xs font-semibold ${role === 'recycler' ? 'text-blue-600' : 'text-saffron-600'}`}>
              {roleTitle}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
