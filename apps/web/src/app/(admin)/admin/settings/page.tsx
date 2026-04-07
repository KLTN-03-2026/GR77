"use client";

import React, { useState, useEffect } from "react";
import { useAdminLanguage } from "@/contexts/AdminLanguageContext";
import {
  GlobeAltIcon,
  CpuChipIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  WalletIcon,
  Cog8ToothIcon,
  CheckBadgeIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { Wallet, Settings, ShieldCheck, AlertTriangle, Coins, ArrowRightLeft, LayoutGrid, CheckCircle2, XCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { KINDLINK_CAMPAIGN_ABI, KINDLINK_CAMPAIGN_ADDRESS, AMOY_NETWORK_CONFIG } from '@/constants/blockchain';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AdminSettingsPage() {
  const { language, setLanguage, translate } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState<"general" | "blockchain" | "payment" | "notifications">("general");
  const [showSaved, setShowSaved] = useState(false);

  // Confirmation Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ title: string; desc: string; action: () => void } | null>(null);

  // Blockchain States
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [adminAddress, setAdminAddress] = useState<string>("");
  const [contract, setContract] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState<string>("0");
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [platformWallet, setPlatformWallet] = useState<string>("");
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);
  const [newFee, setNewFee] = useState<string>("");
  const [newWallet, setNewWallet] = useState<string>("");

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setStatusMessage({ type: "error", text: "Vui lòng cài đặt MetaMask!" });
      return;
    }
    setIsLoading(true);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const network = await _provider.getNetwork();
      if (Number(network.chainId) !== 80002) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: AMOY_NETWORK_CONFIG.chainId }],
          });
        } catch (err: any) {
          if (err.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [AMOY_NETWORK_CONFIG],
            });
          }
        }
      }
      const _signer = await _provider.getSigner();
      const address = await _signer.getAddress();
      const _contract = new ethers.Contract(KINDLINK_CAMPAIGN_ADDRESS, KINDLINK_CAMPAIGN_ABI, _signer);
      setProvider(_provider);
      setSigner(_signer);
      setAdminAddress(address);
      setContract(_contract);
      const owner = await _contract.owner();
      setIsOwner(address.toLowerCase() === owner.toLowerCase());
      await refreshData(_contract, _provider);
      setStatusMessage({ type: "success", text: "Đã kết nối ví Admin!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Lỗi kết nối ví" });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async (c: any, p: any) => {
    try {
      const balance = await p.getBalance(KINDLINK_CAMPAIGN_ADDRESS);
      setContractBalance(ethers.formatEther(balance));
      const fee = await c.platformFeeBps();
      setPlatformFee(Number(fee) / 100);
      const wallet = await c.platformWallet();
      setPlatformWallet(wallet);
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

  const executeUpdateFee = async () => {
    if (!contract || !newFee) {
      setStatusMessage({ type: "info", text: "Giao dịch đã xác nhận thành công! (Phiên bản Demo)" });
      return;
    }
    setIsLoading(true);
    setStatusMessage({ type: "info", text: "Đang yêu cầu cập nhật phí..." });
    try {
      const feeBps = Math.floor(Number(newFee) * 100);
      const tx = await contract.setPlatformFee(feeBps);
      await tx.wait();
      await refreshData(contract, provider);
      setStatusMessage({ type: "success", text: `Đã cập nhật phí lên ${newFee}%!` });
      setNewFee("");
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Lỗi giao dịch" });
    } finally {
      setIsLoading(false);
    }
  };

  const executeUpdateWallet = async () => {
    if (!contract || !newWallet) {
      setStatusMessage({ type: "info", text: "Đã xác nhận chuyển ví thành công! (Phiên bản Demo)" });
      return;
    }
    setIsLoading(true);
    setStatusMessage({ type: "info", text: "Đang thay đổi ví nhận doanh thu..." });
    try {
      const tx = await contract.setPlatformWallet(newWallet);
      await tx.wait();
      await refreshData(contract, provider);
      setStatusMessage({ type: "success", text: "Đã cập nhật ví nhận doanh thu thành công!" });
      setNewWallet("");
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Lỗi giao dịch" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFee = () => {
    setModalConfig({
      title: "Xác nhận Thay đổi Phí",
      desc: "Bạn đang yêu cầu thay đổi mức phí nền tảng trên Blockchain. Hành động này sẽ ảnh hưởng đến tất cả các giao dịch quyên góp trong tương lai và không thể hoàn tác.",
      action: executeUpdateFee
    });
    setIsModalOpen(true);
  };

  const handleUpdateWallet = () => {
    setModalConfig({
      title: "Xác nhận Thay đổi Ví",
      desc: "Bạn đang thay đổi địa chỉ ví nhận doanh thu của Kindlink trên hệ thống Polygon. Hãy chắc chắn rằng bạn kiểm soát ví mới để đảm bảo dòng tiền được an toàn.",
      action: executeUpdateWallet
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen relative text-black">

      {/* Confirmation Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border-none animate-in zoom-in slide-in-from-bottom-8 duration-500 text-black">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-5 bg-amber-50 rounded-full">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-normal tracking-tight uppercase">{modalConfig?.title}</h3>
                <p className="text-[13px] font-normal text-gray-400 leading-relaxed">{modalConfig?.desc}</p>
              </div>
              <div className="flex gap-4 w-full pt-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-50 text-black font-medium rounded-3xl hover:bg-gray-100 transition-all uppercase text-[9px] tracking-widest">Hủy bỏ</button>
                <button onClick={() => { modalConfig?.action(); setIsModalOpen(false); }} className="flex-1 py-4 bg-black text-white font-medium rounded-3xl hover:opacity-80 transition-all shadow-md uppercase text-[9px] tracking-widest">Xác nhận & Ký kết</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Tabs */}
      <aside className="w-full lg:w-72 flex flex-col gap-2">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === "general"
              ? "bg-[#24305E] text-white shadow-md font-medium"
              : "bg-white text-gray-500 hover:bg-gray-50 hover:text-black font-normal shadow-sm"
            }`}
        >
          <GlobeAltIcon className="w-5 h-5" />
          {translate("settings.language")}
        </button>
        <button
          onClick={() => setActiveTab("blockchain")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === "blockchain"
              ? "bg-[#24305E] text-white shadow-md font-medium"
              : "bg-white text-gray-500 hover:bg-gray-50 hover:text-black font-normal shadow-sm"
            }`}
        >
          <CpuChipIcon className="w-5 h-5" />
          Blockchain Setup
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === "payment"
              ? "bg-[#24305E] text-white shadow-md font-medium"
              : "bg-white text-gray-500 hover:bg-gray-50 hover:text-black font-normal shadow-sm"
            }`}
        >
          <CreditCardIcon className="w-5 h-5" />
          Payment Gateway
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === "notifications"
              ? "bg-[#24305E] text-white shadow-md font-medium"
              : "bg-white text-gray-500 hover:bg-gray-50 hover:text-black font-normal shadow-sm"
            }`}
        >
          <BellIcon className="w-5 h-5" />
          Email & Alert
        </button>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 space-y-6">
        {activeTab === "general" && (
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm max-w-2xl animate-in fade-in zoom-in duration-500 text-black">
            <h2 className="text-xl font-normal text-black mb-8 flex items-center gap-3 tracking-tight uppercase">
              <GlobeAltIcon className="w-7 h-7 text-black" />
              Thiết lập ngôn ngữ
            </h2>
            <p className="text-gray-400 text-[13px] mb-6 font-normal leading-relaxed border-l-2 border-gray-100 pl-4">
              {translate("settings.language.desc")}
            </p>
            <div className="space-y-4 mb-10">
              <label onClick={() => setLanguage("vi")} className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all ${language === "vi" ? "bg-black text-white shadow-md" : "bg-gray-50/50 hover:bg-gray-100/50"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full overflow-hidden">
                    <img src="https://flagcdn.com/w80/vn.png" alt="VN" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium tracking-tight text-sm">{translate("settings.language.vi")}</span>
                </div>
                <div className={`w-3 h-3 rounded-full border-2 ${language === "vi" ? 'border-white bg-white' : 'border-gray-200 bg-white'}`} />
              </label>
              <label onClick={() => setLanguage("en")} className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all ${language === "en" ? "bg-black text-white shadow-md" : "bg-gray-50/50 hover:bg-gray-100/50"}`}>
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full overflow-hidden">
                    <img src="https://flagcdn.com/w80/us.png" alt="US" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-medium tracking-tight text-sm">{translate("settings.language.en")}</span>
                </div>
                <div className={`w-3 h-3 rounded-full border-2 ${language === "en" ? 'border-white bg-white' : 'border-gray-200 bg-white'}`} />
              </label>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleSave} className="px-10 py-4 bg-black text-white font-medium rounded-2xl shadow-sm hover:opacity-80 active:scale-95 transition-all text-[10px] tracking-widest uppercase">
                {translate("settings.save")}
              </button>
              {showSaved && <span className="text-gray-400 font-normal text-xs animate-in zoom-in uppercase tracking-widest ml-2">{translate("settings.saved")}</span>}
            </div>
          </div>
        )}

        {activeTab === "blockchain" && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500 text-black">
            {/* Blockchain Header Card */}
            <div className="bg-black rounded-[3rem] p-10 text-white shadow-md relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[8px] font-medium uppercase tracking-[0.2em] text-white/60">Core Config</span>
                    <span className="px-2.5 py-1 bg-white/20 text-white rounded-lg text-[8px] font-bold uppercase tracking-widest">Network: Amoy</span>
                  </div>
                  <h2 className="text-3xl font-normal tracking-tighter uppercase">Blockchain Hub</h2>
                  <p className="text-white/40 font-normal text-[13px] max-w-sm">Quản lý các thông số cốt lõi của Smart Contract một cách an toàn và minh bạch.</p>
                </div>
                <button onClick={connectWallet} className="px-8 py-5 bg-white text-black font-medium rounded-3xl shadow-sm hover:bg-gray-100 transition-all flex items-center gap-3 text-sm">
                  <WalletIcon className="w-5 h-5" />
                  {adminAddress ? `${adminAddress.slice(0, 6)}...${adminAddress.slice(-4)}` : 'Connect Core Wallet'}
                </button>
              </div>
            </div>

            {/* Status Feedback */}
            {statusMessage && (
              <div className={`p-5 rounded-[2rem] shadow-sm flex items-center gap-4 ${statusMessage.type === 'success' ? 'bg-gray-50 text-black' : 'bg-red-50 text-red-600'}`}>
                {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span className="font-medium text-[13px]">{statusMessage.text}</span>
              </div>
            )}

            {/* Settings Cards (Horizontal Layout) */}
            <div className="grid grid-cols-1 gap-8 max-w-4xl">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-none group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-2.5 bg-gray-50 rounded-2xl text-black">
                        <ShieldCheckIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Thu phí nền tảng</h3>
                    </div>
                    <div className="flex items-end gap-2 pl-2">
                      <span className="text-6xl font-normal text-black tracking-tighter">{platformFee}</span>
                      <span className="text-lg font-normal text-gray-200 mb-2">%</span>
                    </div>
                  </div>

                  <div className="space-y-4 w-full md:w-auto md:min-w-[320px]">
                    <p className="text-[8px] font-medium text-gray-300 uppercase tracking-[0.3em] pl-1">Thay đổi mức phí</p>
                    <div className="flex gap-2">
                      <input type="number" value={newFee} onChange={(e) => setNewFee(e.target.value)} placeholder="0 - 10" className="flex-1 bg-gray-50 border-none focus:ring-1 focus:ring-black rounded-2xl px-6 py-4 font-normal text-base" />
                      <button onClick={handleUpdateFee} disabled={isLoading || !newFee} className="px-8 py-4 bg-black text-white font-medium rounded-2xl text-[9px] uppercase tracking-widest disabled:opacity-20 hover:opacity-80 transition-all shadow-sm whitespace-nowrap flex-shrink-0">Update</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border-none group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-2.5 bg-gray-50 rounded-2xl text-black">
                        <WalletIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Ví nhận doanh thu</h3>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-2xl">
                      <p className="text-[10px] font-mono font-medium text-gray-300 break-all">{platformWallet || 'Đang quét ví...'}</p>
                    </div>
                  </div>

                  <div className="space-y-4 w-full md:w-auto md:min-w-[400px]">
                    <p className="text-[8px] font-medium text-gray-300 uppercase tracking-[0.3em] pl-1">Chỉ định địa chỉ mới</p>
                    <div className="flex gap-2">
                      <input type="text" value={newWallet} onChange={(e) => setNewWallet(e.target.value)} placeholder="0x..." className="flex-1 bg-gray-50 border-none focus:ring-1 focus:ring-black rounded-2xl px-6 py-4.5 font-mono font-medium text-[11px]" />
                      <button onClick={handleUpdateWallet} disabled={isLoading || !newWallet} className="px-8 py-5 bg-black text-white font-medium rounded-2xl text-[9px] uppercase tracking-widest disabled:opacity-20 hover:opacity-80 transition-all shadow-sm whitespace-nowrap flex-shrink-0">Sync</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Minimal Info Text */}
            <div className="px-10 py-5 flex items-start gap-4 opacity-30">
              <AlertTriangle className="w-4 h-4 text-black flex-shrink-0" />
              <p className="text-[10px] font-normal text-black leading-relaxed max-w-2xl uppercase tracking-widest font-bold">Security Notice: Contract changes are permanent. Owner wallet required.</p>
            </div>
          </div>
        )}

        {(activeTab === "payment" || activeTab === "notifications") && (
          <div className="bg-white rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center space-y-6 shadow-sm animate-in fade-in duration-700">
            <div className="p-6 bg-gray-50 rounded-full opacity-30">
              <PlusCircleIcon className="w-10 h-10 text-black" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-normal text-black uppercase tracking-[0.4em] mb-1">Coming Soon</h3>
              <p className="text-gray-300 font-normal text-[11px]">Tính năng này đang được phát triển để nâng cao trải nghiệm quản trị của bạn.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
