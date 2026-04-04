'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    TagIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';

interface Category {
    id: string;
    name: string;
    _count?: {
        campaigns: number;
    };
    createdAt: string;
}

const getCategoryColor = (name: string) => {
    const colors = [
        { text: 'text-[#2ba6e1]', bg: 'bg-[#2ba6e1]/10', border: 'border-[#2ba6e1]/20', icon: 'text-[#2ba6e1]' },
        { text: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10', border: 'border-[#4CAF50]/20', icon: 'text-[#4CAF50]' },
        { text: 'text-[#FF9800]', bg: 'bg-[#FF9800]/10', border: 'border-[#FF9800]/20', icon: 'text-[#FF9800]' },
        { text: 'text-[#9C27B0]', bg: 'bg-[#9C27B0]/10', border: 'border-[#9C27B0]/20', icon: 'text-[#9C27B0]' },
        { text: 'text-[#E91E63]', bg: 'bg-[#E91E63]/10', border: 'border-[#E91E63]/20', icon: 'text-[#E91E63]' },
        { text: 'text-[#00BCD4]', bg: 'bg-[#00BCD4]/10', border: 'border-[#00BCD4]/20', icon: 'text-[#00BCD4]' },
    ];
    const index = (name.length + (name.charCodeAt(0) || 0)) % colors.length;
    return colors[index];
};

export default function AdminCategoriesPage() {
    const { translate } = useAdminLanguage();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3001/categories');
            if (!res.ok) throw new Error('Failed to fetch categories');
            const data = await res.json();
            setCategories(data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter((cat) =>
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const handleOpenAddModal = () => {
        setCurrentCategory(null);
        setFormData({ name: '' });
        setError('');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: Category) => {
        setCurrentCategory(category);
        setFormData({ name: category.name });
        setError('');
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (category: Category) => {
        setCurrentCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const token = localStorage.getItem('adminAccessToken');
        const url = currentCategory
            ? `http://localhost:3001/categories/${currentCategory.id}`
            : 'http://localhost:3001/categories';
        const method = currentCategory ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 409) {
                    setAlertMessage(translate('Category already exists!'));
                    setIsAlertOpen(true);
                    return;
                }
                throw new Error(data.message || 'Something went wrong');
            }

            setIsModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleDelete = async () => {
        if (!currentCategory) return;
        setIsSubmitting(true);

        const token = localStorage.getItem('adminAccessToken');
        try {
            const res = await fetch(`http://localhost:3001/categories/${currentCategory.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const data = await res.json();
                if (res.status === 409) {
                    throw new Error(translate('Cannot delete category with existing campaigns.'));
                }
                throw new Error(data.message || 'Failed to delete category');
            }

            setIsDeleteModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            setAlertMessage(err.message);
            setIsAlertOpen(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Theme Banner */}
            <div className="flex items-center gap-3 p-3 rounded-2xl border text-sm font-bold bg-[#7598C1]/10 border-[#7598C1]/20 text-[#24305E]">
                <TagIcon className="w-5 h-5 shrink-0" />
                Quản lý các danh mục chiến dịch để đồng bộ hiển thị và lọc tìm kiếm trên toàn hệ thống Kindlink.
            </div>

            {/* Header & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#7598C1] rounded-3xl px-6 py-6 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors text-black flex items-center justify-center">
                        <TagIcon className="w-9 h-9" />
                    </div>
                    <div className="text-black">
                        <p className="text-lg font-bold tracking-wide uppercase">{translate('categories.total')}</p>
                        <h2 className="text-4xl font-black mt-1 tabular-nums">{categories.length}</h2>
                    </div>
                </div>

                <div className="flex items-center justify-end">
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-[#7598C1] hover:bg-[#5DA2D5] text-black px-6 py-3 rounded-md text-sm font-black uppercase tracking-widest shadow-sm flex items-center gap-2 transition-all active:scale-95"
                    >
                        <PlusIcon className="w-5 h-5 stroke-[3]" />
                        {translate('categories.add')}
                    </button>
                </div>
            </div>

            {/* Control Bar */}
            <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2ba6e1]" strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder={translate('Search Categories...')}
                            className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-72 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-900 placeholder:text-gray-400 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid of Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white h-40 rounded-2xl border border-gray-200 animate-pulse" />
                    ))
                ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                        const style = getCategoryColor(cat.name);
                        return (
                            <div
                                key={cat.id}
                                className={`bg-white rounded-2xl border-t-4 ${style.border} border-x border-b border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col items-center text-center space-y-4 hover:-translate-y-1`}
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5 z-10">
                                    <button
                                        onClick={() => handleOpenEditModal(cat)}
                                        className="p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-gray-100 hover:bg-blue-50 transition-all hover:scale-105"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleOpenDeleteModal(cat)}
                                        className="p-2 bg-white text-red-600 rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 transition-all hover:scale-105"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center ${style.icon} transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-inner`}>
                                    <TagIcon className="w-8 h-8" />
                                </div>

                                <div className="space-y-1">
                                    <h4 className="font-black text-gray-900 group-hover:text-black transition-colors uppercase tracking-tight text-base leading-tight">
                                        {cat.name}
                                    </h4>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${style.icon.replace('text', 'bg')} opacity-50`} />
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {cat._count?.campaigns || 0} {translate('categories.campaigns_count')}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                    {translate('categories.created')} {new Date(cat.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
                        <TagIcon className="w-16 h-16 opacity-10 mb-4" />
                        <p className="font-bold">{translate('categories.no_results')}</p>
                    </div>
                )}
            </div>

            {/* Modal Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200">
                        <h2 className="text-xl font-black text-gray-900 mb-6 border-l-4 border-[#7598C1] pl-3 uppercase tracking-tight">
                            {currentCategory ? translate('categories.modal.title_edit') : translate('categories.modal.title_add')}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                    {translate('categories.modal.name_label')}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-[#7598C1] focus:bg-white transition-all"
                                    placeholder={translate('categories.modal.name_placeholder')}
                                />
                            </div>

                            {error && <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
                                >
                                    {translate('categories.modal.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-lg font-black uppercase text-[10px] tracking-widest shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? translate('categories.modal.saving') : translate('categories.modal.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Delete Confirmation */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <TrashIcon className="w-8 h-8" />
                        </div>

                        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                            {translate('categories.modal_delete.title')}
                        </h2>

                        <p className="text-sm font-bold text-gray-500 mb-8 leading-relaxed">
                            {translate('categories.modal_delete.message')}
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                disabled={isSubmitting}
                                onClick={handleDelete}
                                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? translate('categories.modal_delete.deleting') : translate('categories.modal_delete.confirm')}
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
                            >
                                {translate('categories.modal_delete.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal Alert (Conflict/Error) */}
            {isAlertOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 text-center">
                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ExclamationTriangleIcon className="w-8 h-8" />
                        </div>

                        <h2 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight">
                            Thông báo
                        </h2>

                        <p className="text-sm font-bold text-gray-500 mb-8 leading-relaxed">
                            {alertMessage}
                        </p>

                        <button
                            onClick={() => setIsAlertOpen(false)}
                            className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                        >
                            Đã hiểu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
