import React, { RefObject } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface MediaSectionProps {
    imagePreview: string;
    fileInputRef: RefObject<HTMLInputElement | null>;
    removeImage: () => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    galleryPreviews: string[];
    galleryInputRef: RefObject<HTMLInputElement | null>;
    removeGalleryImage: (index: number) => void;
    handleGalleryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MediaSection({
    imagePreview,
    fileInputRef,
    removeImage,
    handleImageChange,
    galleryPreviews,
    galleryInputRef,
    removeGalleryImage,
    handleGalleryChange
}: MediaSectionProps) {
    return (
        <>
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

            {/* Gallery Images */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="sm:w-1/4 text-[13px] font-bold text-gray-900 flex items-center gap-2 pt-2">
                    Gallery Images
                    <span className="text-gray-400 font-medium">(up to 5)</span>
                </label>
                <div className="sm:w-3/4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {galleryPreviews.map((preview, index) => (
                            <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm">
                                <img src={preview} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeGalleryImage(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <XMarkIcon className="h-4 w-4 stroke-[3]" />
                                </button>
                            </div>
                        ))}
                        {galleryPreviews.length < 5 && (
                            <button
                                type="button"
                                onClick={() => galleryInputRef.current?.click()}
                                className="aspect-square bg-[#f4f4f4] hover:bg-[#e8e8e8] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all text-gray-400 hover:text-blue-500 hover:border-blue-300 group"
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
        </>
    );
}
