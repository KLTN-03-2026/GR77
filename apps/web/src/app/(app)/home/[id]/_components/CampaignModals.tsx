import { DonateModal } from "@/components/campaign/DonateModal";
import { ReportModal } from "@/components/campaign/ReportModal";

interface CampaignModalsProps {
    donateOpen: boolean;
    setDonateOpen: (open: boolean) => void;
    donateAmount: string;
    setDonateAmount: (amount: string) => void;
    isDonating: boolean;
    donated: boolean;
    setDonated: (donated: boolean) => void;
    donationMethod: "PAYOS" | "BLOCKCHAIN";
    setDonationMethod: (method: "PAYOS" | "BLOCKCHAIN") => void;
    blockchainLoading: boolean;
    blockchainError: string | null;
    setBlockchainError: (val: string | null) => void;
    handleDonate: () => void;
    handleBlockchainDonate: (amountVnd: number, forceDemo?: boolean) => void;
    QUICK_AMOUNTS: number[];
    message: string;
    setMessage: (val: string) => void;

    reportModalOpen: boolean;
    setReportModalOpen: (open: boolean) => void;
    reportReason: string;
    setReportReason: (reason: string) => void;
    handleReportComment: () => void;
}

export function CampaignModals({
    donateOpen,
    setDonateOpen,
    donateAmount,
    setDonateAmount,
    isDonating,
    donated,
    setDonated,
    donationMethod,
    setDonationMethod,
    blockchainLoading,
    blockchainError,
    setBlockchainError,
    handleDonate,
    handleBlockchainDonate,
    QUICK_AMOUNTS,
    message,
    setMessage,

    reportModalOpen,
    setReportModalOpen,
    reportReason,
    setReportReason,
    handleReportComment,
}: CampaignModalsProps) {
    return (
        <>
            <DonateModal
                donateOpen={donateOpen}
                setDonateOpen={setDonateOpen}
                donateAmount={donateAmount}
                setDonateAmount={setDonateAmount}
                isDonating={isDonating}
                donated={donated}
                setDonated={setDonated}
                donationMethod={donationMethod}
                setDonationMethod={setDonationMethod}
                blockchainLoading={blockchainLoading}
                blockchainError={blockchainError}
                setBlockchainError={setBlockchainError}
                handleDonate={handleDonate}
                handleBlockchainDonate={handleBlockchainDonate}
                QUICK_AMOUNTS={QUICK_AMOUNTS}
                message={message}
                setMessage={setMessage}
            />

            <ReportModal
                reportModalOpen={reportModalOpen}
                setReportModalOpen={setReportModalOpen}
                reportReason={reportReason}
                setReportReason={setReportReason}
                handleReportComment={handleReportComment}
            />
        </>
    );
}
