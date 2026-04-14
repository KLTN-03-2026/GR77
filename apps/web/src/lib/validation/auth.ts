/**
 * Auth Validation for Kindlink Web
 */

export interface ValidationErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export const AUTH_ERRORS_MAP: Record<string, string> = {
    'AUTH_001': 'Email không hợp lệ. Ví dụ: name@gmail.com',
    'AUTH_002': 'Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.',
    'AUTH_003': 'Vui lòng không để trống trường này.',
    'AUTH_101': 'Email này đã được sử dụng. Vui lòng chọn email khác.',
    'AUTH_102': 'Email hoặc mật khẩu không chính xác.',
    'AUTH_106': 'Email này đã đăng ký bình thường. Hãy dùng mật khẩu để đăng nhập.',
    'AUTH_105': 'Tài khoản này dùng Google. Hãy nhấn "Continue with Google".',
};

export const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Vui lòng nhập email.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Email không đúng định dạng.';
    return undefined;
};

export const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Vui lòng nhập mật khẩu.';
    if (password.length < 8) return 'Mật khẩu phải từ 8 ký tự trở lên.';
    const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!strengthRegex.test(password)) return 'Mật khẩu cần có chữ hoa, chữ thường và số.';
    return undefined;
};
