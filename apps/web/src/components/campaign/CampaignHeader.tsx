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

    return (
        <section>
            {title && <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">{title}</h1>}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-black aspect-video lg:aspect-[16/10] group">
                <span className={`absolute top-6 left-6 text-white px-6 py-2 rounded-full font-bold z-20 shadow-xl ${status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"}`}>
                    {status}
                </span>

                {!isCreator && (
                    <div className="absolute top-6 right-6 z-20">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggleLike?.();
                            }}
                            className={`p-3 rounded-2xl shadow-lg transition-all border ${isLiked
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-white/90 text-red-500 border-gray-100/50 backdrop-blur-md"
                                } hover:scale-110 active:scale-95`}
                        >
                            {isLiked ? <HeartSolid className="h-6 w-6" /> : <HeartOutline className="h-6 w-6" />}
                        </button>
                    </div>
                )}

                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Slide ${index}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                    />
                ))}

                {images.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImgIndex(i)}
                                className={`h-2.5 transition-all rounded-full ${i === currentImgIndex ? "w-10 bg-white" : "w-2.5 bg-white/50"}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
