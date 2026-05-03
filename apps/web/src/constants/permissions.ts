export enum AdminPermission {
    // Nhóm Quản lý người dùng
    USERS_VIEW = 'USERS_VIEW',
    USERS_MANAGE = 'USERS_MANAGE',
    EKYC_APPROVE = 'EKYC_APPROVE',

    // Nhóm Quản lý chiến dịch
    CAMPAIGNS_VIEW = 'CAMPAIGNS_VIEW',
    CAMPAIGNS_APPROVE = 'CAMPAIGNS_APPROVE',
    CATEGORIES_MANAGE = 'CATEGORIES_MANAGE',

    // Nhóm Quản lý tài chính
    TRANSACTIONS_VIEW = 'TRANSACTIONS_VIEW',
    WITHDRAWALS_APPROVE = 'WITHDRAWALS_APPROVE',
    REVENUE_VIEW = 'REVENUE_VIEW',

    // Nhóm An toàn & Nội dung
    REPORTS_MANAGE = 'REPORTS_MANAGE',
    COMMENTS_MANAGE = 'COMMENTS_MANAGE',

    // Nhóm Hệ thống (Dành cho Super Admin)
    ADMINS_MANAGE = 'ADMINS_MANAGE',
    SETTINGS_MANAGE = 'SETTINGS_MANAGE',
    BLOCKCHAIN_MANAGE = 'BLOCKCHAIN_MANAGE',
}

export const PermissionGroups = [
    {
        name: 'Quản lý Người dùng & KYC',
        permissions: [
            { key: AdminPermission.USERS_VIEW, label: 'Xem danh sách người dùng' },
            { key: AdminPermission.USERS_MANAGE, label: 'Khóa/Tạo/Quản lý tài khoản' },
            { key: AdminPermission.EKYC_APPROVE, label: 'Phê duyệt định danh (eKYC)' },
        ]
    },
    {
        name: 'Chiến dịch & Danh mục',
        permissions: [
            { key: AdminPermission.CAMPAIGNS_VIEW, label: 'Xem tất cả chiến dịch' },
            { key: AdminPermission.CAMPAIGNS_APPROVE, label: 'Kiểm duyệt chiến dịch' },
            { key: AdminPermission.CATEGORIES_MANAGE, label: 'Quản lý danh mục' },
        ]
    },
    {
        name: 'Tài chính & Thu nhập',
        permissions: [
            { key: AdminPermission.TRANSACTIONS_VIEW, label: 'Xem giao dịch/quyên góp' },
            { key: AdminPermission.WITHDRAWALS_APPROVE, label: 'Duyệt lệnh rút tiền' },
            { key: AdminPermission.REVENUE_VIEW, label: 'Xem báo cáo doanh thu' },
        ]
    },
    {
        name: 'Nội dung & An toàn',
        permissions: [
            { key: AdminPermission.REPORTS_MANAGE, label: 'Xử lý báo cáo vi phạm' },
            { key: AdminPermission.COMMENTS_MANAGE, label: 'Quản lý bình luận' },
        ]
    },
    {
        name: 'Hệ thống (Super Admin)',
        permissions: [
            { key: AdminPermission.ADMINS_MANAGE, label: 'Quản lý Admin & Phân quyền' },
            { key: AdminPermission.SETTINGS_MANAGE, label: 'Cấu hình hệ thống' },
            { key: AdminPermission.BLOCKCHAIN_MANAGE, label: 'Quản lý Blockchain/Ví' },
        ]
    }
];
