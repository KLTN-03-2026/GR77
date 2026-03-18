"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    MessageSquare,
    Heart,
    Send,
    MoreHorizontal,
    ThumbsUp,
    MapPin,
    Calendar,
    Target,
    Sparkles,
    HandHeart,
    Share2,
    Bookmark,
    Users,
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
    education: "Education",
    health: "Health",
    environment: "Environment",
    social: "Social Welfare",
};

function formatCurrency(amount: number | string) {
    return Number(amount).toLocaleString("vi-VN");
}

function formatDate(dateString?: string) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function CampaignDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    /* ── API fetch ── */
    const [campaign, setCampaign] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    useEffect(() => {
        const fetchCampaign = async () => {
            setIsLoading(true);
            setFetchError("");
            try {
                const res = await fetch(`http://localhost:3001/campaigns/${id}`);
                if (!res.ok) throw new Error("Campaign not found");
                const data = await res.json();
                setCampaign(data);
            } catch (err: any) {
                setFetchError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    /* ── Image carousel ── */
    const fallbackImages = [
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200",
        "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200",
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1200",
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
        "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=1200",
    ];
    const images = campaign?.coverImageUrl
        ? [campaign.coverImageUrl, ...fallbackImages.slice(0, 4)]
        : fallbackImages;

    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(
            () => setCurrentImgIndex((p) => (p + 1) % images.length),
            3000
        );
        return () => clearInterval(timer);
    }, [images.length]);

    /* ── Donate modal ── */
    const [donateOpen, setDonateOpen] = useState(false);
    const [donateAmount, setDonateAmount] = useState("");
    const [donated, setDonated] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    /* ── Participant state ── */
    const [isJoined, setIsJoined] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        fetch(`http://localhost:3001/participants/${id}/status`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.joined) setIsJoined(true);
            })
            .catch(() => { });
    }, [id]);

    const handleJoin = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("Bạn cần đăng nhập để tham gia chiến dịch!");
            router.push("/login");
            return;
        }
        setIsJoining(true);
        try {
            const res = await fetch(`http://localhost:3001/participants`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ campaignId: id }),
            });
            if (res.ok) {
                setIsJoined(true);
                alert("Tham gia chiến dịch thành công!");
                router.push(`/joined/${id}`);
            } else {
                const data = await res.json();
                alert(data.message || "Có lỗi xảy ra");
            }
        } catch (err) {
            alert("Lỗi kết nối");
        } finally {
            setIsJoining(false);
        }
    };

    /* ── Derived values ── */
    const fundingGoal = Number(campaign?.fundingGoalAmount ?? 0);
    const minimumDonation = Number(campaign?.minimumDonationAmount ?? 0);
    const totalRaised = Number(campaign?.totalRaised ?? 0);
    const raisedPercent =
        fundingGoal > 0 ? Math.min(Math.round((totalRaised / fundingGoal) * 100), 100) : 0;

    const handleDonate = () => {
        if (!donateAmount || Number(donateAmount) < minimumDonation) return;
        setDonated(true);
        setTimeout(() => {
            setDonateOpen(false);
            setDonated(false);
            setDonateAmount("");
        }, 2000);
    };

    return (
        <div className="p-4 md:p-8 bg-white min-h-screen">
            <div className="max-w-5xl mx-auto">

                {/* Back button */}
                <div className="mb-6">
                    <Link
                        href="/list"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 transition-all group font-medium"
                    >
                        <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-cyan-100 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Back to Campaigns
                    </Link>
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
                        <p className="text-gray-400 font-medium">Loading campaign...</p>
                    </div>
                )}

                {/* Error state */}
                {!isLoading && fetchError && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
                        <p className="text-red-500 text-lg font-semibold">{fetchError}</p>
                        <p className="text-gray-400 text-sm">
                            Please check the campaign ID or try again later.
                        </p>
                    </div>
                )}

                {/* Main content */}
                {!isLoading && !fetchError && campaign && (
                    <div className="space-y-10">

                        {/* ── Hero / Carousel ── */}
                        <section>
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-cyan-50 text-cyan-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                            {CATEGORY_LABELS[campaign.category] ?? campaign.category}
                                        </span>
                                        <span
                                            className={`text-xs font-bold px-3 py-1 rounded-full ${campaign.status === "ACTIVE"
                                                ? "bg-green-50 text-green-600"
                                                : "bg-yellow-50 text-yellow-600"
                                                }`}
                                        >
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                        {campaign.title}
                                    </h1>
                                </div>

                                <button
                                    onClick={() => setBookmarked((b) => !b)}
                                    className={`p-3 rounded-2xl border-2 transition-all ${bookmarked
                                        ? "border-cyan-400 bg-cyan-50 text-cyan-500"
                                        : "border-gray-100 hover:border-cyan-200 text-gray-400 hover:text-cyan-500"
                                        }`}
                                    title="Save to favorites"
                                >
                                    <Bookmark
                                        className="w-5 h-5"
                                        fill={bookmarked ? "currentColor" : "none"}
                                    />
                                </button>
                            </div>

                            {/* Carousel */}
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-black aspect-video">
                                {images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`Slide ${index}`}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                                            }`}
                                    />
                                ))}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentImgIndex(i)}
                                            className={`h-2.5 transition-all rounded-full ${i === currentImgIndex ? "w-10 bg-white" : "w-2.5 bg-white/50"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <button className="absolute top-6 right-6 z-20 bg-white/20 backdrop-blur-sm text-white p-2.5 rounded-2xl hover:bg-white/30 transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="mt-8 text-gray-600 leading-relaxed text-xl font-medium max-w-4xl">
                                {campaign.description}
                            </p>
                        </section>

                        {/* ── Timeline & Info ── */}
                        <section className="relative space-y-12 py-6">
                            <div className="absolute left-[11px] top-10 bottom-10 w-[1px] bg-gray-200" />

                            {/* Status */}
                            <div className="flex items-center gap-6 relative text-lg">
                                <div className="w-6 h-6 bg-black rounded-full z-10 shrink-0" />
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <span className="font-bold text-gray-900">Status :</span>
                                    <span
                                        className={`font-bold px-4 py-1 rounded-full text-sm ${campaign.status === "ACTIVE"
                                            ? "bg-green-50 text-green-600"
                                            : campaign.status === "SUSPENDED"
                                                ? "bg-gray-100 text-gray-500"
                                                : campaign.status === "EXPIRED"
                                                    ? "bg-red-50 text-red-500"
                                                    : "bg-yellow-50 text-yellow-500"
                                            }`}
                                    >
                                        {campaign.status === "ACTIVE"
                                            ? "Active"
                                            : campaign.status === "SUSPENDED"
                                                ? "Suspended"
                                                : campaign.status === "EXPIRED"
                                                    ? "Expired"
                                                    : "Completed"}
                                    </span>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="flex items-center gap-6 relative text-lg">
                                <div className="w-6 h-6 bg-black rounded-full z-10 shrink-0" />
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="font-bold text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" /> Timeline :
                                    </span>
                                    <span className="text-gray-700">{formatDate(campaign.startAt)}</span>
                                    <span className="text-gray-400">—</span>
                                    <span className="text-gray-700">{formatDate(campaign.endAt)}</span>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-6 relative text-lg">
                                <div className="w-6 h-6 bg-black rounded-full z-10 shrink-0" />
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="font-bold text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" /> Location :
                                    </span>
                                    <span className="text-gray-700 uppercase tracking-wide">
                                        {campaign.locationText || "—"}
                                    </span>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100 border-4 rounded-full" />

                        {/* ── Funding Stats + CTA ── */}
                        <section className="bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-xl shadow-gray-200/50">
                            <div className="flex flex-col md:flex-row items-center gap-12 justify-between">

                                {/* Donut chart */}
                                <div className="relative w-56 h-56 shrink-0">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                        <path
                                            className="text-gray-100"
                                            strokeDasharray="100, 100"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                        />
                                        <path
                                            className="text-cyan-400"
                                            strokeDasharray={`${raisedPercent}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-black text-gray-900">{raisedPercent}%</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            Funded
                                        </span>
                                    </div>
                                </div>

                                {/* Stats + Donate CTA */}
                                <div className="flex-1 space-y-4 w-full max-w-md">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl gap-1">
                                            <Target className="w-5 h-5 text-cyan-400" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Goal</span>
                                            <span className="font-black text-gray-900 text-lg leading-tight text-center">
                                                {formatCurrency(fundingGoal)}
                                                <span className="text-xs font-semibold text-gray-400 ml-1">VND</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl gap-1">
                                            <HandHeart className="w-5 h-5 text-pink-400" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Raised</span>
                                            <span className="font-black text-gray-900 text-lg leading-tight text-center">
                                                {formatCurrency(totalRaised)}
                                                <span className="text-xs font-semibold text-gray-400 ml-1">VND</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl gap-1">
                                            <Users className="w-5 h-5 text-blue-400" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Favorites</span>
                                            <span className="font-black text-gray-900 text-2xl">
                                                {campaign.favoritesCount ?? 0}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl gap-1">
                                            <Sparkles className="w-5 h-5 text-yellow-400" />
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Min. Donation</span>
                                            <span className="font-black text-gray-900 text-sm leading-tight text-center">
                                                {formatCurrency(minimumDonation)}
                                                <span className="text-xs font-semibold text-gray-400 ml-1">VND</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleJoin}
                                            disabled={isJoining || isJoined}
                                            className={`w-full py-5 font-black text-2xl rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${isJoined
                                                    ? "bg-green-500 hover:bg-green-600 text-white shadow-green-200/60"
                                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-200/60 disabled:opacity-50"
                                                }`}
                                        >
                                            <Users className="w-7 h-7" />
                                            {isJoined ? "Already Joined" : isJoining ? "Joining..." : "Join Campaign"}
                                        </button>
                                        <button
                                            onClick={() => setDonateOpen(true)}
                                            className="w-full py-5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-black text-2xl rounded-full shadow-lg shadow-cyan-200/60 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            <HandHeart className="w-7 h-7" />
                                            Donate Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ── Comment Section ── */}
                        <section className="space-y-10 pb-20">
                            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-7 h-7 text-cyan-500" />
                                    <h3 className="text-2xl font-bold text-gray-900">Community Discussion</h3>
                                </div>
                                <span className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-1 rounded-full">
                                    248 Comments
                                </span>
                            </div>

                            <div className="flex gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm focus-within:border-cyan-300 transition-all">
                                <img
                                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hiu"
                                    className="w-12 h-12 rounded-full"
                                    alt="User"
                                />
                                <div className="flex-1 relative">
                                    <textarea
                                        placeholder="Share your thoughts about this campaign..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-gray-700 resize-none py-2 outline-none"
                                        rows={2}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button className="bg-cyan-500 text-white p-2.5 rounded-2xl hover:bg-cyan-600 shadow-lg shadow-cyan-200 transition-all active:scale-90">
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-10 mt-10">
                                {[
                                    { name: "Ngọc Tiên", text: "Dự án quá tuyệt vời, mong có nhiều chương trình như này hơn nữa!", time: "2 giờ trước", likes: 12, img: "1" },
                                    { name: "Hiuuuu", text: "Mình có thể đăng ký làm tình nguyện viên tại Thái Bình không ạ?", time: "5 giờ trước", likes: 8, img: "2", reply: "Chào Hiuuuu, bạn liên hệ Fanpage nhé!" },
                                    { name: "Trà My", text: "Gom mặt trời, gom yêu thương <3", time: "1 ngày trước", likes: 45, img: "3" },
                                ].map((comment, i) => (
                                    <div key={i} className="flex gap-5 group">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.img}`}
                                            className="w-14 h-14 rounded-full shadow-sm"
                                            alt=""
                                        />
                                        <div className="flex-1 space-y-3">
                                            <div className="bg-white border border-gray-50 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-lg">{comment.name}</h4>
                                                        <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                                            {comment.time}
                                                        </span>
                                                    </div>
                                                    <button className="text-gray-300 hover:text-gray-600">
                                                        <MoreHorizontal className="w-5 h-5" />
                                                    </button>
                                                </div>
                                                <p className="text-gray-600 mt-4 leading-relaxed">{comment.text}</p>
                                                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-50">
                                                    <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-cyan-500 transition-colors">
                                                        <ThumbsUp className="w-4 h-4" /> {comment.likes}
                                                    </button>
                                                    <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                                                        <MessageSquare className="w-4 h-4" /> Reply
                                                    </button>
                                                    <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-pink-500 transition-colors">
                                                        <Heart className="w-4 h-4" /> Love
                                                    </button>
                                                </div>
                                            </div>
                                            {comment.reply && (
                                                <div className="flex gap-4 ml-10 mt-4">
                                                    <div className="w-1 bg-cyan-100 rounded-full my-2" />
                                                    <div className="bg-cyan-50/50 p-5 rounded-[1.5rem] flex-1">
                                                        <p className="text-sm font-bold text-cyan-900">Admin Kindlink</p>
                                                        <p className="text-gray-600 text-sm mt-1">{comment.reply}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 font-bold rounded-3xl hover:bg-gray-50 hover:border-gray-300 transition-all">
                                Load more comments
                            </button>
                        </section>

                    </div>
                )}
            </div>

            {/* ── Donate Modal ── */}
            {donateOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setDonateOpen(false);
                    }}
                >
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {donated ? (
                            <div className="flex flex-col items-center gap-4 py-6">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                                    <HandHeart className="w-10 h-10 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">Thank you! 🎉</h3>
                                <p className="text-gray-500 text-center">
                                    Your donation has been submitted successfully.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-black text-gray-900">Make a Donation</h3>
                                    <button
                                        onClick={() => setDonateOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                                    >
                                        ×
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mb-4">
                                    Min. donation:{" "}
                                    <span className="font-bold text-gray-700">
                                        {formatCurrency(minimumDonation)} VND
                                    </span>
                                </p>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {QUICK_AMOUNTS.map((amt) => (
                                        <button
                                            key={amt}
                                            onClick={() => setDonateAmount(String(amt))}
                                            className={`py-2 rounded-2xl text-sm font-bold border-2 transition-all ${donateAmount === String(amt)
                                                ? "border-cyan-400 bg-cyan-50 text-cyan-600"
                                                : "border-gray-100 text-gray-500 hover:border-cyan-200"
                                                }`}
                                        >
                                            {(amt / 1000).toFixed(0)}K
                                        </button>
                                    ))}
                                </div>

                                <div className="relative mb-6">
                                    <input
                                        type="number"
                                        value={donateAmount}
                                        onChange={(e) => setDonateAmount(e.target.value)}
                                        placeholder="Or enter custom amount..."
                                        className="w-full border-2 border-gray-100 focus:border-cyan-400 rounded-2xl px-5 py-4 text-lg font-bold text-gray-900 outline-none transition-all pr-16"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                        VND
                                    </span>
                                </div>

                                <button
                                    onClick={handleDonate}
                                    disabled={!donateAmount || Number(donateAmount) < minimumDonation}
                                    className="w-full py-5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-white font-black text-xl rounded-full shadow-lg shadow-cyan-200/60 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Confirm Donation
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
