"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, UserPlus, Calendar, ChevronLeft, ChevronRight ,Clock} from 'lucide-react';

export default function KindlinkJoinedPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const charityTitles = [
    "Quỹ Áo Ấm Cho Em Vùng Cao",
    "Nước Sạch Cho Đồng Bào Giarai",
    "Xây Cầu Vượt Lũ Miền Trung",
    "Cơm Có Thịt - Tiếp Sức Đến Trường",
    "Học Bổng Thắp Sáng Ước Mơ 2026",
    "Cứu Trợ Thiên Tai Khẩn Cấp",
    "Bảo Vệ Động Vật Hoang Dã Quý Hiếm",
    "Ánh Sáng Học Đường - Xây Lớp Mới",
    "Phẫu Thuật Nụ Cười Cho Trẻ Em"
  ];

  const images = [
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6",
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
    "https://images.unsplash.com/photo-1594708767771-a7502209ff51"
  ];

  const generateData = (page: number) => {
    return Array.from({ length: itemsPerPage }, (_, i) => {
      const index = ((page - 1) * itemsPerPage + i);
      const title = charityTitles[index % charityTitles.length];
      const imgUrl = images[index % images.length];
      return {
        id: (index + 1).toString(),
        title: title,
        raised: (Math.random() * 9000 + 500).toFixed(0),
        image: `${imgUrl}?q=80&w=600&auto=format&fit=crop`,
        startDate: "01/01/2026", // Thêm ngày bắt đầu chiến dịc
        joinedDate: "05/03/2026 14:30" // Giả lập thời gian tham gia
      };
    });
  };

  const campaigns = generateData(currentPage);

  return (
    <div className="p-4 md:p-8 bg-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-50 rounded-lg">
            <UserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Joined Campaigns</h1>
        </div>

        <div className="space-y-6">
          {campaigns.map((cp) => (
            <div key={cp.id} className="flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-all group">
              <div className="w-full md:w-[35%] p-4 h-56 md:h-auto">
                <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                  <img src={cp.image} alt={cp.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              </div>

              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <Link href={`/joined/${cp.id}`}>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                      {cp.title}
                    </h2>
                  </Link>
                  <p className="text-lg font-semibold text-gray-600 mb-6 italic">
                    Amount Raised <span className="text-pink-500 not-italic">${cp.raised}</span>
                  </p>
                  
                  <div className="relative max-w-xs mb-6 group/input">
                    <input 
                      type="text"
                      readOnly 
                      value={`Start at: ${cp.startDate}`}
                      className="w-full p-3 pr-10 border border-gray-200 rounded-2xl text-sm bg-gray-50/30 outline-none focus:border-blue-400 cursor-pointer text-gray-500 font-medium transition-all"
                    />
                    <Calendar className="absolute right-4 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-hover/input:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 transition-all">
                  <Clock className="w-4 h-4 transition-all" />
                  <span className="text-sm font-medium italic">
                      Joined at: 
                      <span className="text-gray-900 not-italic">{cp.joinedDate}</span>
                  </span>
              </div>
                  <Link href={`/joined/${cp.id}`} className="text-blue-500 font-bold text-sm flex items-center gap-1 transition-all active:scale-95 hover:underline hover:text-blue-600">
                    View Detail
                    <ChevronRight className="w-4 h-4 transition-all" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mt-16 pb-12">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-2 rounded-xl border border-gray-100 text-gray-400 disabled:opacity-30 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                  currentPage === i ? "bg-cyan-400 text-white shadow-lg shadow-cyan-100 scale-110" : "border border-gray-100 text-gray-400 hover:bg-gray-50"
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:bg-gray-50 transition-all active:translate-x-1"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}