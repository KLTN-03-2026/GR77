-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MOMO', 'VNPAY', 'BANK_TRANSFER', 'WALLET', 'CRYPTO');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MOMO', 'VNPAY', 'INTERNAL', 'BLOCKCHAIN');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('DONATION_IN', 'REFUND_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "current_raised_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "donation_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "campaign_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "message" VARCHAR(500),
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "donated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "donation_id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "order_id" VARCHAR(100) NOT NULL,
    "request_id" VARCHAR(100) NOT NULL,
    "partner_code" VARCHAR(100),
    "trans_id" VARCHAR(100),
    "request_type" VARCHAR(50),
    "amount" DECIMAL(18,2) NOT NULL,
    "pay_url" VARCHAR(1000),
    "deeplink" VARCHAR(1000),
    "qr_code_url" VARCHAR(1000),
    "result_code" INTEGER,
    "response_time" TIMESTAMP(3),
    "raw_create_response" JSONB,
    "raw_ipn_payload" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_fund_ledger" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "donation_id" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "note" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_fund_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "donations_user_id_idx" ON "donations"("user_id");

-- CreateIndex
CREATE INDEX "donations_campaign_id_idx" ON "donations"("campaign_id");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_campaign_id_status_idx" ON "donations"("campaign_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_order_id_key" ON "payment_transactions"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_request_id_key" ON "payment_transactions"("request_id");

-- CreateIndex
CREATE INDEX "payment_transactions_donation_id_idx" ON "payment_transactions"("donation_id");

-- CreateIndex
CREATE INDEX "payment_transactions_provider_idx" ON "payment_transactions"("provider");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_order_id_idx" ON "payment_transactions"("order_id");

-- CreateIndex
CREATE INDEX "campaign_fund_ledger_campaign_id_idx" ON "campaign_fund_ledger"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_fund_ledger_donation_id_idx" ON "campaign_fund_ledger"("donation_id");

-- CreateIndex
CREATE INDEX "campaign_fund_ledger_campaign_id_type_idx" ON "campaign_fund_ledger"("campaign_id", "type");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_fund_ledger" ADD CONSTRAINT "campaign_fund_ledger_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_fund_ledger" ADD CONSTRAINT "campaign_fund_ledger_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
