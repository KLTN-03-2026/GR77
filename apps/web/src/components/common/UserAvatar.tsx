'use client';

import { UserIcon } from '@heroicons/react/24/outline';

interface UserAvatarProps {
    src?: string | null;
    role?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function UserAvatar({ src, role, size = 'md', className = '' }: UserAvatarProps) {
    const isInternal = role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'Admin' || role === 'Super Admin';
    const isSuper = role === 'SUPER_ADMIN' || role === 'Super Admin';

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-9 h-9',
        lg: 'w-12 h-12',
        xl: 'w-20 h-20',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-7 h-7',
        xl: 'w-12 h-12',
    };

    // Nếu có ảnh đại diện thì hiển thị ảnh
    if (src) {
        return (
            <div className={`relative shrink-0 ${sizeClasses[size]} rounded-full overflow-hidden border border-gray-100 shadow-sm ${className}`}>
                <img src={src} alt="Avatar" className="w-full h-full object-cover" />
            </div>
        );
    }

    // Nếu là Admin/Super Admin và chưa có ảnh -> Dùng style "Admin Default"
    if (isInternal) {
        const gradientClass = isSuper
            ? 'from-[#FF3D77] via-[#FF9500] to-[#FFD500]'
            : 'from-[#FF3D77] via-[#338AFF] to-[#7B2CFE]';

        return (
            <div className={`relative shrink-0 group flex items-center justify-center ${sizeClasses[size]} ${className}`}>
                {/* Lớp viền gradient - lùi vào 1px để không bị dính mép container */}
                <div className={`absolute inset-[1px] rounded-full bg-gradient-to-tr ${gradientClass} opacity-80 blur-[1px] group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative w-[calc(100%-6px)] h-[calc(100%-6px)] rounded-full bg-white p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                        <svg className={`${iconSizes[size]} text-white/90`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu là User/Organizer và chưa có ảnh -> Dùng style "User Default"
    return (
        <div className={`p-[1.5px] ${className}`}>
            <div className={`relative shrink-0 ${sizeClasses[size]} rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center border-2 border-[#47c9e5]`}>
                <UserIcon className={`${iconSizes[size]} text-cyan-300`} />
            </div>
        </div>
    );

}
