/*
  Warnings:

  - You are about to drop the `campaign_updates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "campaign_updates" DROP CONSTRAINT "campaign_updates_campaign_id_fkey";

-- DropTable
DROP TABLE "campaign_updates";

-- CreateTable
CREATE TABLE "campaign_news" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_news_campaign_id_idx" ON "campaign_news"("campaign_id");

-- AddForeignKey
ALTER TABLE "campaign_news" ADD CONSTRAINT "campaign_news_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
