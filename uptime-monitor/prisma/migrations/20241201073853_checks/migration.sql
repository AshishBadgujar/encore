-- CreateTable
CREATE TABLE "Check" (
    "id" BIGSERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "up" BOOLEAN NOT NULL,
    "checkedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_checks_site_id" ON "Check"("siteId");

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
