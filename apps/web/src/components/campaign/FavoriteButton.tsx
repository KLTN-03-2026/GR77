'use client';

import { useState, useCallback } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

interface FavoriteButtonProps {
    campaignId: string;
    initialFavorited?: boolean;
    /** Optional callback after toggle succeeds */
    onToggle?: (campaignId: string, favorited: boolean) => void;
    className?: string; // Add className prop
    hideIcon?: boolean;
}

/**
 * FavoriteButton – Save / Saved toggle
 */
export default function FavoriteButton({
    campaignId,
    initialFavorited = false,
    onToggle,
    className = '',
    hideIcon = false,
}: FavoriteButtonProps) {
    const [favorited, setFavorited] = useState(initialFavorited);
    const [loading, setLoading] = useState(false);

    const toggle = useCallback(
        async (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Vui lòng đăng nhập để lưu chiến dịch!');
                return;
            }

            if (loading) return;
            setLoading(true);

            const prev = favorited;
            setFavorited(!prev);

            try {
                if (prev) {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites/${campaignId}`,
                        {
                            method: 'DELETE',
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                    if (!res.ok) throw new Error('Failed to unfavorite');
                } else {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/favorites`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ campaignId }),
                    });

                    if (!res.ok) {
                        setFavorited(prev);
                        setLoading(false);
                        return;
                    }
                }
                onToggle?.(campaignId, !prev);
            } catch (err) {
                console.error('Favorite toggle error:', err);
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
                ${className}
                inline-flex items-center justify-center
                rounded-full font-bold
                border-2 border-pink-400
                select-none active:scale-95
                ${loading ? 'opacity-60 cursor-wait' : 'cursor-pointer'}
                ${favorited
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'bg-white text-pink-500 hover:bg-pink-50'
                }
            `}
        >
            {!hideIcon && (
                favorited ? (
                    <HeartIcon className="w-4 h-4 mr-1.5" />
                ) : (
                    <HeartOutline className="w-4 h-4 mr-1.5" />
                )
            )}
            {favorited ? 'Saved' : 'Save'}
        </button>
    );
}

