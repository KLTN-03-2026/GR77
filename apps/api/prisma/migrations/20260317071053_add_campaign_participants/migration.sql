-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('JOINED', 'LEFT');

-- CreateTable
CREATE TABLE "campaign_participants" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'JOINED',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_participants_user_id_idx" ON "campaign_participants"("user_id");

-- CreateIndex
CREATE INDEX "campaign_participants_campaign_id_idx" ON "campaign_participants"("campaign_id");

-- CreateIndex
CREATE INDEX "campaign_participants_user_id_status_idx" ON "campaign_participants"("user_id", "status");

-- CreateIndex
CREATE INDEX "campaign_participants_campaign_id_status_idx" ON "campaign_participants"("campaign_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_participants_user_id_campaign_id_key" ON "campaign_participants"("user_id", "campaign_id");

-- AddForeignKey
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_participants" ADD CONSTRAINT "campaign_participants_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
