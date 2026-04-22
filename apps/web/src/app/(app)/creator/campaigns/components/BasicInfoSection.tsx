import React from 'react';

export interface CategoryOption {
    id: string;
    name: string;
    icon?: string;
}

interface BasicInfoSectionProps {
    campaign?: any; // Made optional or default {} for Create form
    categories: CategoryOption[];
    selectedCategoryId: string;
    setSelectedCategoryId: (id: string) => void;
    fieldErrors?: Record<string, string>;
}

export function BasicInfoSection({ campaign = {}, categories, selectedCategoryId, setSelectedCategoryId, fieldErrors = {} }: BasicInfoSectionProps) {
    const isLocked = campaign?.id ? (
        (campaign.currentAmount > 0) ||
        (campaign.startAt && new Date(campaign.startAt) <= new Date())
    ) : false;

    return (
        <>
            {/* Campaign Title */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                    Campaign Title <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="sm:w-3/4">
                    <input
                        type="text"
                        name="title"
                        defaultValue={campaign.title}
                        required={!isLocked}
                        disabled={isLocked}
                        className={`w-full bg-gray-50 border ${fieldErrors.title ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:ring-4 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100`}
                    />
                    {fieldErrors.title && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{fieldErrors.title}</p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-3">
                    Description <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="sm:w-3/4">
                    <textarea
                        name="description"
                        rows={6}
                        defaultValue={campaign.description}
                        required
                        className={`w-full bg-gray-50 border ${fieldErrors.description ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:ring-4 outline-none transition-all resize-none shadow-sm`}
                    ></textarea>
                    {fieldErrors.description && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{fieldErrors.description}</p>
                    )}
                </div>
            </div>

            {/* Category */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-8">
                <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">Category <span className="text-red-500 ml-1">*</span></label>
                <div className="sm:w-3/4">
                    <select
                        name="categoryId"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className={`w-full sm:w-96 bg-gray-50 border ${fieldErrors.categoryId ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:ring-4 outline-none transition-all appearance-none cursor-pointer`}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                    >
                        <option value="">Choose</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {fieldErrors.categoryId && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{fieldErrors.categoryId}</p>
                    )}
                </div>
            </div>

            {/* Location */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-8">
                <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2">
                    Location <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="sm:w-3/4">
                    <input
                        type="text"
                        name="locationText"
                        defaultValue={campaign.locationText}
                        required
                        className={`w-full sm:w-96 bg-gray-50 border ${fieldErrors.locationText ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'} rounded-xl px-5 py-3 text-sm text-[#000000] font-medium focus:bg-white focus:ring-4 outline-none transition-all`}
                    />
                    {fieldErrors.locationText && (
                        <p className="text-red-500 text-xs font-semibold mt-1.5 ml-1">{fieldErrors.locationText}</p>
                    )}
                </div>
            </div>
        </>
    );
}
