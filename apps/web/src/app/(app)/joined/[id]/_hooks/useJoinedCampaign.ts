"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants/endpoints";

export function useJoinedCampaign(campaignId: string) {
    const router = useRouter();

    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    const [isLiked, setIsLiked] = useState(false);
    const [isJoined, setIsJoined] = useState(true); // Should be true since this is the joined page

    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const fetchCampaign = async () => {
            setIsLoading(true);
            setFetchError("");
            try {
                const token = localStorage.getItem('accessToken');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`, { headers });
                if (!res.ok) throw new Error("Campaign not found");
                const data = await res.json();
                setCampaign(data);
            } catch (err: any) {
                setFetchError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        if (campaignId) fetchCampaign();
    }, [campaignId]);

    // Track View History
    useEffect(() => {
        if (!campaign) return;
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`${API_BASE_URL}/view-histories/${campaignId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }).catch(() => { });
    }, [campaign, campaignId]);

    // Fetch initial join/favorite status
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token && campaignId) {
            fetch(`${API_BASE_URL}/participants/${campaignId}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.joined) setIsJoined(true);
                })
                .catch(() => { });

            fetch(`${API_BASE_URL}/favorites/${campaignId}/status`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.favorited) setIsLiked(true);
                })
                .catch(() => { });
        }
    }, [campaignId]);

    const handleToggleLike = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Please log in to perform this action");
            router.push("/login");
            return;
        }

        try {
            const method = isLiked ? "DELETE" : "POST";
            const url = isLiked ? `${API_BASE_URL}/favorites/${campaignId}` : `${API_BASE_URL}/favorites`;
            const body = isLiked ? undefined : JSON.stringify({ campaignId });

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body,
            });

            if (res.ok) {
                setIsLiked(!isLiked);
            }
        } catch (err) { }
    };

    const handleLeave = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setIsLeaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/participants/${campaignId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();

            if (res.ok) {
                alert("Left the campaign successfully!");
                router.push('/joined');
            } else {
                alert(data.message || "Error leaving the campaign");
            }
        } catch (err) {
            alert("Connection error");
        } finally {
            setIsLeaving(false);
            setShowLeaveModal(false);
        }
    };

    return {
        campaign,
        isLoading,
        fetchError,
        isLiked,
        isJoined,
        showLeaveModal, setShowLeaveModal,
        isLeaving,
        handleToggleLike,
        handleLeave
    };
}
