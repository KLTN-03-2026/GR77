'use client';

import { mockCampaigns } from '@/lib/mock';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon } from '@heroicons/react/24/outline';
import styles from '@/components/campaign/CampaignCard.module.css';

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
      borderColor: '#f58cc2ff',
      shadowColor: '#f58cc2ff',
      bgColor: '#FFDBED',
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
      borderColor: '#76b2fdff',
      shadowColor: '#76b2fdff',
      bgColor: '#D9E5FF',
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
      borderColor: '#31b61fff',
      shadowColor: '#31b61fff',
      bgColor: '#D9F3D7',
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
      borderColor: '#C688EB',
      shadowColor: '#C688EB',
      bgColor: '#E8D9FF',
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
            className="px-8 pt-9 pb-3"
            style={{
              borderTop: `2px solid ${section.borderColor}`,
              borderLeft: `2px solid ${section.borderColor}`,
              borderRight: `2px solid ${section.borderColor}`,
              borderRadius: '1.5rem 0 0 0',
              boxShadow: `inset 0 4px 4px 0 ${section.shadowColor}`,
              background: section.bgColor,
            }}
          >
            {/* Cards — responsive grid with proportional scaling */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[3%] mb-[2%]">
              {section.campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className={`${styles.vCard} block`}>
                  <div className={`${styles.vInner} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`} style={{ background: 'rgba(255, 255, 255, 0.78)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(255, 255, 255, 0.73)' }}>
                    <div className={`${styles.vImg} relative w-full`}>
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className={`${styles.vBody} text-center flex flex-col`}>
                      <h3 className={`${styles.vTitle} font-bold text-black overflow-hidden text-ellipsis whitespace-nowrap`}>
                        {campaign.title}
                      </h3>

                      <div>
                        <div className="flex items-center justify-center" style={{ gap: '1.5cqi' }}>
                          <span className={`${styles.vLabel} text-black/60`}>Amount Raised</span>
                          <span className={`${styles.vAmount} font-bold text-black`}>
                            ${campaign.amountRaised.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-center" style={{ marginTop: '5cqi' }}>
                          <div className={`${styles.vDateBadge} inline-flex items-center bg-black/[0.08] border border-black/15 text-black/70`}>
                            <CalendarIcon />
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
            <div className="text-right mt-4 pb-2">
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
