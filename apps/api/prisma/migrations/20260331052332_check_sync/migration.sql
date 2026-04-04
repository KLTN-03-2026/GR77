/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `cover_image_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pending_email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pending_email_code` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `pending_email_expires` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar_url",
DROP COLUMN "cover_image_url",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "location",
DROP COLUMN "pending_email",
DROP COLUMN "pending_email_code",
DROP COLUMN "pending_email_expires";
