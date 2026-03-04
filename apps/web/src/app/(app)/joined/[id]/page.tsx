"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, MessageSquare, Heart, Send, 
  MoreHorizontal, ThumbsUp, ArrowLeft // Thêm icon ArrowLeft
} from 'lucide-react';

export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  // 1. Logic cho Carousel ảnh
  const images = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=1200",
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200",
    "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=1200"
  ];

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {setCurrentImgIndex((prev) => (prev + 1) % images.length);}, 2000); 
    return () => clearInterval(timer);}, [images.length]);

  const campaign = {
    title: "Phiên chợ Tết 0 Đồng Thái Bình",
    description: "Những hạt giống thiện lành đầu tiên đã gieo, nhưng để tạo ra một 'Thành phố Mặt trời' rực rỡ, tỏa nhiều ánh nắng, tạo ra nhiều năng lượng tích cực, thay đổi cuộc sống của nhiều đứa trẻ hơn nữa thì 'Mặt trời cho em' cần sức mạnh tổng hợp 'gom mặt trời' từ các doanh nghiệp, các quỹ, nhà hảo tâm và cả cộng đồng.",
    status: "Active",
    timeline: { start: "01/01/2026", end: "01/01/2027" },
    location: "ABC , T1 FLOOR , XXXXXX",
    totalRaised: 81,
    userDonation: 5000,
    donationCount: 3,
  };

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        
        {/* NÚT BACK - THÊM MỚI Ở ĐÂY */}
        <div className="mb-6">
          <Link 
            href="/joined" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all group font-medium"
          >
            <div className="p-1.5 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Back to Campaigns
          </Link>
        </div>

        <div className="space-y-10">
          
          {/* Header & Carousel */}
          <section>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">{campaign.title}</h1>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-black aspect-video group">
              <span className="absolute top-6 left-6 bg-red-500 text-white px-6 py-2 rounded-full font-bold z-20 shadow-xl animate-pulse">
                New
              </span>
              
              {images.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Slide ${index}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    index === currentImgIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`} 
                />
              ))}

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {images.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentImgIndex(i)}
                    className={`h-2.5 transition-all rounded-full ${
                      i === currentImgIndex ? "w-10 bg-white" : "w-2.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-8 text-gray-600 leading-relaxed text-xl font-medium max-w-4xl">
              {campaign.description}
            </p>
          </section>

          {/* 3. Timeline & Status - Giống ảnh yêu cầu */}
          <section className="relative space-y-12 py-6">
            <div className="absolute left-[11px] top-10 bottom-10 w-[1px] bg-black"></div>

            <div className="flex items-center gap-6 relative text-lg">
              <div className="w-6 h-6 bg-black rounded-full z-10 shrink-0"></div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="font-bold text-gray-900">Status :</span>
                <span className={campaign.status === "Active" ? "text-green-500 font-bold" : "text-gray-300"}>Active</span>
                <span className="text-gray-400/50">Suspended</span>
                <span className="text-red-600">Expired</span>
                <span className="text-yellow-400">Completed</span>
              </div>
            </div>

            <div className="flex items-center gap-6 relative text-lg">
              <div className="w-6 h-6 bg-black rounded-full z-10 shrink-0"></div>
              <div className="flex items-center gap-6">
                <span className="font-bold text-gray-900">Timeline :</span>
                <span className="text-gray-900">{campaign.timeline.start}</span>
                <span className="text-gray-400">-</span>
                <span className="text-gray-900">{campaign.timeline.end}</span>
              </div>
            </div>

            <div className="flex items-center gap-6 relative text-lg">
              <div className="w-6 h-6 bg-black rounded-full z-10 shrink-0"></div>
              <div className="flex items-center gap-6">
                <span className="font-bold text-gray-900">Location :</span>
                <span className="text-gray-900 uppercase tracking-wide">{campaign.location}</span>
              </div>
            </div>
          </section>

          <hr className="border-gray-100 border-4 rounded-full" />

          {/* 4. Pie Chart & Stats */}
          <section className="bg-white border border-gray-100 rounded-[3.5rem] p-10 shadow-xl shadow-gray-200/50">
            <div className="flex flex-col md:flex-row items-center gap-16 justify-between">
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path className="text-gray-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                  <path className="text-green-500" strokeDasharray={`${campaign.totalRaised}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-gray-900">{campaign.totalRaised}%</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Raised</span>
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full max-w-md">
                <div className="flex justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="font-bold text-gray-500">Your Total Donation:</span>
                  <span className="font-black text-gray-900 text-xl">${campaign.userDonation}</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="font-bold text-gray-500">Total Number of Donations:</span>
                  <span className="font-black text-gray-900 text-xl">{campaign.donationCount}</span>
                </div>
                <button className="w-full py-5 bg-[#FFD700] hover:bg-yellow-400 text-white font-black text-2xl rounded-full shadow-lg shadow-yellow-200/50 transition-all active:scale-95">
                  Donate
                </button>
              </div>
            </div>
          </section>

          {/* 5. Professional Comment Section */}
          <section className="space-y-10 pb-20">
            <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-7 h-7 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-900">Community Discussion</h3>
              </div>
              <span className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-1 rounded-full">248 Comments</span>
            </div>

            <div className="flex gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm focus-within:border-blue-300 transition-all">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hiu" className="w-12 h-12 rounded-full" alt="User" />
              <div className="flex-1 relative">
                <textarea 
                  placeholder="Share your thoughts about this campaign..."
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-700 resize-none py-2 outline-none"
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <button className="bg-blue-600 text-white p-2.5 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-90">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-10 mt-10">
              {[
                { name: "Ngọc Tiên", text: "Dự án quá tuyệt vời, mong có nhiều chương trình như này hơn nữa!", time: "2 giờ trước", likes: 12, img: "1" },
                { name: "Hiuuuu", text: "Mình có thể đăng ký làm tình nguyện viên tại Thái Bình không ạ?", time: "5 giờ trước", likes: 8, img: "2", reply: "Chào Hiuuuu, bạn liên hệ Fanpage nhé!" },
                { name: "Trà My", text: "Gom mặt trời, gom yêu thương <3", time: "1 ngày trước", likes: 45, img: "3" }
              ].map((comment, i) => (
                <div key={i} className="flex gap-5 group">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.img}`} className="w-14 h-14 rounded-full shadow-sm" alt="" />
                  <div className="flex-1 space-y-3">
                    <div className="bg-white border border-gray-50 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{comment.name}</h4>
                          <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">{comment.time}</span>
                        </div>
                        <button className="text-gray-300 hover:text-gray-600"><MoreHorizontal className="w-5 h-5" /></button>
                      </div>
                      <p className="text-gray-600 mt-4 leading-relaxed">{comment.text}</p>
                      
                      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-50">
                        <button className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-500 transition-colors">
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
                      <div className="flex gap-4 ml-10 mt-4 animate-in slide-in-from-left duration-500">
                        <div className="w-1 bg-blue-100 rounded-full my-2"></div>
                        <div className="bg-blue-50/50 p-5 rounded-[1.5rem] flex-1">
                          <p className="text-sm font-bold text-blue-900">Admin Kindlink</p>
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
      </div>
    </div>
  );
}