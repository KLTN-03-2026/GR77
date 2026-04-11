'use client';

import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Camera,
    Upload,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    Loader2,
    IdCard,
    UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

export default function EkycPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Info, 2: Front, 3: Back, 4: Selfie, 5: Review

    const [frontImage, setFrontImage] = useState<File | null>(null);
    const [backImage, setBackImage] = useState<File | null>(null);
    const [selfieImage, setSelfieImage] = useState<File | null>(null);

    const [frontPreview, setFrontPreview] = useState<string | null>(null);
    const [backPreview, setBackPreview] = useState<string | null>(null);
    const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    useEffect(() => {
        const fetchStatus = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API}/ekyc/my-status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data);
                }
            } catch (err) {
                console.error('Failed to fetch KYC status');
            }
        };
        fetchStatus();
    }, [token]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back' | 'selfie') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'front') {
            setFrontImage(file);
            setFrontPreview(URL.createObjectURL(file));
            setStep(3);
        } else if (type === 'back') {
            setBackImage(file);
            setBackPreview(URL.createObjectURL(file));
            setStep(4);
        } else if (type === 'selfie') {
            setSelfieImage(file);
            setSelfiePreview(URL.createObjectURL(file));
            setStep(5);
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url;
    };

    const handleSubmit = async () => {
        if (!frontImage || !backImage || !selfieImage || !token) return;

        setIsVerifying(true);
        setError(null);

        try {
            // 1. Upload all images
            const [frontUrl, backUrl, selfieUrl] = await Promise.all([
                uploadImage(frontImage),
                uploadImage(backImage),
                uploadImage(selfieImage)
            ]);

            // 2. Submit for verification
            const res = await fetch(`${API}/ekyc/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    frontImageUrl: frontUrl,
                    backImageUrl: backUrl,
                    selfieImageUrl: selfieUrl
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Verification submission failed');
            }

            const result = await res.json();
            setStatus(result.data);
            setStep(6); // Success step
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsVerifying(false);
        }
    };

    // 渲染 trạng thái hiện tại nếu đã nộp
    if (status && status.status !== 'NOT_STARTED' && step < 6) {
        return (
            <div className="max-w-2xl mx-auto py-12 px-4">
                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-cyan-500 mb-8 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Profile
                </Link>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 text-center space-y-6">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${status.status === 'APPROVED' ? 'bg-green-50 text-green-500' :
                        status.status === 'REJECTED' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                        {status.status === 'APPROVED' ? <ShieldCheck className="w-10 h-10" /> :
                            status.status === 'REJECTED' ? <AlertCircle className="w-10 h-10" /> : <Loader2 className="w-10 h-10 animate-spin" />}
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {status.status === 'APPROVED' ? 'Xác minh thành công' :
                                status.status === 'REJECTED' ? 'Xác minh bị từ chối' : 'Đang xử lý xác minh'}
                        </h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {status.status === 'APPROVED' ? 'Tài khoản của bạn đã được xác minh chính chủ. Bạn có thể toàn quyền sử dụng các tính năng rút tiền và tạo chiến dịch.' :
                                status.status === 'REJECTED' ? `Lý do: ${status.rejectionReason || 'Thông tin không rõ ràng.'}` :
                                    'Hệ thống đang kiểm tra thông tin CCCD của bạn. Quá trình này thường mất từ 5-10 phút.'}
                        </p>
                    </div>

                    {status.status === 'REJECTED' && (
                        <button
                            onClick={() => { setStatus(null); setStep(1); }}
                            className="px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
                        >
                            Thử lại ngay
                        </button>
                    )}

                    <Link href="/home" className="block text-sm font-bold text-cyan-500 hover:underline">
                        Quay về trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <Link href="/profile" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-cyan-500 mb-8 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Profile
            </Link>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 overflow-hidden">
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 bg-cyan-50 text-cyan-500 rounded-2xl flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Xác minh danh tính (eKYC)</h2>
                            <p className="text-gray-500">Để đảm bảo an toàn cho cộng đồng và tuân thủ quy định pháp luật, chúng tôi cần xác minh danh tính của bạn.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: <IdCard className="w-6 h-6" />, title: 'CCCD/CMND', desc: 'Mặt trước và mặt sau' },
                                { icon: <UserCheck className="w-6 h-6" />, title: 'Khuôn mặt', desc: 'Ảnh selfie chính chủ' },
                                { icon: <ShieldCheck className="w-6 h-6" />, title: 'An toàn', desc: 'Dữ liệu được mã hóa' }
                            ].map((item, i) => (
                                <div key={i} className="p-6 bg-gray-50 rounded-3xl text-center space-y-2">
                                    <div className="text-cyan-500 flex justify-center">{item.icon}</div>
                                    <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-100 transition-all active:scale-[0.98]"
                        >
                            Bắt đầu xác minh
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Bước 1/3</span>
                            <h2 className="text-2xl font-bold text-gray-900">Mặt trước CCCD</h2>
                            <p className="text-gray-500 text-sm">Vui lòng chụp hoặc tải lên mặt trước của thẻ CCCD/CMND còn hạn sử dụng.</p>
                        </div>

                        <div className="aspect-[1.58/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                            <Camera className="w-12 h-12 text-gray-300 mb-4 group-hover:text-cyan-500 transition-colors" />
                            <p className="text-sm font-bold text-gray-400">Nhấp để chụp hoặc chọn ảnh</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'front')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>

                        <ul className="space-y-2">
                            {['Ảnh rõ nét, không bị lóa sáng', 'Đầy đủ 4 góc của thẻ', 'Không bị che khuất thông tin'].map((text, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Bước 2/3</span>
                            <h2 className="text-2xl font-bold text-gray-900">Mặt sau CCCD</h2>
                            <p className="text-gray-500 text-sm">Vui lòng chụp hoặc tải lên mặt sau của thẻ CCCD/CMND.</p>
                        </div>

                        <div className="aspect-[1.58/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
                            <Camera className="w-12 h-12 text-gray-300 mb-4 group-hover:text-cyan-500 transition-colors" />
                            <p className="text-sm font-bold text-gray-400">Nhấp để chụp hoặc chọn ảnh</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'back')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <span className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Bước 3/3</span>
                            <h2 className="text-2xl font-bold text-gray-900">Ảnh chân dung (Selfie)</h2>
                            <p className="text-gray-500 text-sm">Chụp ảnh khuôn mặt của bạn để đảm bảo chính chủ.</p>
                        </div>

                        <div className="aspect-square max-w-[300px] mx-auto bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex flex-col items-center justify-center relative overflow-hidden group">
                            <Camera className="w-12 h-12 text-gray-300 mb-4 group-hover:text-cyan-500 transition-colors" />
                            <p className="text-xs font-bold text-gray-400 text-center px-4">Giữ mặt thẳng, không đeo kính và khẩu trang</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'selfie')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h2 className="text-2xl font-bold text-gray-900 text-center">Kiểm tra thông tin</h2>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Mặt trước</p>
                                <div className="aspect-[1.58/1] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={frontPreview!} alt="Front" className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">Mặt sau</p>
                                <div className="aspect-[1.58/1] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={backPreview!} alt="Back" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="space-y-2 text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Ảnh chân dung</p>
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-cyan-500 shadow-lg">
                                    <img src={selfiePreview!} alt="Selfie" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setStep(4)}
                                className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
                            >
                                Làm lại
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isVerifying}
                                className="flex-2 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl"
                            >
                                {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                {isVerifying ? 'Đang xử lý...' : 'Xác nhận & Gửi'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="space-y-8 text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto scale-110">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-gray-900">Nộp hồ sơ thành công!</h2>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">Kindlink đã nhận được hồ sơ của bạn. Chúng tôi sẽ thông báo kết quả qua email và thông báo đẩy sau ít phút.</p>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 text-left space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Dữ liệu trích xuất (AI OCR)</p>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <p className="text-[10px] font-medium text-gray-400 uppercase">Họ tên</p>
                                    <p className="text-sm font-bold text-gray-800">{status?.fullName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-medium text-gray-400 uppercase">Số CCCD</p>
                                    <p className="text-sm font-bold text-gray-800">{status?.idNumber || 'N/A'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] font-medium text-gray-400 uppercase">Địa chỉ</p>
                                    <p className="text-xs font-bold text-gray-800">{status?.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/profile')}
                            className="w-full py-5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-xl"
                        >
                            Về trang Profile
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
