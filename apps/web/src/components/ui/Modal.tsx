'use client';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            {/* Modal box */}
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
                {title && (
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500"
                        >
                            ✕
                        </button>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
