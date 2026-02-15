-- CreateTable
CREATE TABLE "NobetciEczaneRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "mapQuery" TEXT NOT NULL,
    "ilceSlug" TEXT NOT NULL,
    "validForDate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NobetciEczaneRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NobetciEczaneRecord_validForDate_idx" ON "NobetciEczaneRecord"("validForDate");

-- CreateIndex
CREATE INDEX "NobetciEczaneRecord_validForDate_ilceSlug_idx" ON "NobetciEczaneRecord"("validForDate", "ilceSlug");
