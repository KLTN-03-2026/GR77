/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `donations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[wallet_address]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payment_method` to the `donations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('TOPUP', 'WITHDRAW', 'DONATION');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');

-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYOS';

-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'PAYOS';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ORGANIZER';

-- AlterTable
ALTER TABLE "donations" DROP COLUMN "paymentMethod",
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "is_locked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_resend_at" TIMESTAMP(3),
ADD COLUMN     "lock_reason" VARCHAR(500),
ADD COLUMN     "locked_at" TIMESTAMP(3),
ADD COLUMN     "verification_code" TEXT,
ADD COLUMN     "verification_expires" TIMESTAMP(3),
ADD COLUMN     "verification_resend_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "wallet_address" TEXT;

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "order_id" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_view_histories" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_view_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "link" VARCHAR(500),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "submitter_id" TEXT NOT NULL,
    "target_user_id" TEXT,
    "target_campaign_id" TEXT,
    "reason" VARCHAR(500) NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_action_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "details" TEXT,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_transactions_order_id_key" ON "wallet_transactions"("order_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_user_id_idx" ON "wallet_transactions"("user_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");

-- CreateIndex
CREATE INDEX "wallet_transactions_status_idx" ON "wallet_transactions"("status");

-- CreateIndex
CREATE INDEX "campaign_view_histories_campaign_id_idx" ON "campaign_view_histories"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_view_histories_user_id_viewed_at_idx" ON "campaign_view_histories"("user_id", "viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_view_histories_user_id_campaign_id_key" ON "campaign_view_histories"("user_id", "campaign_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "user_action_logs_action_idx" ON "user_action_logs"("action");

-- CreateIndex
CREATE INDEX "user_action_logs_user_id_idx" ON "user_action_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_view_histories" ADD CONSTRAINT "campaign_view_histories_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_view_histories" ADD CONSTRAINT "campaign_view_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_campaign_id_fkey" FOREIGN KEY ("target_campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_action_logs" ADD CONSTRAINT "user_action_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
