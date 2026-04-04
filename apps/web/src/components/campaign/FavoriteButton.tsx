'use client';

import { useState, useCallback } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

interface FavoriteButtonProps {
    campaignId: string;
    initialFavorited?: boolean;
    /** Optional callback after toggle succeeds */
    onToggle?: (campaignId: string, favorited: boolean) => void;
}

/**
 * FavoriteButton – Save / Saved toggle
 *
 * UX:
 * - Chưa yêu thích: nền trắng, viền hồng, text "Save" màu hồng
 * - Đã yêu thích:   nền hồng, viền hồng, text "Saved" màu trắng
 *
 * Gọi API:
 * - POST   /favorites           { campaignId }   → yêu thích
 * - DELETE /favorites/:campaignId                → bỏ yêu thích
 */
export default function FavoriteButton({
    campaignId,
    initialFavorited = false,
    onToggle,
}: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const [loading, setLoading] = useState(false);

    const toggle = useCallback(
        async (e: React.MouseEvent) => {
            // Prevent Link navigation when clicking inside a card link
            e.preventDefault();
            e.stopPropagation();

            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Vui lòng đăng nhập để lưu chiến dịch!');
                return;
            }

            if (loading) return;
            setLoading(true);

            // Optimistic update
            const prev = favorited;
            setFavorited(!prev);

            try {
                if (prev) {
                    // Currently favorited → unfavorite
                    const res = await fetch(
                        `http://localhost:3001/favorites/${campaignId}`,
                        {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        console.error('Unfavorite Error:', res.status, errorData);
                        throw new Error('Failed to unfavorite');
                    }
                } else {
                    // Not favorited → favorite
                    const res = await fetch('http://localhost:3001/favorites', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ campaignId }),
                    });

                    if (!res.ok) {
                        const errorData = await res.json().catch(() => ({}));
                        console.error('Favorite Error:', res.status, errorData);
                        if (res.status === 401) {
                            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
                        } else {
                            alert('Đã xảy ra lỗi khi yêu thích chiến dịch. Vui lòng thử lại.');
                        }
                        // Trả lại trạng thái cũ
                        setFavorited(prev);
                        setLoading(false);
                        return;
                    }
                }

                onToggle?.(campaignId, !prev);
            } catch (err) {
                console.error('Favorite toggle exception:', err);
                alert('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
                // Rollback on failure
                setFavorited(prev);
            } finally {
                setLoading(false);
            }
        },
        [campaignId, favorited, loading, onToggle],
    );

    return (
        <button
            onClick={toggle}
            disabled={loading}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            className={`
                inline-flex items-center justify-center gap-2
                px-8 py-3 rounded-full text-sm font-bold
                border-2 border-pink-400
                transition-all duration-200 select-none
                ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}
                ${favorited
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-white text-pink-500 hover:bg-pink-50'
                }
            `}
        >
            {favorited ? (
                <HeartIcon className="w-4 h-4" />
            ) : (
                <HeartOutline className="w-4 h-4" />
            )}
            {favorited ? 'Saved' : 'Save'}
        </button>
    );
}
