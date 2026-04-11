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
        <svg className="w-5 h-5 sm:w-7 sm:h-7 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
        <svg className="w-5 h-5 sm:w-7 sm:h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
        <svg className="w-5 h-5 sm:w-7 sm:h-7 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
        <svg className="w-5 h-5 sm:w-7 sm:h-7 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
          <div className="flex items-center gap-1.5 sm:gap-3 mb-3 sm:mb-5 pl-2 sm:pl-0">
            {section.icon}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{section.title}</h2>
          </div>

          {/* Card Container */}
          <div
            className="px-4 sm:px-8 pt-6 sm:pt-9 pb-3"
            style={{
              borderTop: `2px solid ${section.borderColor}`,
              borderLeft: `2px solid ${section.borderColor}`,
              borderRight: `2px solid ${section.borderColor}`,
              borderRadius: '1.5rem 0 0 0',
              boxShadow: `inset 0 4px 4px 0 ${section.shadowColor}`,
              background: section.bgColor,
            }}
          >
            {/* Cards — responsive carousel on mobile, grid on desktop */}
            <div className="flex sm:grid overflow-x-auto sm:overflow-visible snap-x snap-mandatory sm:snap-none flex-nowrap sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-[3%] mb-0 sm:mb-[2%] pb-2 sm:pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {section.campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`} className="block shrink-0 w-[70vw] sm:w-auto snap-center sm:snap-align-none [container-type:inline-size] [container-name:vcard]">
                  <div className="overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 hover:scale-[1.02] rounded-[5cqi]" style={{ background: 'rgba(255, 255, 255, 0.78)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255, 255, 255, 0.73)' }}>
                    <div className="relative w-full aspect-[3/2]">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="text-center flex flex-col p-[5cqi] gap-[3cqi]">
                      <h3 className="font-extrabold text-black overflow-hidden text-ellipsis whitespace-nowrap text-[7.5cqi] leading-[1.3]">
                        {campaign.title}
                      </h3>

                      <div>
                        <div className="flex items-center justify-center gap-[1.5cqi]">
                          <span className="text-slate-700 font-bold text-[5.5cqi]">Goal:</span>
                          <span className="font-black text-[#14ABD1] text-[7cqi]">
                            ${campaign.amountRaised.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-center mt-[4cqi]">
                          <div className="inline-flex items-center bg-black/[0.08] border border-black/15 text-black/70 gap-[2cqi] rounded-full p-[2cqi_4cqi] text-[5cqi]">
                            <CalendarIcon className="w-[5cqi] h-[5cqi]" />
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
            <div className="text-right mt-1 sm:mt-4 pb-1 sm:pb-2">
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
