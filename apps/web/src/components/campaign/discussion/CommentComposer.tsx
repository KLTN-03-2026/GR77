"use client";

import React, { useRef, useEffect } from "react";
import { Send, XCircle } from "lucide-react";

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

    // Focus textarea when replying
    useEffect(() => {
        if (replyingTo) textareaRef.current?.focus();
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
        <div ref={containerRef} className={`flex items-start gap-3 ${isInline ? 'mt-2 mb-1' : 'px-6 py-5 border-t border-gray-200'}`}>
            <img
                src={getAvatar(currentUser)}
                className={`${isInline ? 'w-6 h-6 mt-1' : 'w-10 h-10'} shrink-0 rounded-full border border-gray-300 object-cover`}
                alt="avatar"
            />
            <div className={`flex-1 flex flex-col bg-gray-50 rounded-full border border-gray-300 ${isInline ? '' : 'pl-2 pr-2 py-2'}`}>
                <div className={`flex items-center gap-2 ${isInline ? 'px-3 py-1.5' : ''}`}>
                    <textarea
                        ref={textareaRef}
                        placeholder={replyingTo ? `Trả lời ${replyName}...` : "Viết bình luận..."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={`flex-1 bg-transparent border-none focus:ring-0 text-gray-700 resize-none outline-none leading-relaxed ${isInline ? 'text-xs py-0.5' : 'text-sm py-1'}`}
                        rows={1}
                        style={{ minHeight: isInline ? "20px" : "32px", maxHeight: "112px" }}
                    />
                    {isInline ? (
                        <button
                            onClick={onSubmit}
                            disabled={isCommenting || !newComment.trim()}
                            className="shrink-0 bg-[#4F8DD1] text-white rounded-full p-1.5 transition-all hover:bg-[#4F8DD1]/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                            title="Gửi (Enter)"
                        >
                            {isCommenting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-3.5 h-3.5 -ml-[1px] mt-[1px]" />
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={onSubmit}
                            disabled={isCommenting || !newComment.trim()}
                            className="shrink-0 bg-[#4F8DD1] text-white rounded-full p-2.5 transition-all hover:bg-[#4F8DD1]/90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
                            title="Gửi (Enter)"
                        >
                            {isCommenting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 -ml-[2px] mt-[1px]" />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
