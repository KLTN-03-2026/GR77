import React from 'react';
import { UserIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
    campaign: any;
    updateTitle: string;
    setUpdateTitle: (v: string) => void;
    updateContent: string;
    setUpdateContent: (v: string) => void;
    isPostingUpdate: boolean;
    handlePostUpdate: () => void;
    creatorAvatar: string | null;
}

export function CreatorCampaignNews({
    campaign,
    updateTitle,
    setUpdateTitle,
    updateContent,
    setUpdateContent,
    isPostingUpdate,
    handlePostUpdate,
    creatorAvatar
}: Props) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [selectedNews, setSelectedNews] = React.useState<any>(null);
    const ITEMS_PER_PAGE = 4;

    const newsList = campaign?.news || [];
    const totalPages = Math.ceil(newsList.length / ITEMS_PER_PAGE);
    const paginatedNews = newsList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="bg-white rounded-xl shadow-sm border-1 border-gray-300 h-[700px] flex flex-col overflow-hidden relative">
            <div className="pt-4 px-4 pb-3 sm:pt-6 sm:px-6 sm:pb-4 flex-shrink-0 bg-white z-10 border-b border-gray-50">
                <div className="mb-3">
                    <h2 className="text-lg font-black text-gray-900 italic mb-1">Post News</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Notify your supporters
                    </p>
                </div>

                <div className="space-y-3">
                    <div className="flex gap-3">
                        {creatorAvatar ? (
                            <img src={creatorAvatar} alt="Your Avatar" className="h-10 w-10 rounded-full object-cover shadow-sm bg-white" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-[#0891B2]/10 flex items-center justify-center border border-[#0891B2]/20 shadow-sm">
                                <UserIcon className="w-5 h-5 text-[#0891B2]/50" />
                            </div>
                        )}
                        <input
                            type="text"
                            value={updateTitle}
                            onChange={(e) => setUpdateTitle(e.target.value)}
                            placeholder="News Title..."
                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-4 text-xs focus:bg-white focus:ring-2 focus:ring-[#0891B2]/10 focus:border-[#0891B2] outline-none transition-all placeholder-gray-400 font-bold"
                        />
                    </div>
                    <textarea
                        value={updateContent}
                        onChange={(e) => setUpdateContent(e.target.value)}
                        placeholder="write your news here..."
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs focus:bg-white focus:ring-2 focus:ring-[#0891B2]/10 focus:border-[#0891B2] outline-none transition-all placeholder-gray-400 font-medium resize-none mb-3"
                    ></textarea>
                    <div className="flex justify-end">
                        <button
                            onClick={handlePostUpdate}
                            disabled={isPostingUpdate || !updateTitle.trim() || !updateContent.trim()}
                            className="bg-white border-2 border-[#0891B2] text-[#0891B2] hover:bg-[#0891B2] hover:text-white px-8 py-2.5 rounded-full text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isPostingUpdate ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                'Post Update'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Render News History List */}
            <div className="px-4 sm:px-6 py-2 bg-[#0891B2]/10 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-black text-gray-900 italic">News History</h3>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pb-2 custom-scrollbar">
                    {paginatedNews.length > 0 ? (
                        <div className="flex flex-col">
                            {paginatedNews.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="py-3 px-4 sm:px-6 border-b border-gray-100 last:border-b-0 cursor-pointer group hover:bg-gray-100 transition-all"
                                    onClick={() => setSelectedNews(item)}
                                >
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0891B2] transition-colors truncate flex-1 pr-4">{item.title}</h4>
                                        <p className="text-[10px] uppercase font-bold text-gray-600 group-hover:text-[#0891B2] tracking-widest ml-4 flex-shrink-0">
                                            {new Date(item.createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-snug whitespace-pre-wrap line-clamp-2 min-h-[34px]">{item.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic text-center py-10 px-4">No news updates posted yet.</p>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-white">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold transition-colors ${currentPage === 1
                                ? "text-gray-500"
                                : "text-[#0891B2] hover:text-[#0891B2]/80 cursor-pointer"
                                }`}
                        >
                            <ChevronLeftIcon className="w-3 h-3" />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === page
                                        ? "bg-[#0891B2] text-white shadow-sm shadow-[#0891B2]/20"
                                        : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold transition-colors ${currentPage === totalPages
                                ? "text-gray-500"
                                : "text-[#0891B2] hover:text-[#0891B2]/80 cursor-pointer"
                                }`}
                        >
                            Next
                            <ChevronRightIcon className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>

            {selectedNews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[500px]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-start bg-[#0891B2]/10 flex-shrink-0">
                            <div className="pr-4">
                                <p className="text-[12px] uppercase font-bold text-[#0891B2] tracking-widest mb-0.5">
                                    {new Date(selectedNews.createdAt).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </p>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{selectedNews.title}</h3>
                            </div>
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-200 p-2 rounded-full transition-colors flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                            <p className="text-sm text-gray-800 text-justify leading-relaxed whitespace-pre-wrap">
                                {selectedNews.content}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
