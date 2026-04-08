"use client";

import { API_BASE_URL as BASE_URL } from '@/lib/constants/endpoints';

// Interface for API responses
interface ApiResponse<T = any> {
    data?: T;
    message?: string;
    error?: string;
    statusCode?: number;
}

const API_BASE_URL = BASE_URL;

// Queue system for refresh token requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.map((cb) => cb(token));
    refreshSubscribers = [];
};

/**
 * Enhanced fetch client with automatic token attachment and refreshing
 */
export const apiClient = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    // 1. Lấy token hiện tại
    let accessToken = localStorage.getItem("adminAccessToken");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(options.headers as Record<string, string>),
    };

    try {
        const response = await fetch(url, { ...options, headers });

        // 2. Nếu lỗi 401 (Unauthorized), thử refresh token
        if (response.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
            const refreshToken = localStorage.getItem("adminRefreshToken");

            if (!refreshToken) {
                handleLogout();
                throw new Error("UNAUTHORIZED");
            }

            // Xử lý hàng đợi refresh nếu có nhiều request cùng lúc bị 401
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (!refreshRes.ok) {
                        throw new Error("REFRESH_FAILED");
                    }

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshRes.json();

                    localStorage.setItem("adminAccessToken", newAccessToken);
                    localStorage.setItem("adminRefreshToken", newRefreshToken);

                    isRefreshing = false;
                    onTokenRefreshed(newAccessToken);
                } catch (error) {
                    isRefreshing = false;
                    handleLogout();
                    throw error;
                }
            }

            // Đợi token mới và gửi lại request
            return new Promise<T>((resolve) => {
                subscribeTokenRefresh((newToken) => {
                    resolve(apiClient(endpoint, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${newToken}`,
                        }
                    }));
                });
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw { ...errorData, statusCode: response.status };
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

/**
 * Dọn dẹp session khi logout hoặc token hết hạn hoàn toàn
 */
const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/admin/login";
};
