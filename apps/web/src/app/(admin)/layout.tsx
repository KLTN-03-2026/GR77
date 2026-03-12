'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar, { type MenuItem } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  ChartBarIcon,
  UsersIcon,
  FlagIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  FingerPrintIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

/** Decode JWT payload (client-side only, no signature verify) */
function decodeJwt(token: string): { role?: string; exp?: number } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/** Navigation dành riêng cho Admin */
const adminMenuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'Campaign', href: '/admin/campaigns', icon: FlagIcon },
  { name: 'Transaction', href: '/admin/transactions', icon: ArrowsRightLeftIcon },
  { name: 'Withdrawal', href: '/admin/withdrawals', icon: ArrowDownTrayIcon },
  { name: 'Fee & Revenue', href: '/admin/revenue', icon: CurrencyDollarIcon },
  { name: 'Content Moderation', href: '/admin/moderation', icon: ShieldCheckIcon },
  { name: 'KYC Verification', href: '/admin/kyc', icon: FingerPrintIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

/** Guard kiểm tra role ADMIN từ JWT */
function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    const decoded = decodeJwt(token);

    // Token hết hạn
    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      router.replace('/login');
      return;
    }

    // Không phải admin → về trang user
    const role = decoded?.role;
    if (role !== 'ADMIN' && role !== 'admin') {
      router.replace('/home');
      return;
    }

    setAuthorized(true);
  }, [router]);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#47c9e5]/30 border-t-[#47c9e5] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Verifying access…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/** Layout cho toàn bộ route group (admin) */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Tái sử dụng Sidebar của user, truyền menu admin */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          menuItems={adminMenuItems}
        />

        <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>
          {/* Tái sử dụng Header của user, thêm roleLabel */}
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isOpen={sidebarOpen}
            roleLabel="ADMIN"
          />

          <main className="pt-[104px] pb-4 flex-1">
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </div>
          </main>

          {/* Tái sử dụng Footer của user */}
          <Footer />
        </div>
      </div>
    </AdminGuard>
  );
}
