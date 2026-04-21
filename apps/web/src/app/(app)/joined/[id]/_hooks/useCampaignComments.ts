"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants/endpoints";

export function useCampaignComments(campaignId: string) {
    const router = useRouter();

    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [isCommenting, setIsCommenting] = useState(false);

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/comments/campaign/${campaignId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) { }
    }, [campaignId]);

    useEffect(() => {
        if (campaignId) fetchComments();
    }, [campaignId, fetchComments]);

    const handleSubmitComment = async () => {
        if (!newComment.trim()) return;
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Please log in to comment");
            router.push("/login");
            return;
        }

        setIsCommenting(true);
        try {
            const res = await fetch(`${API_BASE_URL}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    campaignId,
                    content: newComment,
                    parentId: replyingTo?.id || null,
                }),
            });

            if (res.ok) {
                setNewComment("");
                setReplyingTo(null);
                fetchComments();
            } else {
                const data = await res.json();
                alert(data.message || "Cannot post comment");
            }
        } catch (err) {
            alert("Connection error");
        } finally {
            setIsCommenting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) fetchComments();
        } catch (err) { }
    };

    const handleReportComment = async () => {
        if (!reportReason.trim()) return;
        const token = localStorage.getItem("accessToken");
        try {
            const res = await fetch(`${API_BASE_URL}/comments/${reportingCommentId}/report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: reportReason }),
            });
            if (res.ok) {
                alert("Comment report submitted.");
                setReportModalOpen(false);
                setReportReason("");
            }
        } catch (err) { }
    };

    const getAvatar = (user: any) => {
        return user?.profile?.avatarUrl || null;
    };

    return {
        comments,
        newComment, setNewComment,
        replyingTo, setReplyingTo,
        isCommenting,
        reportModalOpen, setReportModalOpen,
        reportingCommentId, setReportingCommentId,
        reportReason, setReportReason,
        handleSubmitComment,
        handleDeleteComment,
        handleReportComment,
        getAvatar
    };
}
