'use client';

import { mockCampaigns } from '@/lib/mock';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon } from '@heroicons/react/24/outline';

export default function CampaignsPage() {
  // Lấy 3 campaigns yêu thích đầu tiên
  const favoriteCampaigns = mockCampaigns.slice(0, 3);

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
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-3xl font-bold text-gray-900">Favorite Campaigns</h2>
        </div>

        {/* Campaign Cards */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-50 to-blue-50 rounded-3xl p-8 border-2 border-pink-200">
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-gray-600">Amount Raised</span>
                        <span className="font-bold text-gray-900">
                          ${campaign.amountRaised.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                        <span>{formatDate(campaign.endDate || campaign.startDate)}</span>
                        <CalendarIcon className="h-4 w-4" />
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
    </div>
  );
}
