'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar, { type MenuItem } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AdminLanguageProvider, useAdminLanguage } from '@/contexts/AdminLanguageContext';
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
  UserGroupIcon,
  TagIcon,
  ExclamationCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';


// ── Types ──────────────────────────────────────────────────────────
export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

/** Decode JWT payload (client-side only, no signature verify) */
function decodeJwt(token: string): { role?: string; sub?: string; exp?: number; permissions?: string[] } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

// ── Menu definitions ────────────────────────────────────────────────
import { AdminPermission } from '@/constants/permissions';

function useAdminMenu(role: AdminRole, permissions: string[] = []): MenuItem[] {
  const { translate } = useAdminLanguage();

  const isSuper = role === 'SUPER_ADMIN';
  const has = (p: AdminPermission) => isSuper || permissions.includes(p);

  const menuItems: (MenuItem & { permission?: AdminPermission })[] = [
    { name: translate('menu.dashboard'), href: '/admin/dashboard', icon: ChartBarIcon },
    { name: translate('menu.users'), href: '/admin/users', icon: UsersIcon, permission: AdminPermission.USERS_VIEW },
    { name: translate('menu.admins'), href: '/admin/admins', icon: ShieldExclamationIcon, permission: AdminPermission.ADMINS_MANAGE },
    { name: translate('menu.reports'), href: '/admin/report', icon: ExclamationCircleIcon, permission: AdminPermission.REPORTS_MANAGE },
    { name: translate('menu.campaigns'), href: '/admin/campaigns', icon: FlagIcon, permission: AdminPermission.CAMPAIGNS_VIEW },
    { name: translate('menu.categories'), href: '/admin/categories', icon: TagIcon, permission: AdminPermission.CATEGORIES_MANAGE },
    { name: translate('menu.transactions'), href: '/admin/transactions', icon: ArrowsRightLeftIcon, permission: AdminPermission.TRANSACTIONS_VIEW },

    { name: translate('menu.withdrawals'), href: '/admin/withdrawals', icon: ArrowDownTrayIcon, permission: AdminPermission.WITHDRAWALS_APPROVE },
    { name: translate('menu.revenue'), href: '/admin/revenue', icon: CurrencyDollarIcon, permission: AdminPermission.REVENUE_VIEW },
    { name: translate('menu.moderation'), href: '/admin/moderation', icon: ShieldCheckIcon, permission: AdminPermission.COMMENTS_MANAGE },
    { name: translate('menu.kyc'), href: '/admin/kyc', icon: FingerPrintIcon, permission: AdminPermission.EKYC_APPROVE },
    { name: translate('menu.settings'), href: '/admin/settings', icon: Cog6ToothIcon, permission: AdminPermission.SETTINGS_MANAGE },
  ];

  return menuItems.filter(item => !item.permission || has(item.permission));
}

// ── AdminGuard ─────────────────────────────────────────────────────
interface GuardResult {
  authorized: boolean | null;
  role: AdminRole | null;
  permissions: string[];
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GuardResult>({ authorized: null, role: null, permissions: [] });

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      router.replace('/admin/login');
      return;
    }

    const decoded = decodeJwt(token);

    // Token hết hạn
    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      router.replace('/admin/login');
      return;
    }

    const role = decoded?.role as string | undefined;

    // Chỉ ADMIN và SUPER_ADMIN được phép vào panel
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      router.replace('/home');
      return;
    }

    setState({
      authorized: true,
      role: role as AdminRole,
      permissions: decoded?.permissions || []
    });
  }, [router]);

  if (state.authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#D0E3F9]/80">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#47c9e5]/30 border-t-[#47c9e5] animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Đang xác thực quyền truy cập…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Inner Layout ───────────────────────────────────────────────────
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole>('ADMIN');
  const [permissions, setPermissions] = useState<string[]>([]);
  const pathname = usePathname();
  const { translate } = useAdminLanguage();

  useEffect(() => {
    // Tự động mở sidebar nếu là màn hình lớn
    if (window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }

    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;
    const decoded = decodeJwt(token);
    if (decoded?.role === 'SUPER_ADMIN') setAdminRole('SUPER_ADMIN');
    if (decoded?.permissions) setPermissions(decoded.permissions);
  }, []);

  const menuItems = useAdminMenu(adminRole, permissions);
  const currentMenu = menuItems.find((item) => pathname.startsWith(item.href)) || { name: translate('admin.portal') };

  const roleLabel = adminRole === 'SUPER_ADMIN' ? 'SUPER ADMIN' : 'ADMIN';

  return (
    <div className="min-h-dvh bg-[#D0E3F9]/100 flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
        roleLabel={roleLabel}
      />


      <div className={`flex flex-col min-h-dvh transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}`}>

        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isOpen={sidebarOpen}
          roleLabel={roleLabel}
        />
        <main className="pb-24 lg:pb-4 flex-1" style={{ paddingTop: 'var(--header-h)' }}>

          <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
            {!pathname.includes('/notifications') && (
              <div className="mb-8">
                <h1 className="text-3xl font-black text-[#24305E] uppercase tracking-wider">
                  {currentMenu.name}
                </h1>
              </div>
            )}
            {children}
          </div>
        </main>
        <Footer isAdmin={true} />
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminLanguageProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AdminLanguageProvider>
    </AdminGuard>
  );
}
