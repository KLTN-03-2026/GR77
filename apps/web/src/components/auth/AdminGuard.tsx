'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DecodedToken {
  role?: string;
  sub?: string;
  email?: string;
  exp?: number;
}

function decodeJwt(token: string): DecodedToken | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    const decoded = decodeJwt(token);

    // Token hết hạn
    if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      router.replace('/login');
      return;
    }

    // Không phải admin
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
