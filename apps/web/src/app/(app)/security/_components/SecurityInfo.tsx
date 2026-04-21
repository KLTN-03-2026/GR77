'use client';

import { 
  ShieldCheckIcon, 
  LockClosedIcon, 
  EyeSlashIcon, 
  FingerPrintIcon,
  KeyIcon 
} from '@heroicons/react/24/outline';

export function SecurityInfo() {
  const securityTips = [
    { icon: LockClosedIcon, title: 'Use a strong password', desc: 'Mix uppercase, lowercase, numbers and symbols' },
    { icon: EyeSlashIcon, title: 'Never share your password', desc: 'Keep it private and don\'t reuse across sites' },
    { icon: FingerPrintIcon, title: 'Use unique passwords', desc: 'Each account should have its own password' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Security Tips */}
      <div className="bg-[#98F4C1]/50 rounded-2xl shadow-sm border-none p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-gray-900" />
          Security Tips
        </h3>
        <div className="space-y-4">
          {securityTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="p-2 bg-white/60 rounded-lg flex-shrink-0 shadow-sm">
                <tip.icon className="w-4 h-4 text-gray-800" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{tip.title}</p>
                <p className="text-[11px] text-gray-700 mt-0.5 leading-relaxed font-medium">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Password Requirements */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <KeyIcon className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs font-bold text-amber-900">Password Requirements</p>
        </div>
        <ul className="text-[11px] text-amber-800 space-y-1.5 leading-relaxed">
          <li>• At least 8 characters long</li>
          <li>• Contains uppercase letter (A-Z)</li>
          <li>• Contains a number (0-9)</li>
          <li>• Contains a special character (!@#$...)</li>
          <li>• Cannot reuse your current password</li>
        </ul>
      </div>
    </div>
  );
}
