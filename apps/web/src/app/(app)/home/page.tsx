'use client';

import { mockCampaigns } from '@/lib/mock';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon } from '@heroicons/react/24/outline';

export default function CampaignsPage() {
  // Lấy 3 campaigns yêu thích đầu tiên
  const favoriteCampaigns = mockCampaigns.slice(0, 3);
  // Lấy 3 campaigns cho Activity History
  const activityCampaigns = mockCampaigns.slice(1, 4);
  // Lấy 3 campaigns cho Joined Campaigns
  const joinedCampaigns = mockCampaigns.slice(2, 5);
  // Lấy 3 campaigns cho My Campaigns
  const myCampaigns = mockCampaigns.slice(3, 6);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Favorite Campaigns Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-900">Favorite Campaigns</h2>
        </div>

        {/* Campaign Cards */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-50 to-blue-50 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl p-8 border-t-4 border-l-2 border-r-2 border-pink-500 relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-b before:from-pink-500/60 before:to-transparent before:rounded-tl-3xl before:pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {favoriteCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {campaign.title}
                    </h3>
                    {/* Chỗ để giá đây đừng mù nữa Híu */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">Amount Raised</span>
                        <span className="font-bold text-gray-900">
                          ${campaign.amountRaised.toLocaleString()}
                        </span>
                      </div>
                      {/* cái datetime picker  */}
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-4 py-1 text-sm text-gray-600 hover:bg-gray-200 active:scale-95 transition cursor-pointer hover:border-blue-500 hover:text-blue-500">
                          
                          <input
                            type="datetime-local"
                            className="bg-transparent outline-none text-sm cursor-pointer"
                            defaultValue={campaign.endDate || campaign.startDate}
                          />

                          <CalendarIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View favorite campaigns link */}
          <div className="text-right">
            <Link 
              href="/favorites" 
              className="text-pink-500 hover:text-pink-600 font-medium inline-flex items-center gap-2"
            >
              View favorite campaigns
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Activity History Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-900">Activity History</h2>
        </div>

        {/* Campaign Cards */}
        <div className="bg-gradient-to-r from-blue-100 via-cyan-50 to-teal-50 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl p-8 border-t-4 border-l-2 border-r-2 border-blue-500 relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-b before:from-blue-500/60 before:to-transparent before:rounded-tl-3xl before:pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {activityCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {campaign.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">Amount Raised</span>
                        <span className="font-bold text-gray-900">
                          ${campaign.amountRaised.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-4 py-1 text-sm text-gray-600 hover:bg-gray-200 active:scale-95 transition cursor-pointer hover:border-blue-500 hover:text-blue-500">
                          <input
                            type="datetime-local"
                            className="bg-transparent outline-none text-sm cursor-pointer"
                            defaultValue={campaign.endDate || campaign.startDate}/>
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {/* View activity link */}
          <div className="text-right">
            <Link 
              href="/activity" 
              className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center gap-2"
            >
              View activity history
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Joined Campaigns Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-900">Joined Campaigns</h2>
        </div>

        {/* Campaign Cards */}
        <div className="bg-gradient-to-r from-green-100 via-emerald-50 to-teal-50 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl p-8 border-t-4 border-l-2 border-r-2 border-green-500 relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-b before:from-green-500/60 before:to-transparent before:rounded-tl-3xl before:pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {joinedCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {campaign.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">Amount Raised</span>
                        <span className="font-bold text-gray-900">
                          ${campaign.amountRaised.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-4 py-1 text-sm text-gray-600 hover:bg-gray-200 active:scale-95 transition cursor-pointer hover:border-blue-500 hover:text-blue-500">
                          <input
                            type="datetime-local"
                            className="bg-transparent outline-none text-sm cursor-pointer"
                            defaultValue={campaign.endDate || campaign.startDate}/>
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View joined campaigns link */}
          <div className="text-right">
            <Link 
              href="/joined" 
              className="text-green-500 hover:text-green-600 font-medium inline-flex items-center gap-2"
            >
              View joined campaigns
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* My Campaigns Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-900">My Campaigns</h2>
        </div>

        {/* Campaign Cards */}
        <div className="bg-gradient-to-r from-purple-100 via-violet-50 to-indigo-50 rounded-bl-3xl rounded-br-3xl rounded-tl-3xl p-8 border-t-4 border-l-2 border-r-2 border-purple-500 relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-4 before:bg-gradient-to-b before:from-purple-500/60 before:to-transparent before:rounded-tl-3xl before:pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {myCampaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={campaign.image}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-900 mb-2">
                      {campaign.title}
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">Amount Raised</span>
                        <span className="font-bold text-gray-900">
                          ${campaign.amountRaised.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-4 py-1 text-sm text-gray-600 hover:bg-gray-200 active:scale-95 transition cursor-pointer hover:border-blue-500 hover:text-blue-500">
                          <input
                            type="datetime-local"
                            className="bg-transparent outline-none text-sm cursor-pointer"
                            defaultValue={campaign.endDate || campaign.startDate}/>
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View my campaigns link */}
          <div className="text-right">
            <Link 
              href="/creator/campaigns" 
              className="text-purple-500 hover:text-purple-600 font-medium inline-flex items-center gap-2"
            >
              View my campaigns
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
