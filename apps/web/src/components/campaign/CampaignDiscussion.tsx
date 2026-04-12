"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { CommentItem } from "./discussion/CommentItem";
import { CommentComposer } from "./discussion/CommentComposer";

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
}: CampaignDiscussionProps) {
    const listRef = useRef<HTMLDivElement>(null);

    const handleReport = (id: string) => {
        setReportingCommentId(id);
        setReportModalOpen(true);
    };

    // When new comments arrive, scroll list to top (newest first)
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [comments.length]);

    return (
        <section className="pb-20 text-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <h3 className="text-base sm:text-lg font-bold">Comments</h3>
                </div>
                <span className="text-[10px] sm:text-[12px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {comments.length} bình luận
                </span>
            </div>

            {/* Card */}
            <div className="bg-white overflow-hidden flex flex-col rounded-[20px] sm:rounded-[24px] border border-gray-200 shadow-sm">
                {/* Scrollable comment list */}
                <div
                    ref={listRef}
                    className="overflow-y-auto overflow-x-hidden max-h-[560px] p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
                >
                    {comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                            <MessageSquare className="w-12 h-12 opacity-20" />
                            <p className="font-medium italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                campaign={campaign}
                                currentUser={currentUser}
                                getAvatar={getAvatar}
                                onReply={(target) => {
                                    setReplyingTo(target);
                                    const name = target.user?.profile?.firstName
                                        ? `${target.user.profile.firstName} ${target.user.profile.lastName ?? ""}`.trim()
                                        : target.user?.username;
                                    setNewComment(`@[${name}] `);
                                }}
                                onDelete={handleDeleteComment}
                                onReport={handleReport}
                                composerProps={{
                                    currentUser,
                                    getAvatar,
                                    newComment,
                                    setNewComment,
                                    replyingTo,
                                    setReplyingTo,
                                    isCommenting,
                                    onSubmit: handleSubmitComment
                                }}
                            />
                        ))
                    )}
                </div>

                {/* Composer for new top level comments */}
                {!replyingTo && (
                    <CommentComposer
                        currentUser={currentUser}
                        getAvatar={getAvatar}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        replyingTo={replyingTo}
                        setReplyingTo={setReplyingTo}
                        isCommenting={isCommenting}
                        onSubmit={handleSubmitComment}
                        isInline={false}
                    />
                )}
            </div>
        </section>
    );
}
