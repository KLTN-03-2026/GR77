-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_url" VARCHAR(500),
ADD COLUMN     "cover_image_url" VARCHAR(500),
ADD COLUMN     "first_name" VARCHAR(100),
ADD COLUMN     "last_name" VARCHAR(100),
ADD COLUMN     "location" VARCHAR(255),
ADD COLUMN     "pending_email" TEXT,
ADD COLUMN     "pending_email_code" TEXT,
ADD COLUMN     "pending_email_expires" TIMESTAMP(3);

