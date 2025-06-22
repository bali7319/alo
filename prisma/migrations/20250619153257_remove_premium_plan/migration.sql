/*
  Warnings:

  - You are about to drop the column `premiumPlan` on the `Listing` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "subSubCategory" TEXT,
    "phone" TEXT,
    "showPhone" BOOLEAN NOT NULL DEFAULT true,
    "images" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "condition" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "year" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumFeatures" TEXT,
    "premiumUntil" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "approvalStatus" TEXT NOT NULL DEFAULT 'approved',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("approvalStatus", "brand", "category", "condition", "createdAt", "description", "expiresAt", "features", "id", "images", "isActive", "isPremium", "location", "model", "phone", "premiumFeatures", "premiumUntil", "price", "showPhone", "subCategory", "subSubCategory", "title", "updatedAt", "userId", "views", "year") SELECT "approvalStatus", "brand", "category", "condition", "createdAt", "description", "expiresAt", "features", "id", "images", "isActive", "isPremium", "location", "model", "phone", "premiumFeatures", "premiumUntil", "price", "showPhone", "subCategory", "subSubCategory", "title", "updatedAt", "userId", "views", "year" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
