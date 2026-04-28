'use client';

import { Bars3CenterLeftIcon } from '@heroicons/react/24/outline';
import { useCampaigns } from './useCampaigns';
import CampaignFilterBar from './CampaignFilterBar';
import CampaignCard from './CampaignCard';
import Pagination from './Pagination';

export default function ListCampaignsPage() {
    const {
        search,
        setSearch,
        startDateFilter,
        setStartDateFilter,
        endDateFilter,
        setEndDateFilter,
        selectedCategory,
        setSelectedCategory,
        categories,
        isLoading,
        error,
        filtered,
        paginated,
        currentPage,
        totalPages,
        handlePageChange,
        favoriteIds,
        handleFavoriteToggle,
    } = useCampaigns();

    return (
        <div className="w-full">
            {/* Page header */}
            <div className="mb-4 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2">
                    <Bars3CenterLeftIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[#0891B2]" />
                    List Campaigns
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 ml-7 sm:ml-9">Explore and support active campaigns</p>
            </div>

            {/* Search + filter bar */}
            <CampaignFilterBar
                search={search}
                onSearchChange={setSearch}
                startDate={startDateFilter}
                onStartDateChange={setStartDateFilter}
                endDate={endDateFilter}
                onEndDateChange={setEndDateFilter}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
            />

            <p className="text-[10px] sm:text-sm text-gray-500 mb-2 sm:mb-4">
                Showing {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
                {search ? ` matching "${search}"` : ''}
            </p>

            {isLoading ? (
                <div className="flex flex-col justify-center items-center py-24 mb-14 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0891B2]"></div>
                    <p className="text-gray-400 font-medium text-sm">Loading campaigns...</p>
                </div>
            ) : error ? (
                <div className="flex justify-center items-center py-24 mb-14 text-red-500 font-medium text-lg border-2 border-dashed border-red-200 rounded-2xl bg-red-50">
                    {error}
                </div>
            ) : paginated.length > 0 ? (
                <>
                    <div className="flex flex-col gap-5 sm:gap-6 mb-8">
                        {paginated.map((campaign) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                isFavorited={favoriteIds.has(campaign.id)}
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-gray-100 border-dashed">
                    <Bars3CenterLeftIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-500 mb-2 uppercase tracking-tight">No campaigns found</h2>
                    <p className="text-gray-400 font-medium">Try adjusting your search or filter.</p>
                </div>
            )}
        </div>
    );
}
