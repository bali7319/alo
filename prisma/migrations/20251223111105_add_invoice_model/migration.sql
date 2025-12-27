-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT,
    "amount" REAL NOT NULL,
    "taxRate" REAL NOT NULL DEFAULT 20.0,
    "taxAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "planType" TEXT,
    "planName" TEXT,
    "premiumFeatures" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentDate" DATETIME,
    "billingName" TEXT NOT NULL,
    "billingAddress" TEXT,
    "billingTaxId" TEXT,
    "billingEmail" TEXT NOT NULL,
    "billingPhone" TEXT,
    "notes" TEXT,
    "xmlData" TEXT,
    "excelData" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
