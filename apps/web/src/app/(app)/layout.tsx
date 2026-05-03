'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

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

/** Guard kiểm tra user đã đăng nhập chưa */
function UserGuard({ children }: { children: React.ReactNode }) {
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
      localStorage.removeItem('userName');
      router.replace('/login');
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

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Open sidebar by default only on desktop (md = 768px)
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    setSidebarOpen(isDesktop);
  }, []);

  return (
    <UserGuard>
      <div className="min-h-dvh bg-white flex flex-col">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />


        <div className={`flex flex-col min-h-dvh ${sidebarOpen ? 'md:pl-64' : 'md:pl-0'}`}>

          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isOpen={sidebarOpen} />

          <main className="pb-24 md:pb-4 flex-1" style={{ paddingTop: 'var(--header-h)' }}>

            <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
              {children}
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </UserGuard>
  );
}
