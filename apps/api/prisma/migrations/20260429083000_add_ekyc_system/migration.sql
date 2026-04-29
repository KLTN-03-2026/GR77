-- CreateEnum
CREATE TYPE "EkycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "user_ekyc" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "EkycStatus" NOT NULL DEFAULT 'PENDING',
    "id_number" VARCHAR(20),
    "full_name" VARCHAR(255),
    "dob" VARCHAR(20),
    "gender" VARCHAR(10),
    "address" VARCHAR(500),
    "front_image_url" VARCHAR(500),
    "back_image_url" VARCHAR(500),
    "selfie_image_url" VARCHAR(500),
    "rejection_reason" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_ekyc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_ekyc_user_id_key" ON "user_ekyc"("user_id");

-- AddForeignKey
ALTER TABLE "user_ekyc" ADD CONSTRAINT "user_ekyc_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
