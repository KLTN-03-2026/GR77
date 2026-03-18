import Image from 'next/image';

interface LogoProps {
    variant?: 'default' | 'admin';
    width?: number;
    height?: number;
    className?: string;
}

const LOGO_MAP = {
    default: '/images/logo.svg',
    admin: '/images/admlogo.svg',
} as const;

export default function Logo({
    variant = 'default',
    width,
    height = 40,
    className = '',
}: LogoProps) {
    const src = LOGO_MAP[variant];

    return (
        <div className="notranslate select-none" translate="no">
            <Image
                src={src}
                alt="Kindlink Logo"
                width={width ?? height * 3}
                height={height}
                priority
                className={`object-contain ${className}`}
            />
        </div>
    );
}