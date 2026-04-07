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
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

export interface MenuItem {
  name: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.FC<any>;
}

/** Default navigation for regular users */
export const userMenuItems: MenuItem[] = [
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
  /** Override the default user menu with a custom list (e.g. admin menu) */
  menuItems?: MenuItem[];
  /** Optional role label shown at the top of the sidebar (e.g. 'ADMIN') */
  roleLabel?: string;
  /** Optional class to override the top spacer height (defaults to h-[104px]) */
  topSpacerClass?: string;
}

export default function Sidebar({ isOpen, onClose, menuItems, roleLabel, topSpacerClass = 'h-[104px]' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use provided menuItems or fall back to default user menu
  const items = menuItems ?? userMenuItems;
  const isAdmin = roleLabel === 'ADMIN' || roleLabel === 'SUPER ADMIN';
  const { translate } = useAdminLanguage();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/auth/logout`, {
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
      setIsLoggingOut(false);
      if (pathname.startsWith('/admin') || isAdmin) {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
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
        <div className={`${topSpacerClass} w-full flex-shrink-0 bg-white border-r border-gray-200 flex items-end justify-center pb-2`}>
          {roleLabel && (
            <span className="text-base font-black tracking-[0.3em] text-gray-700 uppercase">
              {roleLabel}
            </span>
          )}
        </div>
        <div className="flex-1 min-h-0 bg-white border-r border-gray-200 overflow-y-auto pb-4">
          <nav className="flex-1 px-4 space-y-2 mt-2">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative flex items-center px-4 py-3 text-base rounded-xl transition-all border
                    ${isActive
                      ? (isAdmin
                        ? 'bg-[#7598C1]/30 text-gray-900 border border-[#7598C1]/40 backdrop-blur-md'
                        : 'bg-[#AFF1FF]/30 text-[#47c9e5] font-medium border border-[#AFF1FF]/80 backdrop-blur-md')
                      : (isAdmin
                        ? 'bg-white text-gray-700 border-transparent hover:text-gray-900 hover:border-[#7598C1] hover:shadow-[inset_0_0_12px_rgba(117,152,193,0.3),0_0_15px_rgba(117,152,193,0.4)]'
                        : 'bg-white text-gray-700 font-medium border-transparent hover:text-[#47c9e5] hover:border-[#47c9e5] hover:shadow-[inset_0_0_12px_rgba(71,201,229,0.3),0_0_15px_rgba(71,201,229,0.4)]')
                    }
                  `}
                >
                  {isActive && (
                    <div className={`absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-8 ${isAdmin ? 'bg-[#1d2951]' : 'bg-[#47c9e5]'} rounded-r-full`} />
                  )}
                  <item.icon className={`mr-4 h-6 w-6 ${isActive ? 'stroke-2' : ''}`} />
                  {item.name}
                </Link>
              );
            })}

            {/* Logout button - Only show for Admin if needed, or hide if moved to header */}
            {isAdmin && (
              <div className="mt-4 pb-4">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`
                    w-full flex items-center px-4 py-3 text-base rounded-xl transition-all border
                    text-gray-900 font-medium border-transparent 
                    hover:border-red-400 hover:ring-2 hover:ring-red-100 hover:bg-white hover:text-red-600 hover:shadow-sm
                    disabled:opacity-50
                  `}
                >
                  <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6 stroke-2" />
                  {isLoggingOut ? translate('sidebar.logging_out') : translate('header.logout')}
                </button>
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex overflow-x-auto no-scrollbar items-center px-2 py-2 gap-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
            flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors flex-shrink-0 min-w-[70px]
            ${isActive ? 'text-blue-600' : 'text-gray-600'}
          `}
              >
                <item.icon className="h-6 w-6 mb-1" />
                <span className="text-xs truncate w-full text-center">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center py-2 px-1 text-red-500 flex-shrink-0 min-w-[70px]"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">{translate('header.logout')}</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
