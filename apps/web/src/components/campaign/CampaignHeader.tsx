"use client";

import React, { useState, useEffect } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

interface CampaignHeaderProps {
    title: string;
    status: string;
    images: string[];
    isCreator?: boolean;
    isLiked?: boolean;
    onToggleLike?: () => void;
}

export function CampaignHeader({ title, status, images, isCreator, isLiked, onToggleLike }: CampaignHeaderProps) {
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;
        const timer = setInterval(
            () => setCurrentImgIndex((p) => (p + 1) % images.length),
            3000
        );
        return () => clearInterval(timer);
    }, [images.length]);

    const goToPrev = () => setCurrentImgIndex((p) => (p - 1 + images.length) % images.length);
    const goToNext = () => setCurrentImgIndex((p) => (p + 1) % images.length);

    return (
        <section className="w-full h-full">
            {title && <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">{title}</h1>}
            <div className="relative overflow-hidden bg-black w-full h-full group rounded-2xl">
                {/* Status badge - rounded with glassmorphism */}
                <span className={`absolute top-4 left-4 text-white px-5 py-1.5 font-bold text-sm z-20 rounded-full backdrop-blur-md ${status === "ACTIVE" ? "bg-green-500/60" : "bg-yellow-500/60"}`}>
                    {status}
                </span>

                {/* Like button */}
                {!isCreator && (
                    <div className="absolute top-4 right-4 z-20">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.();
                            }}
                            className={`p-2.5 rounded-full shadow-lg transition-all border ${isLiked
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white/20 text-white border-white/20 backdrop-blur-md"
                                } hover:scale-110 active:scale-95`}
                        >
                            {isLiked ? <HeartSolid className="h-5 w-5" /> : <HeartOutline className="h-5 w-5" />}
                        </button>
                    </div>
                )}

                {/* Images - properly centered */}
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Slide ${index}`}
                        className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${index === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    />
                ))}

                {/* Navigation arrows - circular dark frosted glass */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goToPrev}
                            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                            aria-label="Previous image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/60 transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                            aria-label="Next image"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 bg-black/30 backdrop-blur-md rounded-full px-3 py-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImgIndex(i)}
                                className={`h-2 transition-all rounded-full ${i === currentImgIndex ? "w-6 bg-white" : "w-2 bg-white/50"}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
