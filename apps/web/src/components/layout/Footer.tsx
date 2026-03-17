'use client';

interface FooterProps {
  isAdmin?: boolean;
}

export default function Footer({ isAdmin }: FooterProps) {
  return (
    <footer className="w-full">
      {/* 11. Copyright Bar */}
      <div className={`w-full h-[88px] mt-auto flex items-center justify-center ${isAdmin ? 'bg-[linear-gradient(90deg,#7598C1_14%,#8CC1FF_60%,#58C9E0_90%)]' : 'bg-gradient-to-r from-[#F04D8C] via-[#F6BDD6] to-[#00AEEF]'}`}>
        <div className={`max-w-[1200px] mx-auto px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest drop-shadow-sm ${isAdmin ? 'text-gray-900' : 'text-white'}`}>
          © 2026 Kindlink. Connecting global generosity through blockchain.
        </div>
      </div>
    </footer>
  );
}
