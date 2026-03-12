'use client';

import { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { UserGroupIcon, UserIcon } from '@heroicons/react/24/solid';

// Interface 
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Donor' | 'Admin' | 'Organizer';
  walletAddress: string;
  kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Unverified';
  totalContributed: number;
  avatarUrl?: string;
  createdAt?: string;
}

const mockUsers: UserData[] = [
  { id: '1', name: 'Hiếu', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '2', name: 'Tiên', email: 'Email : .........', role: 'Admin', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '3', name: 'Trà My', email: 'Email : .........', role: 'Organizer', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '4', name: 'An', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '5', name: 'Vương', email: 'Email : .........', role: 'Organizer', walletAddress: '0x12365789', kycStatus: 'Pending', totalContributed: 15800 },
  { id: '6', name: 'Tiên', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '7', name: 'Hiếu', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Pending', totalContributed: 15800 },
  { id: '8', name: 'Hiếu', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '9', name: 'Tiên', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '10', name: 'Trà My', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
  { id: '11', name: 'Trà My', email: 'Email : .........', role: 'Donor', walletAddress: '0x12365789', kycStatus: 'Verified', totalContributed: 15800 },
];

function Avatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
      {/* Cartoon-ish avatar roughly matching the circular icon */}
      <svg className="w-full h-full text-gray-500 mt-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Role: All');
  const [statusFilter, setStatusFilter] = useState('Status: All');

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      // 1. Keyword search (Name, Email, Role, Wallet, Status)
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q);

      // 2. Role filter
      const matchesRole = roleFilter === 'Role: All' || user.role === roleFilter;

      // 3. Status filter
      const matchesStatus = statusFilter === 'Status: All' || user.kycStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchQuery, roleFilter, statusFilter]);

  return (
    <div className="space-y-6">

      {/* ── STAT CARDS ── */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Card 1: Total Users */}
        <div className="flex items-center gap-5 p-6 rounded-2xl flex-1 border border-gray-200 shadow-sm bg-gradient-to-b from-[#bde2fd] to-white">
          <div className="flex-shrink-0">
            <UserGroupIcon className="w-14 h-14 text-black" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Total Users</p>
            <p className="text-4xl font-extrabold text-black leading-tight">5,240</p>
          </div>
        </div>

        {/* Card 2: Verified Organizers */}
        <div className="flex items-center gap-5 p-6 rounded-2xl flex-1 border border-gray-200 shadow-sm bg-gradient-to-b from-[#bde2fd] to-white">
          <div className="flex-shrink-0 relative">
            <UserIcon className="w-14 h-14 text-black" />
            {/* Small checkmark badge overlay */}
            <div className="absolute bottom-0 right-[-4px] bg-white rounded-full p-0.5 border-2 border-white">
              <div className="bg-black rounded-full p-1" style={{ width: 22, height: 22 }}>
                <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Verified Organizers</p>
            <p className="text-4xl font-extrabold text-black leading-tight">124</p>
          </div>
        </div>
      </div>

      {/* ── USERS TABLE ── */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">

        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#47c9e5] font-bold" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search user by name, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-64 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 font-medium placeholder:text-gray-400"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-1.5 px-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option>Role: All</option>
            <option>Donor</option>
            <option>Admin</option>
            <option>Organizer</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option>Status: All</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>

          {/* Add Button */}
          <button className="ml-auto bg-[#3182ce] hover:bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
            Add New User
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-300">
                <th className="px-5 py-3 font-bold text-black border-r border-gray-300 w-[250px]">User</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Role</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Wallet Address</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">KYC Status</th>
                <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Total Contributed</th>
                <th className="px-4 py-3 font-bold text-black text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 border-r border-gray-300">
                      <div className="flex items-center gap-3">
                        <Avatar />
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-gray-600 text-[13px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300 align-middle text-center sm:text-left">{user.role}</td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300 font-mono text-[13px]">{user.walletAddress}</td>
                    <td className="px-4 py-3 border-r border-gray-300">
                      {user.kycStatus === 'Verified' ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#c6f6d5] text-green-800 text-[13px] font-medium border border-green-200">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#fbd38d] text-yellow-900 text-[13px] font-medium border border-yellow-300">
                          {user.kycStatus}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300">${user.totalContributed.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-500 font-bold tracking-widest cursor-pointer hover:text-gray-900 select-none">
                      ...
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-500 bg-[#fbfbfb]">
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
