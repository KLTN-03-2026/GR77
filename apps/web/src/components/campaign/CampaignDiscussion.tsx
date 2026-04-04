"use client";

import React from "react";
import { MessageSquare, Send, Trash2, AlertCircle, XCircle } from "lucide-react";

interface CampaignDiscussionProps {
    comments: any[];
    campaign: any;
    currentUser: any;
    newComment: string;
    setNewComment: (val: string) => void;
    replyingTo: any;
    setReplyingTo: (val: any) => void;
    isCommenting: boolean;
    handleSubmitComment: () => void;
    handleDeleteComment: (id: string) => void;
    setReportingCommentId: (id: string) => void;
    setReportModalOpen: (open: boolean) => void;
    getAvatar: (user: any) => string;
    formatDate: (date?: string) => string;
}

export function CampaignDiscussion({
    comments,
    campaign,
    currentUser,
    newComment,
    setNewComment,
    replyingTo,
    setReplyingTo,
    isCommenting,
    handleSubmitComment,
    handleDeleteComment,
    setReportingCommentId,
    setReportModalOpen,
    getAvatar,
    formatDate
}: CampaignDiscussionProps) {
    return (
        <section className="pb-20 text-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-bold">Community Discussion</h3>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{comments.length} bình luận</span>
            </div>

            {/* Scrollable comment box */}
            <div className="border border-gray-200 rounded-3xl bg-white shadow-sm overflow-hidden flex flex-col">

                {/* Comment list — scrollable */}
                <div className="overflow-y-auto max-h-[520px] p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                            <MessageSquare className="w-12 h-12 opacity-20" />
                            <p className="font-medium italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4 group">
                                <img
                                    src={getAvatar(comment.user)}
                                    className="w-10 h-10 rounded-full shrink-0 border border-gray-100 object-cover"
                                    alt=""
                                />
                                <div className="flex-1 min-w-0">
                                    {/* Bubble */}
                                    <div className="bg-gray-50 rounded-2xl rounded-tl-none px-5 py-4">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-bold text-gray-900 text-sm">
                                                    {comment.user.profile?.firstName
                                                        ? `${comment.user.profile.firstName} ${comment.user.profile.lastName || ''}`
                                                        : comment.user.username}
                                                </span>
                                                {comment.userId === campaign.creatorUserId && (
                                                    <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Creator</span>
                                                )}
                                                <span className="text-[11px] text-gray-400">{formatDate(comment.createdAt)}</span>
                                            </div>
                                            {/* Actions */}
                                            <div className="flex gap-1.5 shrink-0">
                                                {currentUser?.id === comment.userId && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                        title="Xóa bình luận"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {currentUser?.id !== comment.userId && (
                                                    <button
                                                        onClick={() => { setReportingCommentId(comment.id); setReportModalOpen(true); }}
                                                        className="p-1 rounded-lg text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                                                        title="Báo cáo"
                                                    >
                                                        <AlertCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                    </div>

                                    {/* Reply button */}
                                    <button
                                        onClick={() => setReplyingTo(comment)}
                                        className="mt-1.5 ml-2 text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
                                    >
                                        <MessageSquare className="w-3.5 h-3.5" /> Trả lời
                                    </button>

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-100 space-y-4">
                                            {comment.replies.map((reply: any) => (
                                                <div key={reply.id} className="flex gap-3 group/reply">
                                                    <img
                                                        src={getAvatar(reply.user)}
                                                        className="w-8 h-8 rounded-full shrink-0 border border-gray-100 object-cover"
                                                        alt=""
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3">
                                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-bold text-gray-900 text-xs">
                                                                        {reply.user.profile?.firstName
                                                                            ? `${reply.user.profile.firstName} ${reply.user.profile.lastName || ''}`
                                                                            : reply.user.username}
                                                                    </span>
                                                                    {reply.userId === campaign.creatorUserId && (
                                                                        <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-black uppercase">Creator</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-1.5">
                                                                    {currentUser?.id === reply.userId && (
                                                                        <button
                                                                            onClick={() => handleDeleteComment(reply.id)}
                                                                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                                            title="Xóa bình luận"
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                    {currentUser?.id !== reply.userId && (
                                                                        <button
                                                                            onClick={() => { setReportingCommentId(reply.id); setReportModalOpen(true); }}
                                                                            className="p-1 rounded-lg text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                                                                            title="Báo cáo"
                                                                        >
                                                                            <AlertCircle className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-700 text-xs leading-relaxed">{reply.content}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Reply indicator */}
                {replyingTo && (
                    <div className="flex items-center justify-between px-5 py-2 bg-blue-50 text-sm">
                        <span className="text-blue-700 font-medium">
                            Đang trả lời <span className="font-bold">@{replyingTo.user.username}</span>
                        </span>
                        <button onClick={() => setReplyingTo(null)} className="text-blue-400 hover:text-blue-600 font-bold text-xs">Hủy</button>
                    </div>
                )}

                {/* Composer — pinned at bottom of card */}
                <div className="flex items-end gap-3 px-5 py-4">
                    <img
                        src={getAvatar(currentUser)}
                        className="w-9 h-9 rounded-full shrink-0 border border-gray-200 object-cover"
                        alt="Your avatar"
                    />
                    <div className="flex-1 flex items-end gap-2 bg-gray-100 rounded-2xl px-4 py-2">
                        <textarea
                            placeholder={replyingTo ? "Viết câu trả lời..." : "Viết bình luận..."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitComment();
                                }
                            }}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-700 resize-none outline-none leading-relaxed py-1 max-h-28"
                            rows={1}
                            style={{ minHeight: '32px' }}
                        />
                        <button
                            onClick={handleSubmitComment}
                            disabled={isCommenting || !newComment.trim()}
                            className="shrink-0 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
                        >
                            {isCommenting
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Send className="w-4 h-4" />
                            }
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
