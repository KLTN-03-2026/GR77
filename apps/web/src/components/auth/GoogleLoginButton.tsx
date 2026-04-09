"use client";

import { useGoogleLogin } from '@react-oauth/google';
import { useGlobalAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function GoogleLoginButton() {
    const { login } = useGlobalAuth();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleGoogleSuccess = async (tokenResponse: any) => {
        setIsProcessing(true);
        try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const googleUser = await userInfoRes.json();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/google-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: googleUser.email,
                    googleId: googleUser.sub,
                    name: googleUser.name,
                    avatarUrl: googleUser.picture,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.message === 'EMAIL_ALREADY_REGISTERED_LOCAL') {
                    setError('Email này đã được đăng ký bằng mật khẩu. Vui lòng đăng nhập bình thường để liên kết.');
                } else {
                    setError(data.message || 'Đăng nhập Google thất bại');
                }
                return;
            }

            login({
                ...data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            router.push('/home');
        } catch (err) {
            console.error('Google login error:', err);
            setError('Đã có lỗi xảy ra khi kết nối với máy chủ.');
        } finally {
            setIsProcessing(false);
        }
    };

    const googleLoginTrigger = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Đăng nhập Google thất bại'),
    });

    const handleButtonClick = () => {
        setError(null);
        setShowModal(true);
    };

    const handleAgree = () => {
        setShowModal(false);
        googleLoginTrigger();
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={handleButtonClick}
                disabled={isProcessing}
                className="btn-google w-full py-3.5 bg-white border border-gray-200 text-gray-700 font-semibold text-[15px] rounded-full flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
            >
                {isProcessing ? (
                    <div className="h-5 w-5 border-2 border-[#00AEEF] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                Continue with Google
            </button>

            {error && (
                <p className="mt-3 text-sm text-red-500 text-center font-medium bg-red-50 py-1 rounded-lg">{error}</p>
            )}

            {showModal && isMounted && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
                        onClick={() => setShowModal(false)}
                    />

                    <div className="relative z-[100000] bg-white w-full max-w-[420px] rounded-[40px] p-8 sm:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] animate-in zoom-in-95 fade-in duration-300 ease-out">
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-8">
                                <svg className="w-8 h-8 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 tracking-tight">Terms of Service</h3>

                            <p className="text-gray-500 text-base leading-relaxed mb-10">
                                To provide the best experience and protect your data, please confirm that you agree to Kindlink's
                                <span className="text-[#00AEEF] font-bold mx-1">Terms of Service</span> and
                                <span className="text-[#00AEEF] font-bold mx-1">Privacy Policy</span>.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={handleAgree}
                                    className="w-full py-4 bg-[#00AEEF] text-white font-bold text-lg rounded-2xl hover:bg-[#0097d9] transition-all shadow-xl shadow-blue-100 hover:shadow-blue-200 active:scale-[0.98]"
                                >
                                    I Agree
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-4 text-gray-400 font-bold text-base hover:text-gray-600 transition-colors"
                                >
                                    Not now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
