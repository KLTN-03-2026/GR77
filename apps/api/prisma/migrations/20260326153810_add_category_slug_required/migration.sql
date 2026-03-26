/*
  Warnings:

  - Made the column `slug` on table `campaign_categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "campaign_categories" ALTER COLUMN "slug" SET NOT NULL;
