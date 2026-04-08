import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CampaignHeroProps {
    coverImageUrl: string;
    title: string;
}

export function CampaignHero({ coverImageUrl, title }: CampaignHeroProps) {
    return (
        <div className="flex flex-col w-full">
            <div className="relative w-full aspect-[4/3] sm:aspect-video lg:aspect-[2.35/1] max-h-[70vh] rounded-none sm:mb-0 bg-gray-100">
                <img
                    src={coverImageUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                {/* Desktop overlay gradient - hidden on mobile */}
                <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-55 bg-[linear-gradient(0deg,_rgba(255,255,255,1.0)_0%,_rgba(255,255,255,1.0)_5%,_rgba(255,255,255,0.8)_40%,_rgba(255,255,255,0.4)_70%,_rgba(255,255,255,0)_90%)] z-20" />
                
                {/* Desktop title - hidden on mobile */}
                <div className="hidden sm:block absolute bottom-2 left-0 right-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8">
                        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight drop-shadow-sm">
                            {title}
                        </h1>
                    </div>
                </div>

                {/* Unified Back Button (Absolute) */}
                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-30">
                    <Link href="/list" className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 backdrop-blur-md text-gray-900 hover:bg-white/90 transition-all font-bold text-xs sm:text-sm shadow-sm ring-1 ring-white/50 rounded-full sm:rounded-none">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Back to Campaigns</span>
                        <span className="inline sm:hidden">Back</span>
                    </Link>
                </div>
            </div>

            {/* Mobile title */}
            <div className="sm:hidden px-4 pt-4 pb-1 w-full bg-white z-20">
                <h1 className="text-[22px] font-black text-gray-900 tracking-tight leading-snug">
                    {title}
                </h1>
            </div>
        </div>
    );
}
