"use client";

import React, { useState } from "react";
import { Trash2, AlertCircle, MessageSquare } from "lucide-react";
import { UserIcon } from "@heroicons/react/24/outline";
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

    const avatarSize = depth === 0 ? "w-9 h-9" : "w-7 h-7";
    const bubbleText = depth === 0 ? "text-[13.5px]" : "text-[12.5px]";

    return (
        <div className={`flex gap-2 group ${depth > 0 ? "mt-2" : ""}`}>
            {getAvatar(comment.user) && !getAvatar(comment.user).includes('dicebear') ? (
                <img
                    src={getAvatar(comment.user)}
                    className={`${avatarSize} shrink-0 rounded-full object-cover mt-0.5 bg-white`}
                    alt={displayName}
                />
            ) : (
                <div className={`${avatarSize} shrink-0 rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center mt-0.5`}>
                    <UserIcon className="w-1/2 h-1/2 text-cyan-300" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                {/* Bubble - Facebook style row with Actions */}
                <div className="flex items-center gap-2 group/bubble max-w-full">
                    <div className="bg-[#f0f2f5] px-3 py-2 rounded-[18px] inline-block max-w-[calc(100%-32px)]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-gray-900 text-[13px]">{displayName}</span>
                            {isCreator && (
                                <span className="text-[8px] bg-blue-500 text-white px-1.5 py-0 rounded-[4px] font-black uppercase tracking-tight">
                                    Creator
                                </span>
                            )}
                        </div>
                        <p className={`text-gray-800 ${bubbleText} leading-snug whitespace-pre-wrap break-words`}>
                            {(() => {
                                // Match @[Name] or @Name and make it bold
                                const tagRegex = /^(@\[[^\]]+\]|@[^\s]+)/;
                                const match = comment.content.match(tagRegex);
                                if (match) {
                                    const fullTag = match[1];
                                    const rest = comment.content.slice(fullTag.length);
                                    // Strip @ and []
                                    const cleanName = fullTag.replace(/^@\[?|\]$/g, '');
                                    return (
                                        <>
                                            <b className="text-[#1877f2] mr-1">{cleanName}</b>
                                            {rest}
                                        </>
                                    );
                                }
                                return comment.content;
                            })()}
                        </p>
                    </div>

                    {/* Quick Reactions/Actions - In-flow for stable layout */}
                    <div className="flex gap-1 opacity-50 sm:opacity-0 group-hover/bubble:opacity-100 transition-opacity shrink-0">
                        {isOwn ? (
                            <button onClick={() => onDelete(comment.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button onClick={() => onReport(comment.id)} className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                                <AlertCircle className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Sub-bar: Time & Reply button */}
                <div className="flex flex-wrap items-center gap-3 mt-1 ml-3">
                    <span className="text-[11px] font-medium text-gray-500 uppercase whitespace-nowrap">
                        {getRelativeTime(comment.createdAt).replace(" TRƯỚC", "")}
                    </span>
                    <button
                        onClick={() => {
                            setShowReplies(true);
                            onReply(comment);
                        }}
                        className="text-[11px] font-bold text-gray-600 hover:underline tracking-tight transition-colors whitespace-nowrap"
                    >
                        Trả lời
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
