-- AlterEnum
ALTER TYPE "LedgerEntryType" ADD VALUE 'WITHDRAWAL_OUT';

-- AlterEnum
ALTER TYPE "WithdrawalStatus" ADD VALUE 'DISBURSED';

-- AlterTable
ALTER TABLE "campaign_fund_ledger" ADD COLUMN     "tx_hash" VARCHAR(150),
ADD COLUMN     "withdrawal_request_id" TEXT;

-- AlterTable
ALTER TABLE "withdrawal_requests" ADD COLUMN     "admin_note" VARCHAR(500),
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "bank_transfer_proof" VARCHAR(1000),
ADD COLUMN     "exchange_rate" DECIMAL(18,4),
ADD COLUMN     "onchain_tx_hash" VARCHAR(150),
ADD COLUMN     "pol_amount" DECIMAL(28,10),
ALTER COLUMN "tx_hash" SET DATA TYPE VARCHAR(150);

-- CreateIndex
CREATE INDEX "campaign_fund_ledger_withdrawal_request_id_idx" ON "campaign_fund_ledger"("withdrawal_request_id");

-- AddForeignKey
ALTER TABLE "campaign_fund_ledger" ADD CONSTRAINT "campaign_fund_ledger_withdrawal_request_id_fkey" FOREIGN KEY ("withdrawal_request_id") REFERENCES "withdrawal_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
