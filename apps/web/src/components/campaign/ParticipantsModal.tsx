'use client';

import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Participant {
    id: string;
    userId: string;
    name: string;
    avatarUrl?: string;
    status: 'JOINED' | 'LEFT';
    joinedAt: string;
    leftAt?: string;
}

interface ParticipantsModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignId: string;
}

export function ParticipantsModal({ isOpen, onClose, campaignId }: ParticipantsModalProps) {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'JOINED' | 'LEFT'>('ALL');

    useEffect(() => {
        if (isOpen && campaignId) {
            fetchParticipants();
        }
    }, [isOpen, campaignId]);

    const fetchParticipants = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/campaigns/${campaignId}/participants`);
            if (!res.ok) throw new Error('Failed to load participants');
            const data = await res.json();
            setParticipants(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = participants.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'ALL' || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    const activeMembers = filteredParticipants.filter(p => p.status === 'JOINED');
    const leftMembers = filteredParticipants.filter(p => p.status === 'LEFT');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Members" maxWidth="max-w-md">
            <div className="space-y-4">
                {/* ─── Search & Filter Controls ─────────────────────── */}
                <div className="space-y-3 pt-0 pb-1 border-b border-gray-100">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex gap-2">
                        {[
                            { id: 'ALL', label: 'All' },
                            { id: 'JOINED', label: 'Active' },
                            { id: 'LEFT', label: 'Left' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilter(btn.id as any)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === btn.id
                                    ? 'bg-[#0891B2] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── List Container ───────────────────────────────── */}
                <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#0891B2 transparent'
                }}>
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2 text-gray-500 text-sm">Loading...</span>
                        </div>
                    )}
                    {error && <p className="text-center text-red-500 py-4 text-sm">{error}</p>}

                    {!loading && !error && filteredParticipants.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-3xl mb-2">🔍</div>
                            <p className="text-gray-500 font-medium">No results found.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setFilter('ALL'); }}
                                className="text-[#0891B2] text-xs font-bold mt-2 hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}

                    {!loading && activeMembers.length > 0 && (
                        <>
                            {(filter === 'ALL' || filter === 'JOINED') && (
                                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-1 pb-1">
                                    Active Members ({activeMembers.length})
                                </div>
                            )}
                            {activeMembers.map((p) => (
                                <ParticipantRow key={p.id} participant={p} />
                            ))}
                        </>
                    )}

                    {!loading && leftMembers.length > 0 && (
                        <>
                            {(filter === 'ALL' || filter === 'LEFT') && (
                                <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest px-1 pt-3 pb-1">
                                    Left History ({leftMembers.length})
                                </div>
                            )}
                            {leftMembers.map((p) => (
                                <ParticipantRow key={p.id} participant={p} />
                            ))}
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function ParticipantRow({ participant: p }: { participant: Participant }) {
    return (
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${p.status === 'LEFT' ? 'opacity-60' : 'hover:bg-gray-50'}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 overflow-hidden shrink-0 border border-cyan-200">
                {p.avatarUrl ? (
                    <Image
                        src={p.avatarUrl}
                        alt={p.name}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-cyan-600 font-bold text-sm">
                        {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                    <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'JOINED' ? 'bg-green-500' : 'bg-red-400'}`}></span>
                        <span>
                            {p.status === 'JOINED' ? 'Member since' : 'Left'}{' '}
                            {new Date(p.status === 'LEFT' && p.leftAt ? p.leftAt : p.joinedAt).toLocaleString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour12: true
                            })}
                        </span>
                    </div>
                </div>
            </div>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'JOINED'
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-red-50 text-red-400 border border-red-200'
                }`}>
                {p.status === 'JOINED' ? 'Active' : 'Left'}
            </div>
        </div>
    );
}
