'use client';

import '@fontsource/allura';
import { BellIcon, Bars3Icon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
}

export default function Header({ onToggleSidebar, isOpen }: HeaderProps) {
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('User');

  // TODO: Fetch user data from API
  useEffect(() => {
    // Example: Fetch user data
    // const fetchUserData = async () => {
    //   try {
    //     const response = await fetch('/api/user/profile');
    //     const data = await response.json();
    //     setUserName(data.username || data.name);
    //   } catch (error) {
    //     console.error('Failed to fetch user data:', error);
    //   }
    // };
    // fetchUserData();
  }, []);

  // Render breadcrumbs based on pathname
  const renderBreadcrumbs = () => {
    if (pathname.includes('/creator/campaigns/new')) {
      return (
        <>
          <Link href="/home" className="hover:text-blue-600">Home</Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" strokeWidth={3} />
          <Link href="/creator/campaigns" className="hover:text-blue-600">My Campaigns</Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" strokeWidth={3} />
          <span className="text-gray-900 font-medium">Add</span>
        </>
      );
    }

    // Default simple breadcrumbs for other pages
    let title = 'Home';
    if (pathname.includes('/home')) title = 'Home';
    else if (pathname.includes('/favorites')) title = 'Favorite Campaigns';
    else if (pathname.includes('/activity')) title = 'Activity History';
    else if (pathname.includes('/joined')) title = 'Joined Campaigns';
    else if (pathname.includes('/creator')) title = 'My Campaigns';
    else if (pathname.includes('/list')) title = 'All Campaigns';
    else if (pathname.includes('/wallet')) title = 'Wallet';
    else if (pathname.includes('/settings')) title = 'Setting';

    return (
      <>
        <span>{title}</span>
        <ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} />
      </>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-2">
          {/* Toggle sidebar button */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:block -ml-2 p-2 text-gray-900 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Bars3Icon className="h-6 w-6 stroke-2" />
          </button>

          {/* Logo */}
          <div className="bg-[#47c9e5] rounded-full px-3 py-1 sm:px-4 sm:py-1.5 shadow-md flex items-center justify-center min-w-max">
            <span className="text-white text-xl sm:text-2xl font-black tracking-wide flex items-center">
              K
              <span className="relative -top-[-0.04em] mx-[4px] w-[0.2em] h-[0.72em]">
                {/* Custom dot (water drop) */}
                <span
                  className="absolute -top-[0.4em] left-[0.2em] w-[0.22em] h-[0.25em] bg-white transition-all"
                  style={{ borderRadius: '50% 80% 50% 0.5px' }}
                ></span>
                {/* Custom stem */}
                <span className="absolute bottom-0 left-0 w-full h-full bg-white rounded-full"></span>
              </span>
              NDLINK
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Welcome message */}
            <p className="text-gray-800 text-xl sm:text-2xl lg:text-3xl ml-2 whitespace-nowrap" style={{ fontFamily: 'Allura, cursive' }}>
              Welcome back, {userName}. Ready to create impact today?
            </p>
          </div>
        </div>

        {/* Notification icon */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <BellIcon className="h-6 w-6 text-cyan-500" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-cyan-500 rounded-full"></span>
        </button>
      </div>

      {/* Breadcrumb - full width */}
      <div className={`bg-blue-50 px-4 sm:px-6 lg:px-8 py-2 transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <div className="flex items-center text-sm text-gray-700 font-medium">
          {renderBreadcrumbs()}
        </div>
      </div>
    </header>
  );
}
