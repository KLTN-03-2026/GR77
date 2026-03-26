/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `campaign_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "campaign_categories" ADD COLUMN     "slug" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_categories_slug_key" ON "campaign_categories"("slug");
