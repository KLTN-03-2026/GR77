import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CampaignHeroProps {
    coverImageUrl: string;
    title: string;
}

export function CampaignHero({ coverImageUrl, title }: CampaignHeroProps) {
    return (
        <div className="relative w-full aspect-[4/3] max-h-[70vh]">
            <img
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-55 bg-[linear-gradient(0deg,_rgba(255,255,255,1.0)_0%,_rgba(255,255,255,1.0)_5%,_rgba(255,255,255,0.8)_40%,_rgba(255,255,255,0.4)_70%,_rgba(255,255,255,0)_90%)] z-20" />
            <div className="absolute -bottom-4 left-0 right-0 z-20 px-8 w-full max-w-7xl mx-auto">
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight drop-shadow-sm">
                    {title}
                </h1>
            </div>
            <div className="absolute top-6 left-6 z-30">
                <Link href="/list" className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md text-gray-900 hover:bg-white/90 transition-all font-semibold text-sm shadow-sm ring-1 ring-white/50">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Campaigns
                </Link>
            </div>
        </div>
    );
}
