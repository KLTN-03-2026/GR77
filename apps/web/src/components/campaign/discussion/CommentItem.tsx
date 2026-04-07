"use client";

import React, { useState } from "react";
import { Trash2, AlertCircle, MessageSquare } from "lucide-react";
import { CommentComposer } from "./CommentComposer";

function getRelativeTime(dateString?: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

    if (diffInSeconds < 60) return `${diffInSeconds} GIÂY TRƯỚC`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} PHÚT TRƯỚC`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} GIỜ TRƯỚC`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} NGÀY TRƯỚC`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} THÁNG TRƯỚC`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} NĂM TRƯỚC`;
}

interface CommentUser {
    id: string;
    username: string;
    profile?: { firstName?: string; lastName?: string; avatarUrl?: string };
}
export interface CommentData {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    user: CommentUser;
    replies?: CommentData[];
}

interface CommentItemProps {
    comment: CommentData;
    campaign: any;
    currentUser: any;
    getAvatar: (user: any) => string;
    onReply: (comment: CommentData) => void;
    onDelete: (id: string) => void;
    onReport: (id: string) => void;
    depth?: number;
    composerProps?: any;
}
export function CommentItem({
    comment,
    campaign,
    currentUser,
    getAvatar,
    onReply,
    onDelete,
    onReport,
    depth = 0,
    composerProps,
}: CommentItemProps) {
    // Hide replies by default for depth >= 1, show by default for depth 0 (root comments)
    const [showReplies, setShowReplies] = useState(depth === 0);

    const displayName = comment.user.profile?.firstName
        ? `${comment.user.profile.firstName} ${comment.user.profile.lastName ?? ""}`.trim()
        : comment.user.username;

    const isCreator = comment.userId === campaign?.creatorUserId;
    const isOwn = currentUser?.id === comment.userId;

    const avatarSize = depth === 0 ? "w-10 h-10" : "w-8 h-8";
    const bubbleText = depth === 0 ? "text-sm" : "text-xs";

    return (
        <div className={`flex gap-3 group ${depth > 0 ? "mt-1" : ""}`}>
            <img
                src={getAvatar(comment.user)}
                className={`${avatarSize} shrink-0 rounded-full border border-gray-200 object-cover mt-0.5`}
                alt={displayName}
            />
            <div className="flex-1 min-w-0">
                {/* Header: Name and Actions */}
                <div className="flex items-center justify-between gap-2 mb-1.5 pl-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold text-gray-900 ${bubbleText}`}>{displayName}</span>
                        {(() => {
                            const match = comment.content.match(/^@\[([^\]]+)\] /);
                            if (match && depth > 0) {
                                return (
                                    <>
                                        <span className="text-gray-400 text-xs">›</span>
                                        <span className="font-bold text-blue-500 text-sm">{match[1]}</span>
                                    </>
                                );
                            }
                            return null;
                        })()}
                        {isCreator && (
                            <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 font-black uppercase tracking-wider ml-1">
                                Creator
                            </span>
                        )}
                    </div>
                    {/* Actions */}
                    <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isOwn ? (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="p-1 text-red-400 hover:bg-red-50 transition-colors"
                                title="Xóa"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button
                                onClick={() => onReport(comment.id)}
                                className="p-1 text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                                title="Báo cáo"
                            >
                                <AlertCircle className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Bubble - Sharp box */}
                <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] inline-block w-full max-w-full">
                    <p className={`text-gray-700 ${bubbleText} leading-relaxed whitespace-pre-wrap`}>
                        {(() => {
                            const match = comment.content.match(/^@\[([^\]]+)\] ([\s\S]*)/);
                            if (match) {
                                return <>{match[2]}</>;
                            }
                            return comment.content;
                        })()}
                    </p>
                </div>

                {/* Reaction bar */}
                <div className="flex items-center gap-4 mt-2 ml-2 flex-wrap">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {getRelativeTime(comment.createdAt)}
                    </span>
                    <button
                        onClick={() => {
                            setShowReplies(true);
                            onReply(comment);
                        }}
                        data-reply-action="true"
                        className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-700 tracking-wider transition-colors"
                    >
                        TRẢ LỜI
                    </button>
                </div>

                {/* Nested replies Toggle (When Collapsed) */}
                {comment.replies && comment.replies.length > 0 && !showReplies && (
                    <button
                        onClick={() => setShowReplies(true)}
                        className="mt-3 ml-2 text-[10px] uppercase font-bold text-blue-500 hover:text-blue-700 tracking-wider transition-colors flex items-center gap-2"
                    >
                        <div className="w-6 h-px bg-blue-200"></div>
                        Xem thêm {comment.replies.length} thảo luận
                    </button>
                )}

                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && showReplies && (
                    <div
                        className={`mt-4 space-y-4 ${depth < 1
                            ? "ml-2 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-gray-100"
                            : ""
                            }`}
                    >
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                campaign={campaign}
                                currentUser={currentUser}
                                getAvatar={getAvatar}
                                onReply={onReply}
                                onDelete={onDelete}
                                onReport={onReport}
                                depth={depth + 1}
                                composerProps={composerProps}
                            />
                        ))}

                        {/* Nested replies Toggle (When Expanded - Place at Bottom) */}
                        <button
                            onClick={() => setShowReplies(false)}
                            className="text-[10px] uppercase font-bold text-blue-500 hover:text-blue-700 tracking-wider transition-colors flex items-center gap-2 pt-2"
                        >
                            <div className="w-6 h-px bg-blue-200"></div>
                            Thu gọn thảo luận
                        </button>
                    </div>
                )}

                {/* Active Inline Composer exactly under this comment if we are replying to it */}
                {composerProps?.replyingTo?.id === comment.id && (
                    <div className={depth >= 2 ? "mt-4" : ""}>
                        <CommentComposer {...composerProps} isInline={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
