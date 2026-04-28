'use client';

interface FooterProps {
  isAdmin?: boolean;
}

export default function Footer({ isAdmin }: FooterProps) {
  return (
    <footer className="w-full">
      {/* 11. Copyright Bar */}
      <div className={`w-full h-[88px] mt-auto flex items-center justify-center ${isAdmin ? 'bg-[linear-gradient(90deg,#7598C1_14%,#8CC1FF_60%,#58C9E0_90%)]' : 'bg-[linear-gradient(90deg,#DCB8FF_14%,#9DDFFF_60%,#2DBFF4_90%)]'}`}>
        <div className={`max-w-[1200px] mx-auto px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest drop-shadow-sm text-gray-900`}>
          © 2026 Kindlink. Connecting global generosity through blockchain.
        </div>
      </div>
    </footer>
  );
}
