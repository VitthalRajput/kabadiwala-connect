import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Calculator,
  Truck,
  CreditCard,
  Bell,
  UserCheck,
  LogOut,
  Tag,
  Search,
  CheckCircle2,
  Recycle,
  X,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sellerNav = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Create Lot', path: '/seller/lots/create', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'My Lots', path: '/seller/lots', icon: <Package className="w-4 h-4" /> },
    { label: 'Price Estimate', path: '/seller/price-estimate', icon: <Calculator className="w-4 h-4" /> },
    { label: 'Pickups', path: '/seller/pickups', icon: <Truck className="w-4 h-4" /> },
    { label: 'Transactions', path: '/seller/transactions', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Notifications', path: '/seller/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Profile', path: '/seller/profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const recyclerNav = [
    { label: 'Dashboard', path: '/recycler/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Browse Lots', path: '/recycler/lots', icon: <Search className="w-4 h-4" /> },
    { label: 'Accepted Lots', path: '/recycler/accepted-lots', icon: <CheckCircle2 className="w-4 h-4" /> },
    { label: 'Pickups', path: '/recycler/pickups', icon: <Truck className="w-4 h-4" /> },
    { label: 'Transactions', path: '/recycler/transactions', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'My Prices', path: '/recycler/prices', icon: <Tag className="w-4 h-4" /> },
    { label: 'Notifications', path: '/recycler/notifications', icon: <Bell className="w-4 h-4" /> },
    { label: 'Profile', path: '/recycler/profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  const navItems = role === 'recycler' ? recyclerNav : sellerNav;

  return (
    <aside className="w-full h-full bg-white border-r border-gray-200 flex flex-col select-none">
      {/* Brand Header */}
      <div className="h-20 px-5 sm:px-6 flex items-center justify-between border-b border-gray-100 gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-600 to-saffron-400 flex items-center justify-center text-white shadow-sm">
            <Recycle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-gray-900">
              Kabadiwala <span className="text-saffron-500">Connect</span>
            </span>
            <span className="text-[10px] font-bold text-saffron-700/80 uppercase tracking-wider">
              {role === 'recycler' ? 'Buyer Portal' : 'Collector Portal'}
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 tap-bounce group ${
                isActive
                  ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-md shadow-saffron-500/25 scale-[1.01]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-saffron-50/70 hover:translate-x-1'
              }`
            }
          >
            <span className="shrink-0 transition-transform group-hover:scale-110 duration-200">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors tap-bounce"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
