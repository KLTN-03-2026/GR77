'use client';

import '@fontsource/allura';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
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
  
  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname.includes('/campaigns')) return 'Home';
    if (pathname.includes('/favorites')) return 'Favorite Campaigns';
    if (pathname.includes('/activity')) return 'Activity History';
    if (pathname.includes('/joined')) return 'Joined Campaigns';
    if (pathname.includes('/creator')) return 'My Campaigns';
    if (pathname.includes('/wallet')) return 'Wallet';
    if (pathname.includes('/settings')) return 'Setting';
    return 'Home';
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Toggle sidebar button */}
          <button 
            onClick={onToggleSidebar}
            className="hidden lg:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Welcome message */}
          <p className="text-gray-800 text-2xl sm:text-3xl" style={{ fontFamily: 'Allura, cursive' }}>
            Welcome back, {userName}. Ready to create impact today?
          </p>
        </div>

        {/* Notification icon */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <BellIcon className="h-6 w-6 text-cyan-500" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-cyan-500 rounded-full"></span>
        </button>
      </div>
      
      {/* Breadcrumb - full width */}
      <div className="bg-blue-50 px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center text-sm text-gray-700">
          <span>{getPageTitle()}</span>
          <span className="ml-2">{'>'}</span>
        </div>
      </div>
    </header>
  );
}
