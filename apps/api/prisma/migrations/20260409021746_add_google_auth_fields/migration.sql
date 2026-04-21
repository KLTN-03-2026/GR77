/*
  Warnings:

  - You are about to drop the column `address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `cover_image_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_locked` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_resend_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lock_reason` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `locked_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pending_email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pending_email_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pending_email_expires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verification_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verification_expires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `verification_resend_count` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `wallet_address` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `ward` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "WithdrawalMethod" AS ENUM ('WALLET', 'BANK');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- DropIndex
DROP INDEX "users_wallet_address_key";

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "target_comment_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "address",
DROP COLUMN "avatar_url",
DROP COLUMN "balance",
DROP COLUMN "cover_image_url",
DROP COLUMN "district",
DROP COLUMN "first_name",
DROP COLUMN "is_locked",
DROP COLUMN "last_name",
DROP COLUMN "last_resend_at",
DROP COLUMN "lock_reason",
DROP COLUMN "locked_at",
DROP COLUMN "pending_email",
DROP COLUMN "pending_email_code",
DROP COLUMN "pending_email_expires",
DROP COLUMN "province",
DROP COLUMN "verification_code",
DROP COLUMN "verification_expires",
DROP COLUMN "verification_resend_count",
DROP COLUMN "wallet_address",
DROP COLUMN "ward",
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "avatar_url" VARCHAR(500),
    "cover_image_url" VARCHAR(500),
    "province" VARCHAR(100),
    "district" VARCHAR(100),
    "ward" VARCHAR(100),
    "address" VARCHAR(255),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "wallet_address" TEXT,
    "nonce" TEXT,

    CONSTRAINT "user_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_security" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_at" TIMESTAMP(3),
    "lock_reason" VARCHAR(500),
    "verification_code" TEXT,
    "verification_expires" TIMESTAMP(3),
    "verification_resend_count" INTEGER NOT NULL DEFAULT 0,
    "last_resend_at" TIMESTAMP(3),
    "pending_email" TEXT,
    "pending_email_code" TEXT,
    "pending_email_expires" TIMESTAMP(3),

    CONSTRAINT "user_security_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "reason" VARCHAR(500),
    "method" "WithdrawalMethod" NOT NULL DEFAULT 'WALLET',
    "bank_name" TEXT,
    "account_number" TEXT,
    "account_owner" TEXT,
    "wallet_address" TEXT,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "tx_hash" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_images" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "caption" VARCHAR(255),
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_user_id_key" ON "user_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_wallets_wallet_address_key" ON "user_wallets"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_security_user_id_key" ON "user_security"("user_id");

-- CreateIndex
CREATE INDEX "withdrawal_requests_campaign_id_idx" ON "withdrawal_requests"("campaign_id");

-- CreateIndex
CREATE INDEX "withdrawal_requests_status_idx" ON "withdrawal_requests"("status");

-- CreateIndex
CREATE INDEX "comments_campaign_id_idx" ON "comments"("campaign_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_wallets" ADD CONSTRAINT "user_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_security" ADD CONSTRAINT "user_security_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_images" ADD CONSTRAINT "campaign_images_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_target_comment_id_fkey" FOREIGN KEY ("target_comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
