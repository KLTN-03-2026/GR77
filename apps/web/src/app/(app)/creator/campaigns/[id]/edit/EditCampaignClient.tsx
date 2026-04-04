'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, ArrowPathIcon, PhotoIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface CategoryOption {
    id: string;
    name: string;
    icon?: string;
}

export default function EditCampaignClient({ id }: { id: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [campaign, setCampaign] = useState<any>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    useEffect(() => {
        if (campaign?.coverImageUrl) {
            setImagePreview(campaign.coverImageUrl);
        }
    }, [campaign]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    router.push('/login');
                    return;
                }

                // Fetch campaign and categories in parallel
                const [campaignRes, categoriesRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/categories`),
                ]);

                if (!campaignRes.ok) {
                    if (campaignRes.status === 401) {
                        localStorage.removeItem('accessToken');
                        router.push('/login');
                        return;
                    }
                    throw new Error('Failed to fetch campaign details');
                }

                const campaignData = await campaignRes.json();
                setCampaign(campaignData);

                if (categoriesRes.ok) {
                    const catsData = await categoriesRes.json();
                    setCategories(catsData);
                    // Pre-select the current category
                    if (campaignData.categoryId) {
                        setSelectedCategoryId(campaignData.categoryId);
                    } else if (campaignData.category) {
                        const match = catsData.find((c: CategoryOption) => c.name.toLowerCase() === campaignData.category.toLowerCase());
                        if (match) setSelectedCategoryId(match.id);
                    }
                }
            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message || 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');

        const formData = new FormData(e.currentTarget);

        const token = localStorage.getItem('accessToken');
        let coverImageUrl = campaign?.coverImageUrl || '';

        // 1. Upload new image if exists
        if (imageFile) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload image');
                }

                const uploadData = await uploadResponse.json();
                coverImageUrl = uploadData.url;
            } catch (err: any) {
                setError('Failed to upload image: ' + err.message);
                setIsSaving(false);
                return;
            }
        } else if (!imagePreview) {
            // Image was removed
            coverImageUrl = '';
        }

        // Validation basic
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        if (!title || !description) {
            setError('Title and Description are required');
            setIsSaving(false);
            return;
        }

        const selectedCat = categories.find((c) => c.id === selectedCategoryId);

        const data = {
            title,
            description,
            category: selectedCat?.name || formData.get('category') as string,
            categoryId: selectedCategoryId || undefined,
            locationText: formData.get('locationText') as string,
            coverImageUrl: coverImageUrl,
            fundingGoalAmount: Number(formData.get('fundingGoalAmount')),
            minimumDonationAmount: Number(formData.get('minimumDonationAmount')),
            startAt: new Date(formData.get('startAt') as string).toISOString(),
            endAt: new Date(formData.get('endAt') as string).toISOString(),
            autoCloseWhenGoalReached: formData.get('autoCloseWhenGoalReached') === 'on',
        };

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                router.push('/login');
                return;
            }

            console.log('Sending update request to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}`);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/campaigns/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('accessToken');
                    router.push('/login');
                    return;
                }
                const errData = await response.json().catch(() => ({}));
                console.error('Update failed:', response.status, errData);
                throw new Error(errData.message || `Error ${response.status}: Failed to update campaign`);
            }

            // Success
            router.push('/creator/campaigns');
            router.refresh(); // Refresh to show new data
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <ArrowPathIcon className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-gray-500 font-medium tracking-wide">Loading campaign data...</p>
            </div>
        );
    }

    if (!campaign && !isLoading) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold">
                    Campaign not found or an error occurred.
                </div>
                <Link href="/creator/campaigns" className="text-blue-500 font-bold hover:underline">
                    Back to My Campaigns
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full pb-20">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <PencilSquareIcon className="w-7 h-7 text-cyan-500" />
                    Edit Campaign
                </h1>
                <p className="text-sm text-gray-400 mt-1 ml-9">Update your campaign details below.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-center gap-3 shadow-sm anim-up-0">
                        <div className="h-2 w-2 rounded-full bg-red-500 shrink-0"></div>
                        <p>{error}</p>
                    </div>
                )}

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Campaign Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Campaign Title
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded-md leading-none font-black uppercase tracking-tighter">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <input
                                type="text"
                                name="title"
                                defaultValue={campaign.title}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-3">
                            Description
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded-md leading-none font-black uppercase tracking-tighter">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <textarea
                                name="description"
                                rows={6}
                                defaultValue={campaign.description}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none shadow-sm"
                            ></textarea>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2">
                            Cover Image
                        </label>
                        <div className="sm:w-3/4">
                            <div className="flex flex-col gap-4">
                                {imagePreview ? (
                                    <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                                        >
                                            <XMarkIcon className="h-5 w-5 stroke-[3]" />
                                        </button>
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full max-w-md aspect-video bg-[#f4f4f4] hover:bg-[#efefef] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all text-gray-400 hover:text-blue-500 hover:border-blue-200 group"
                                    >
                                        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all">
                                            <PhotoIcon className="h-7 w-7 text-blue-500" />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[13px] font-bold text-gray-700">Change cover image</span>
                                            <span className="text-[11px] font-medium opacity-60">Optimized for 16:9 ratio</span>
                                        </div>
                                    </button>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category & Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-gray-900">Category</label>
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                            >
                                <option value="">Choose</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                                Location
                                <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded-md leading-none font-black uppercase tracking-tighter">required</span>
                            </label>
                            <input
                                type="text"
                                name="locationText"
                                defaultValue={campaign.locationText}
                                required
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Funding Goal & Min Donation Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                                Funding Goal Amount
                                <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded-md leading-none font-black uppercase tracking-tighter">required</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="fundingGoalAmount"
                                    defaultValue={campaign.fundingGoalAmount}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-14 py-3 text-sm text-[#000000] font-bold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">VND</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-bold text-gray-900 flex items-center gap-2">
                                Minimum Donation
                                <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded-md leading-none font-black uppercase tracking-tighter">required</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="minimumDonationAmount"
                                    defaultValue={campaign.minimumDonationAmount}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-5 pr-14 py-3 text-sm text-[#000000] font-bold focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">VND</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <label className="text-[14px] font-black text-gray-900 uppercase tracking-widest mb-4 block">Campaign Timeline</label>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Start Date</span>
                                <input
                                    type="date"
                                    name="startAt"
                                    defaultValue={campaign.startAt ? new Date(campaign.startAt).toISOString().split('T')[0] : ''}
                                    required
                                    className="w-full sm:w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="hidden sm:block h-0.5 w-4 bg-gray-300 rounded-full mt-5"></div>
                            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                                <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">End Date</span>
                                <input
                                    type="date"
                                    name="endAt"
                                    defaultValue={campaign.endAt ? new Date(campaign.endAt).toISOString().split('T')[0] : ''}
                                    required
                                    className="w-full sm:w-44 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
                                />
                            </div>

                            <label className="flex items-center gap-3 ml-auto bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors mt-4 sm:mt-0">
                                <input
                                    type="checkbox"
                                    name="autoCloseWhenGoalReached"
                                    defaultChecked={campaign.autoCloseWhenGoalReached}
                                    className="w-5 h-5 rounded-md text-blue-500 border-gray-300 focus:ring-blue-400 focus:ring-offset-0 transition-all"
                                />
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-gray-900">Auto-close Goal</span>
                                    <span className="text-[10px] text-gray-400 font-medium">Stop when target reached</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full sm:w-auto px-12 py-3.5 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-70 disabled:grayscale text-white font-black text-sm px-20 py-4 rounded-xl shadow-[0_10px_25px_-5px_rgba(59,130,246,0.4)] transition-all uppercase tracking-wider flex items-center justify-center gap-3 active:scale-[0.98] shadow-blue-200"
                        >
                            {isSaving ? (
                                <>
                                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                                    Updating...
                                </>
                            ) : 'Update Campaign'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
