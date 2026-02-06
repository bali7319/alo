-- Remove E-Ticaret (Pazaryeri) tables and enums
-- Order: drop tables with FKs first, then connection, then enum types

-- Tables (child first)
DROP TABLE IF EXISTS "EcomInvoice";
DROP TABLE IF EXISTS "MarketplaceShipmentLabel";
DROP TABLE IF EXISTS "MarketplaceOrderItem";
DROP TABLE IF EXISTS "MarketplaceOrder";
DROP TABLE IF EXISTS "MarketplaceProduct";
DROP TABLE IF EXISTS "MarketplaceConnection";

-- Enum types (PostgreSQL)
DROP TYPE IF EXISTS "EInvoiceStatus";
DROP TYPE IF EXISTS "EInvoiceProvider";
DROP TYPE IF EXISTS "LabelFormat";
DROP TYPE IF EXISTS "MarketplaceProvider";
