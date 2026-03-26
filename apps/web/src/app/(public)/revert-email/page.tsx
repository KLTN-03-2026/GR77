'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function RevertEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [step, setStep] = useState<'LOADING' | 'FORM' | 'SUCCESS' | 'ERROR'>('LOADING');
  const [errorMsg, setErrorMsg] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg('Đường dẫn không hợp lệ hoặc không có mã xác thực.');
      setStep('ERROR');
      return;
    }

    // Call revert-email as soon as the component mounts
    const revertEmail = async () => {
      try {
        const res = await fetch('http://localhost:3001/auth/revert-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Có lỗi xảy ra khi khôi phục.');
        }

        // Successfully reverted and locked -> Show unlock form
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');

        setStep('FORM');
      } catch (err: any) {
        setErrorMsg(err.message);
        setStep('ERROR');
      }
    };

    revertEmail();
  }, [token]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu mới không khớp.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:3001/auth/unlock-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Đổi mật khẩu thất bại.');
      }

      setStep('SUCCESS');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
      {step === 'LOADING' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00AEEF] border-t-transparent"></div>
          <h2 className="text-xl font-bold text-gray-800">Đang bảo vệ tài khoản...</h2>
          <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát.</p>
        </div>
      )}

      {step === 'ERROR' && (
        <div className="flex flex-col items-center justify-center space-y-5 py-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Không thể xử lý</h2>
          <p className="text-gray-600 font-medium text-sm">{errorMsg}</p>
          <Link
            href="/login"
            className="mt-4 px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all w-full"
          >
            Quay lại Đăng nhập
          </Link>
        </div>
      )}

      {step === 'FORM' && (
        <form onSubmit={handleUnlock} className="text-left space-y-5">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Tài khoản đã khóa tạm thời</h2>
            <p className="text-gray-500 text-sm mt-2">
              Website đã ghi nhận yêu cầu hủy đổi email. Để mở khóa tài khoản, bạn phải đổi mật khẩu ngay bây giờ.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu cũ</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-[#00AEEF] focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
              placeholder="Nhập mật khẩu cũ"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-[#00AEEF] focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
              placeholder="Nhập mật khẩu mới"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-[#00AEEF] focus:ring-2 focus:ring-cyan-100 outline-none transition-all"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#00AEEF] text-white rounded-full font-bold hover:bg-cyan-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu & Mở khóa'}
          </button>
        </form>
      )}

      {step === 'SUCCESS' && (
        <div className="flex flex-col items-center justify-center space-y-4 py-6">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Mở khóa thành công!</h2>
          <p className="text-gray-600 text-sm">
            Tài khoản của bạn đã được bảo vệ và đổi mật khẩu an toàn.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 w-full px-6 py-2.5 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-all"
          >
            Đến trang Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
}

export default function RevertEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={<div className="font-bold text-gray-500">Đang tải biểu mẫu...</div>}>
        <RevertEmailContent />
      </Suspense>
    </div>
  );
}
