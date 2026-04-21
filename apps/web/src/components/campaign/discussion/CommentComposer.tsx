"use client";

import React, { useRef, useEffect } from "react";
import { Send, XCircle } from "lucide-react";
import { UserIcon } from "@heroicons/react/24/outline";

interface CommentComposerProps {
    currentUser: any;
    getAvatar: (user: any) => string;
    newComment: string;
    setNewComment: (v: string) => void;
    replyingTo: any;
    setReplyingTo: (v: any) => void;
    isCommenting: boolean;
    onSubmit: () => void;
    isInline?: boolean;
}

export function CommentComposer({
    currentUser,
    getAvatar,
    newComment,
    setNewComment,
    replyingTo,
    setReplyingTo,
    isCommenting,
    onSubmit,
    isInline = false,
}: CommentComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cancel reply if clicked outside of this inline composer
    useEffect(() => {
        if (!isInline) return;

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (containerRef.current && !containerRef.current.contains(target)) {
                // If it's another reply button, let it handle the action
                if (target.closest('[data-reply-action="true"]')) return;

                // Otherwise close the inline composer
                setReplyingTo(null);
            }
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [isInline, setReplyingTo]);

    // Auto-resize
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 112) + "px";
    }, [newComment]);

    // Focus textarea and move cursor to end when replying
    useEffect(() => {
        if (replyingTo && textareaRef.current) {
            const el = textareaRef.current;
            el.focus();
            // Move cursor to end
            const len = el.value.length;
            el.setSelectionRange(len, len);
        }
    }, [replyingTo]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isCommenting && newComment.trim()) onSubmit();
        }
    };

    const replyName = replyingTo?.user?.profile?.firstName
        ? `${replyingTo.user.profile.firstName} ${replyingTo.user.profile.lastName || ""}`.trim()
        : replyingTo?.user?.username;

    return (
        <div ref={containerRef} className={`flex items-start gap-2.5 ${isInline ? 'mt-2 mb-1' : 'px-4 py-4 sm:px-6 sm:py-5 border-t border-gray-100 bg-white'}`}>
            {getAvatar(currentUser) && !getAvatar(currentUser).includes('dicebear') ? (
                <img
                    src={getAvatar(currentUser)}
                    className={`${isInline ? 'w-6 h-6 mt-0.5' : 'w-8 h-8 sm:w-9 sm:h-9'} shrink-0 rounded-full object-cover bg-white`}
                    alt="avatar"
                />
            ) : (
                <div className={`${isInline ? 'w-6 h-6 mt-0.5' : 'w-8 h-8 sm:w-9 sm:h-9'} shrink-0 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center`}>
                    <UserIcon className="w-1/2 h-1/2 text-cyan-300" />
                </div>
            )}
            <div className={`flex-1 flex items-center bg-[#f0f2f5] rounded-[18px] px-3 py-1.5 min-w-0`}>
                <textarea
                    ref={textareaRef}
                    placeholder={replyingTo ? `Trả lời ${replyName}...` : "Viết bình luận..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500 resize-none outline-none leading-snug ${isInline ? 'text-[12px] py-0.5' : 'text-[13.5px] py-1'}`}
                    rows={1}
                    style={{ minHeight: isInline ? "18px" : "24px", maxHeight: "112px" }}
                />
                <button
                    onClick={onSubmit}
                    disabled={isCommenting || !newComment.trim()}
                    className={`shrink-0 ml-1.5 p-1.5 text-[#1877f2] hover:bg-gray-200 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 flex items-center justify-center`}
                    title="Gửi (Enter)"
                >
                    {isCommenting ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1877f2] rounded-full animate-spin" />
                    ) : (
                        <Send className={`${isInline ? 'w-4 h-4' : 'w-5 h-5'}`} fill="currentColor" />
                    )}
                </button>
            </div>
        </div>
    );
}
