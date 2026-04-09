'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CategoryOption {
    id: string;
    name: string;
    icon?: string;
}

export default function NewCampaignPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [locationText, setLocationText] = useState('');
    const [fundingGoal, setFundingGoal] = useState('');
    const [minDonation, setMinDonation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/categories`)
            .then((res) => res.json())
            .then((data) => setCategories(data))
            .catch((err) => console.error('Failed to load categories:', err));
    }, []);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCategoryId(e.target.value);
    };

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

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + galleryFiles.length > 5) {
            setError('Maximum 5 gallery images allowed');
            return;
        }

        const newFiles = [...galleryFiles];
        const newPreviews = [...galleryPreviews];

        files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) return;
            newFiles.push(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                setGalleryPreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
        setGalleryFiles(newFiles);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeGalleryImage = (index: number) => {
        const newFiles = [...galleryFiles];
        const newPreviews = [...galleryPreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setGalleryFiles(newFiles);
        setGalleryPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');


        const formData = new FormData(e.currentTarget);
        const token = localStorage.getItem('accessToken');

        const goalNum = Number(fundingGoal);
        const minNum = Number(minDonation);

        if (!fundingGoal || goalNum < 1000000) {
            setFieldErrors(prev => ({ ...prev, fundingGoal: 'Mục tiêu chiến dịch phải từ 1.000.000 VND trở lên' }));
            setIsLoading(false);
            return;
        }

        if (!minDonation || minNum <= 0) {
            setFieldErrors(prev => ({ ...prev, minDonation: 'Vui lòng nhập số tiền ủng hộ tối thiểu' }));
            setIsLoading(false);
            return;
        }

        if (minNum > goalNum) {
            setFieldErrors(prev => ({ ...prev, minDonation: 'Số tiền ủng hộ tối thiểu không được lớn hơn mục tiêu chiến dịch' }));
            setIsLoading(false);
            return;
        }

        if (!imageFile) {
            setFieldErrors(prev => ({ ...prev, imageFile: 'Vui lòng chọn ảnh đại diện cho chiến dịch' }));
            setIsLoading(false);
            return;
        }

        // 3. Date validation
        const todayAtZero = new Date();
        todayAtZero.setHours(0, 0, 0, 0);
        const startVal = new Date(startDate);
        const endVal = new Date(endDate);

        if (startVal < todayAtZero) {
            setFieldErrors(prev => ({ ...prev, startDate: 'Ngày bắt đầu không thể ở quá khứ' }));
            setIsLoading(false);
            return;
        }

        const oneDayMs = 24 * 60 * 60 * 1000;
        if (endVal.getTime() - startVal.getTime() < oneDayMs) {
            setFieldErrors(prev => ({ ...prev, endDate: 'Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày' }));
            setIsLoading(false);
            return;
        }

        let coverImageUrl = '';
        const galleryUrls: string[] = [];

        try {
            // 1. Upload cover image if exists
            if (imageFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) throw new Error('Failed to upload cover image');
                const uploadData = await uploadResponse.json();
                coverImageUrl = uploadData.url;
            }

            // 2. Upload gallery images
            for (const file of galleryFiles) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);

                const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/upload`, {
                    method: 'POST',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: uploadFormData,
                });

                if (!uploadResponse.ok) throw new Error('Failed to upload gallery images');
                const uploadData = await uploadResponse.json();
                galleryUrls.push(uploadData.url);
            }

            // Find category name from selected id
            const selectedCat = categories.find((c) => c.id === selectedCategoryId);

            const data = {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                category: selectedCat?.name || '',
                categoryId: selectedCategoryId || undefined,
                locationText: formData.get('locationText') as string,
                coverImageUrl: coverImageUrl,
                galleryUrls: galleryUrls,
                fundingGoalAmount: Number(fundingGoal),
                minimumDonationAmount: Number(minDonation),
                startAt: new Date(formData.get('startAt') as string).toISOString(),
                endAt: new Date(formData.get('endAt') as string).toISOString(),
                autoCloseWhenGoalReached: formData.get('autoCloseWhenGoalReached') === 'on',
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/campaigns`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
                throw new Error(errData.message || 'Failed to create campaign');
            }

            router.push('/creator/campaigns');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full pb-20">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ChevronRightIcon className="w-7 h-7 text-cyan-500" />
                    Create New Campaign
                </h1>
                <p className="text-sm text-gray-400 mt-1 ml-9">Fill in the details to create a new campaign.</p>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form className="space-y-6" onSubmit={handleSubmit}>

                    {/* Campaign Title */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2.5">
                            Campaign Title
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <input
                                type="text"
                                name="title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (!e.target.value.trim()) {
                                        setFieldErrors(prev => ({ ...prev, title: 'Tiêu đề không được để trống' }));
                                    } else {
                                        setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.title;
                                            return newErrors;
                                        });
                                    }
                                }}
                                className={`w-full bg-gray-50 border ${fieldErrors.title ? 'border-red-700' : 'border-gray-200'} rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                            />
                            {fieldErrors.title && (
                                <p className="text-red-700 text-[11px] mt-1.5 font-medium ml-1">{fieldErrors.title}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2.5">
                            Description
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <textarea
                                name="description"
                                rows={4}
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    if (e.target.value.trim().length < 20) {
                                        setFieldErrors(prev => ({ ...prev, description: 'Mô tả phải có ít nhất 20 ký tự' }));
                                    } else {
                                        setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.description;
                                            return newErrors;
                                        });
                                    }
                                }}
                                className={`w-full bg-gray-50 border ${fieldErrors.description ? 'border-red-700' : 'border-gray-200'} rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none`}
                            ></textarea>
                            {fieldErrors.description && (
                                <p className="text-red-700 text-[11px] mt-1.5 font-medium ml-1">{fieldErrors.description}</p>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                            Category
                        </label>
                        <div className="sm:w-3/4 flex">
                            <select
                                value={selectedCategoryId}
                                onChange={handleCategoryChange}
                                className="w-52 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1em 1em' }}
                            >
                                <option value="">Choose</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2.5">
                            Location
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <input
                                type="text"
                                name="locationText"
                                value={locationText}
                                onChange={(e) => {
                                    setLocationText(e.target.value);
                                    if (!e.target.value.trim()) {
                                        setFieldErrors(prev => ({ ...prev, locationText: 'Địa điểm không được để trống' }));
                                    } else {
                                        setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.locationText;
                                            return newErrors;
                                        });
                                    }
                                }}
                                className={`w-full bg-gray-50 border ${fieldErrors.locationText ? 'border-red-700' : 'border-gray-200'} rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                            />
                            {fieldErrors.locationText && (
                                <p className="text-red-700 text-[11px] mt-1.5 font-medium ml-1">{fieldErrors.locationText}</p>
                            )}
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2.5">
                            Cover Image
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <div className="flex flex-col gap-4">
                                {imagePreview ? (
                                    <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <XMarkIcon className="h-4 w-4 stroke-[3]" />
                                        </button>
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full max-w-md aspect-video ${fieldErrors.imageFile ? 'bg-red-50 border-red-400' : 'bg-[#f4f4f4] border-gray-300'} hover:bg-[#e8e8e8] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 transition-all text-gray-500 hover:text-gray-700 hover:border-blue-300 group`}
                                        >
                                            <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                                <PhotoIcon className={`h-6 w-6 ${fieldErrors.imageFile ? 'text-red-700' : 'text-blue-500'}`} />
                                            </div>
                                            <span className="text-[13px] font-bold">Click upload cover image</span>
                                            <span className="text-[11px] font-medium opacity-60">PNG, JPG up to 5MB</span>
                                        </button>
                                        {fieldErrors.imageFile && (
                                            <p className="text-red-700 text-[11px] mt-1.5 font-medium ml-1">{fieldErrors.imageFile}</p>
                                        )}
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImageChange(e);
                                            setFieldErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.imageFile;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gallery Images */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2">
                            Gallery Images
                            <span className="text-gray-400 font-medium">(up to 5)</span>
                        </label>
                        <div className="sm:w-3/4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {galleryPreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
                                        <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(index)}
                                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <XMarkIcon className="h-3 w-3 stroke-[3]" />
                                        </button>
                                    </div>
                                ))}
                                {galleryFiles.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={() => galleryInputRef.current?.click()}
                                        className="aspect-square bg-[#f4f4f4] hover:bg-[#e8e8e8] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 transition-all text-gray-400 hover:text-blue-500 hover:border-blue-300 group"
                                    >
                                        <PhotoIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-bold">Add Image</span>
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={galleryInputRef}
                                onChange={handleGalleryChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Funding Goal Amount */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2.5">
                            Funding Goal Amount
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    name="fundingGoalAmount"
                                    value={fundingGoal}
                                    onChange={(e) => {
                                        const valStr = e.target.value.replace(/[^\d]/g, '');
                                        setFundingGoal(valStr);

                                        const val = Number(valStr);
                                        if (valStr && val < 1000000) {
                                            setFieldErrors(prev => ({ ...prev, fundingGoal: 'Mục tiêu phải từ 1.000.000 VND' }));
                                        } else {
                                            setFieldErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.fundingGoal;
                                                return newErrors;
                                            });
                                        }
                                        const minVal = Number(minDonation);

                                        if (minDonation && /^\d+$/.test(minDonation) && minVal > val) {
                                            setFieldErrors(prev => ({ ...prev, minDonation: 'Số tiền ủng hộ tối thiểu không được lớn hơn mục tiêu chiến dịch' }));
                                        } else {
                                            setFieldErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.minDonation;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                    className={`w-48 bg-gray-50 border ${fieldErrors.fundingGoal ? 'border-red-700' : 'border-gray-200'} rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                                />
                                <span className="text-[13px] font-bold text-gray-900">VND</span>
                            </div>
                            {fieldErrors.fundingGoal && (
                                <p className="text-red-700 text-[11px] mt-1.5 font-medium ml-1">{fieldErrors.fundingGoal}</p>
                            )}
                        </div>
                    </div>

                    {/* Minimum Donation Amount */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                        <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2.5">
                            Minimum Donation Amount
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="sm:w-3/4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    name="minimumDonationAmount"
                                    value={minDonation}
                                    onChange={(e) => {
                                        const valStr = e.target.value.replace(/[^\d]/g, '');
                                        // Chỉ chấp nhận số
                                        setMinDonation(valStr);

                                        const val = Number(valStr);
                                        const goalVal = Number(fundingGoal);

                                        if (valStr && val <= 0) {
                                            setFieldErrors(prev => ({ ...prev, minDonation: 'Số tiền tối thiểu phải lớn hơn 0' }));
                                        } else if (fundingGoal && /^\d+$/.test(fundingGoal) && val > goalVal) {
                                            setFieldErrors(prev => ({ ...prev, minDonation: 'Số tiền ủng hộ tối thiểu không được lớn hơn mục tiêu chiến dịch' }));
                                        } else {
                                            setFieldErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.minDonation;
                                                return newErrors;
                                            });
                                        }
                                    }}
                                    className={`w-48 bg-gray-50 border ${fieldErrors.minDonation ? 'border-red-700' : 'border-gray-200'} rounded-lg px-4 py-2.5 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                                />
                                <span className="text-[13px] font-bold text-gray-900">VND</span>
                            </div>
                            {fieldErrors.minDonation && (
                                <p className="text-red-700 text-[11px] mt-1.5 font-medium ml-1">{fieldErrors.minDonation}</p>
                            )}
                        </div>
                    </div>

                    {/* Timeline (Start Date & End Date) & Auto-close checkbox */}
                    <div className="flex flex-col lg:flex-row lg:items-start gap-2 lg:gap-6 py-2">
                        <label className="lg:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2.5">
                            Timeline
                            <span className="bg-[#ff3b30] text-white text-[9px] px-1.5 py-0.5 rounded leading-none">required</span>
                        </label>
                        <div className="lg:w-3/4">
                            <div className="flex flex-wrap items-center gap-4">
                                <input
                                    type="date"
                                    name="startAt"
                                    value={startDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const newStart = e.target.value;
                                        setStartDate(newStart);

                                        // Real-time validation
                                        const today = new Date().toISOString().split('T')[0];
                                        if (newStart < today) {
                                            setFieldErrors(prev => ({ ...prev, startDate: 'Ngày bắt đầu không thể ở quá khứ' }));
                                        } else {
                                            setFieldErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.startDate;
                                                return newErrors;
                                            });
                                        }

                                        // Cross-validate with end date
                                        if (endDate) {
                                            const start = new Date(newStart);
                                            const end = new Date(endDate);
                                            const oneDayMs = 24 * 60 * 60 * 1000;
                                            if (end.getTime() - start.getTime() < oneDayMs) {
                                                setFieldErrors(prev => ({ ...prev, endDate: 'Ngày kết thúc phải sau bắt đầu ít nhất 1 ngày' }));
                                            } else {
                                                setFieldErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.endDate;
                                                    return newErrors;
                                                });
                                            }
                                        }
                                    }}
                                    className={`w-40 bg-gray-50 border ${fieldErrors.startDate ? 'border-red-700' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                                />
                                <span className="text-gray-400 font-bold">--</span>
                                <input
                                    type="date"
                                    name="endAt"
                                    value={endDate}
                                    min={startDate ? new Date(new Date(startDate).getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const newEnd = e.target.value;
                                        setEndDate(newEnd);

                                        if (startDate) {
                                            const start = new Date(startDate);
                                            const end = new Date(newEnd);
                                            const oneDayMs = 24 * 60 * 60 * 1000;
                                            if (end.getTime() - start.getTime() < oneDayMs) {
                                                setFieldErrors(prev => ({ ...prev, endDate: 'Ngày kết thúc phải sau bắt đầu ít nhất 1 ngày' }));
                                            } else {
                                                setFieldErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.endDate;
                                                    return newErrors;
                                                });
                                            }
                                        }
                                    }}
                                    className={`w-40 bg-gray-50 border ${fieldErrors.endDate ? 'border-red-700' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm text-[#000000] focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                                />

                                <label className="flex items-center gap-2 ml-4 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="autoCloseWhenGoalReached"
                                        className="w-4 h-4 rounded text-blue-500 border-gray-300 focus:ring-blue-400 focus:ring-offset-0 bg-[#e5e5e5]"
                                    />
                                    <span className="text-[12px] font-bold text-gray-900">Auto-close When Goal Reached?</span>
                                </label>
                            </div>
                            {(fieldErrors.startDate || fieldErrors.endDate) && (
                                <div className="flex flex-col gap-1 mt-1.5 ml-1">
                                    {fieldErrors.startDate && <p className="text-red-700 text-[11px] font-medium">{fieldErrors.startDate}</p>}
                                    {fieldErrors.endDate && <p className="text-red-700 text-[11px] font-medium">{fieldErrors.endDate}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-12 pb-6 flex justify-center">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-[#4fb3fc] to-[#45a8f7] hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed text-white font-black text-sm px-16 py-3.5 rounded-[12px] shadow-[0_4px_14px_0_rgba(79,179,252,0.39)] transition-all uppercase tracking-wide"
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
