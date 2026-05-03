'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    translate: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    vi: {
        // Menu
        'menu.dashboard': 'Bảng điều khiển',
        'menu.users': 'Quản lý người dùng',
        'menu.admins': 'Quản trị viên',
        'menu.reports': 'Quản lý báo cáo',
        'menu.campaigns': 'Chiến dịch',
        'menu.categories': 'Danh mục chiến dịch',
        'menu.transactions': 'Giao dịch',
        'menu.withdrawals': 'Rút tiền',
        'menu.revenue': 'Phí & Doanh thu',
        'menu.moderation': 'Kiểm duyệt nội dung',
        'menu.kyc': 'Xác minh KYC',
        'menu.settings': 'Cài đặt',

        // Header
        'header.search': 'Tìm kiếm...',
        'header.profile': 'Hồ sơ',
        'header.settings': 'Cài đặt',
        'header.logout': 'Đăng xuất',
        'sidebar.logging_out': 'Đang đăng xuất...',
        'header.welcome': 'Chào mừng trở lại,',
        'header.ready': '. Sẵn sàng tạo ra tác động tích cực hôm nay?',
        'header.my_profile': 'Hồ sơ của tôi',
        'header.security': 'Bảo mật',

        // Login Page
        'login.badge': 'Quản lý Kindlink',
        'login.title': 'Cổng Quản Trị',
        'login.email_label': 'Email Quản trị',
        'login.password_label': 'Mật khẩu',
        'login.remember_me': 'Ghi nhớ đăng nhập',
        'login.forgot_password': 'Quên mật khẩu?',
        'login.btn_authenticating': 'Đang xác thực...',
        'login.btn_login': 'Đăng nhập',
        'login.err_invalid': 'Mật khẩu hoặc email bạn nhập chưa chính xác',
        'login.err_denied': 'Truy cập bị từ chối. Bạn không có quyền đăng nhập vào cổng thông tin này.',
        'login.err_general': 'Đã xảy ra lỗi. Vui lòng thử lại.',

        // Settings Page
        'settings.title': 'Cài đặt Hệ thống',
        'settings.language': 'Ngôn ngữ hiển thị',
        'settings.language.desc': 'Chọn ngôn ngữ cho giao diện quản trị',
        'settings.language.vi': 'Tiếng Việt',
        'settings.language.en': 'Tiếng Anh (English)',
        'settings.save': 'Lưu thay đổi',
        'settings.saved': 'Đã lưu cấu hình!',

        // Categories Page
        'categories.total': 'Tổng danh mục',
        'categories.error.duplicate': 'Danh mục này đã tồn tại trong hệ thống!',
        'categories.delete.has_campaigns': 'Không thể xóa danh mục này do đang có chiến dịch liên quan!',
        'categories.add': 'Thêm danh mục',
        'categories.search': 'Tìm kiếm danh mục...',
        'categories.campaigns_count': 'Chiến dịch',
        'categories.created': 'Tạo ngày',
        'categories.no_results': 'Không tìm thấy danh mục',
        'categories.modal.title_add': 'Thêm danh mục',
        'categories.modal.title_edit': 'Sửa danh mục',
        'categories.modal.name_label': 'Tên danh mục',
        'categories.modal.name_placeholder': 'VD: Y tế, Giáo dục...',
        'categories.modal.cancel': 'Hủy',
        'categories.modal.save': 'Lưu',
        'categories.modal.saving': 'Đang lưu...',
        'categories.modal_delete.title': 'Xóa danh mục?',
        'categories.modal_delete.message': 'Bạn có chắc chắn muốn xóa danh mục này?',
        'categories.modal_delete.cancel': 'Hủy',
        'categories.modal_delete.confirm': 'Xóa',
        'categories.modal_delete.deleting': 'Đang xóa...',

        // Fallbacks for other generic text
        'admin.portal': 'Cổng Quản Trị'
    },
    en: {
        // Menu
        'menu.dashboard': 'Dashboard',
        'menu.users': 'Users',
        'menu.admins': 'Administrators',
        'menu.reports': 'Reports',
        'menu.campaigns': 'Campaigns',
        'menu.categories': 'Campaign Categories',
        'menu.transactions': 'Transactions',
        'menu.withdrawals': 'Withdrawals',
        'menu.revenue': 'Fee & Revenue',
        'menu.moderation': 'Content Moderation',
        'menu.kyc': 'KYC Verification',
        'menu.settings': 'Settings',

        // Header
        'header.search': 'Search...',
        'header.profile': 'Profile',
        'header.settings': 'Settings',
        'header.logout': 'Sign out',
        'sidebar.logging_out': 'Logging out...',
        'header.welcome': 'Welcome back,',
        'header.ready': '. Ready to create impact today?',
        'header.my_profile': 'My Profile',
        'header.security': 'Security',

        // Login Page
        'login.badge': 'Kindlink Management',
        'login.title': 'Admin Portal',
        'login.email_label': 'Admin Email',
        'login.password_label': 'Password',
        'login.remember_me': 'Remember me',
        'login.forgot_password': 'Forgotten admin key?',
        'login.btn_authenticating': 'Authenticating...',
        'login.btn_login': 'Enter Dashboard',
        'login.err_invalid': 'Invalid email or password.',
        'login.err_denied': 'Access denied. You do not have permissions for this portal.',
        'login.err_general': 'An error occurred. Please try again.',

        // Settings Page
        'settings.title': 'System Settings',
        'settings.language': 'Display Language',
        'settings.language.desc': 'Select language for the admin interface',
        'settings.language.vi': 'Vietnamese (Tiếng Việt)',
        'settings.language.en': 'English',
        'settings.save': 'Save Changes',
        'settings.saved': 'Configuration saved!',

        // Categories Page
        'categories.total': 'Total Categories',
        'categories.add': 'Add Category',
        'categories.search': 'Search Categories...',
        'categories.campaigns_count': 'Campaigns',
        'categories.created': 'Created',
        'categories.no_results': 'No categories found',
        'categories.modal.title_add': 'Add Category',
        'categories.modal.title_edit': 'Edit Category',
        'categories.modal.name_label': 'Category Name',
        'categories.modal.name_placeholder': 'e.g. Healthcare, Education...',
        'categories.modal.cancel': 'Cancel',
        'categories.modal.save': 'Save',
        'categories.modal.saving': 'Saving...',
        'categories.modal_delete.title': 'Delete Category?',
        'categories.modal_delete.message': 'Are you sure you want to delete this category?',
        'categories.modal_delete.cancel': 'Cancel',
        'categories.modal_delete.confirm': 'Delete',
        'categories.modal_delete.deleting': 'Deleting...',

        'admin.portal': 'Admin Portal'
    }
};

const AdminLanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function AdminLanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('vi');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('adminLanguage') as Language;
        if (saved && (saved === 'vi' || saved === 'en')) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('adminLanguage', lang);
    };

    const translate = (key: string): string => {
        return translations[language]?.[key] || key;
    };

    if (!mounted) {
        return null; // Tránh hydration mismatch
    }

    return (
        <AdminLanguageContext.Provider value={{ language, setLanguage, translate }}>
            {children}
        </AdminLanguageContext.Provider>
    );
}

export function useAdminLanguage() {
    const context = useContext(AdminLanguageContext);
    if (context === undefined) {
        return {
            language: 'en' as Language,
            setLanguage: () => { },
            translate: (key: string) => translations['en']?.[key] || key
        };
    }
    return context;
}
