'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon,
  HeartIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  WalletIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Favorite Campaigns', href: '/favorites', icon: HeartIcon },
  { name: 'Activity History', href: '/activity', icon: ClockIcon },
  { name: 'Joined Campaigns', href: '/joined', icon: UserGroupIcon },
  { name: 'My Campaigns', href: '/creator/campaigns', icon: DocumentTextIcon },
  { name: 'List campaigns', href: '/list', icon: Bars3BottomLeftIcon },
  { name: 'Wallet', href: '/wallet', icon: WalletIcon },
  { name: 'Setting', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch('http://localhost:3001/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.push('/login');
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Sidebar for desktop */}
      <aside className={`
        hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col
        transition-transform duration-300 z-30
        ${isOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
      `}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Spacer to push menu items below the fixed Header */}
          <div className="h-20 w-full flex-shrink-0"></div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-6">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative flex items-center px-4 py-3 text-base rounded-xl transition-all border
                    ${isActive
                      ? 'bg-[#47c9e5]/10 text-[#47c9e5] font-medium border-transparent'
                      : 'text-gray-900 font-medium border-transparent hover:border-cyan-400 hover:ring-2 hover:ring-cyan-100 hover:bg-white hover:text-cyan-600 hover:shadow-sm'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#47c9e5] rounded-r-full" />
                  )}
                  <item.icon className={`mr-4 h-6 w-6 ${isActive ? 'stroke-2' : ''}`} />
                  {item.name}
                </Link>
              );
            })}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6" />
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </button>
          </nav>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors
                  ${isActive
                    ? 'text-blue-600'
                    : 'text-gray-600'
                  }
                `}
              >
                <item.icon className="h-6 w-6 mb-1" />
                <span className="text-xs truncate w-full text-center">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
