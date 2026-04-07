'use client';

import { mockCampaigns } from '@/lib/mock';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon } from '@heroicons/react/24/outline';

export default function CampaignsPage() {
  const favoriteCampaigns = mockCampaigns.slice(0, 4);
  const activityCampaigns = mockCampaigns.slice(1, 5);
  const joinedCampaigns = mockCampaigns.slice(2, 6);
  const myCampaigns = mockCampaigns.slice(0, 4);

  const sections = [
    {
      title: 'Favorite Campaigns',
      icon: (
        <svg className="w-7 h-7 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      campaigns: favoriteCampaigns,
      borderColor: '#F472B6',
      shadowColor: '#F472B6',
      bgColor: '#FFEDF7',
      linkHref: '/favorites',
      linkText: 'View favorite campaigns',
      linkColor: 'text-pink-500 hover:text-pink-600',
    },
    {
      title: 'Activity History',
      icon: (
        <svg className="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      campaigns: activityCampaigns,
      borderColor: '#60A5FA',
      shadowColor: '#60A5FA',
      bgColor: '#DEECFF',
      linkHref: '/activity',
      linkText: 'View activity history',
      linkColor: 'text-blue-500 hover:text-blue-600',
    },
    {
      title: 'Joined Campaigns',
      icon: (
        <svg className="w-7 h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      campaigns: joinedCampaigns,
      borderColor: '#33BE21',
      shadowColor: '#33BE21',
      bgColor: '#E8FFE5',
      linkHref: '/joined',
      linkText: 'View joined campaigns',
      linkColor: 'text-green-500 hover:text-green-600',
    },
    {
      title: 'My Campaigns',
      icon: (
        <svg className="w-7 h-7 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      campaigns: myCampaigns,
      borderColor: '#A78BFA',
      shadowColor: '#A78BFA',
      bgColor: '#F3E8FF',
      linkHref: '/creator/campaigns',
      linkText: 'View my campaigns',
      linkColor: 'text-purple-500 hover:text-purple-600',
    },
  ];

  return (
    <div className="w-full">
      {sections.map((section, idx) => (
        <div key={idx} className="mb-20">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-5">
            {section.icon}
            <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
          </div>

          {/* Card Container */}
          <div
            className="px-8 pt-10 pb-8"
            style={{
              border: `2px solid ${section.borderColor}`,
              borderBottom: 'none',
              borderRadius: '1.5rem 0 0 0',
              boxShadow: `inset 0 4px 4px 0 ${section.shadowColor}`,
              background: section.bgColor,
            }}
          >
            {/* Cards — narrow cards, evenly spaced */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {section.campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:scale-[1.02]" style={{ background: 'rgba(255, 255, 255, 0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255, 255, 255, 0.73)' }}>
                    <div className="relative h-40">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-3.5 text-center">
                      <h3 className="font-bold text-black mb-2 text-sm truncate">
                        {campaign.title}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs text-black/70">Amount Raised</span>
                          <span className="font-bold text-black text-sm">
                            ${campaign.amountRaised.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-black/10 border border-black/20 rounded-full px-3 py-1 text-xs text-black/80">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            <span>{campaign.startDate ? new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View link */}
            <div className="text-right">
              <Link
                href={section.linkHref}
                className={`${section.linkColor} font-medium inline-flex items-center gap-2 text-sm`}
              >
                {section.linkText}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
