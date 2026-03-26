-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "category_id" TEXT;

-- CreateTable
CREATE TABLE "campaign_categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "icon" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_categories_name_key" ON "campaign_categories"("name");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "campaign_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
