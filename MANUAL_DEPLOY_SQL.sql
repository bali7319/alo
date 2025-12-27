-- ============================================
-- Alo17 Invoice Tablosu - Manuel Deploy SQL
-- ============================================
-- Bu SQL'i hosting panelinizden veya phpPgAdmin gibi bir araçla çalıştırın
-- Veritabanı: alo17_db

-- Invoice tablosunu oluştur
CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 20.0,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "planType" TEXT,
    "planName" TEXT,
    "premiumFeatures" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paymentDate" TIMESTAMP,
    "billingName" TEXT NOT NULL,
    "billingAddress" TEXT,
    "billingTaxId" TEXT,
    "billingEmail" TEXT NOT NULL,
    "billingPhone" TEXT,
    "notes" TEXT,
    "xmlData" TEXT,
    "excelData" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- Invoice numarası için unique index
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- Kontrol: Tablo oluşturuldu mu?
SELECT 'Invoice tablosu başarıyla oluşturuldu!' AS status;

