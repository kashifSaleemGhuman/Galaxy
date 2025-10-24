/*
  Warnings:

  - You are about to drop the `approval_requests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `approval_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chart_of_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `employees` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `goods_receipts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `internal_moves` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `inventory_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `journal_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `journal_entry_lines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `packaging` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `po_lines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_agreement_lines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_agreements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchase_orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reorder_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `request_for_qtn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rfq_lines` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `supplier_pricelists` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suppliers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `uom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vendor_bills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "approval_requests" DROP CONSTRAINT "approval_requests_po_id_fkey";

-- DropForeignKey
ALTER TABLE "approval_requests" DROP CONSTRAINT "approval_requests_rule_id_fkey";

-- DropForeignKey
ALTER TABLE "chart_of_accounts" DROP CONSTRAINT "chart_of_accounts_parent_account_id_fkey";

-- DropForeignKey
ALTER TABLE "chart_of_accounts" DROP CONSTRAINT "chart_of_accounts_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_created_by_fkey";

-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_department_id_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_user_id_fkey";

-- DropForeignKey
ALTER TABLE "goods_receipts" DROP CONSTRAINT "goods_receipts_po_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_moves" DROP CONSTRAINT "internal_moves_from_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_moves" DROP CONSTRAINT "internal_moves_product_id_fkey";

-- DropForeignKey
ALTER TABLE "internal_moves" DROP CONSTRAINT "internal_moves_to_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_items" DROP CONSTRAINT "inventory_items_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_created_by_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entry_lines" DROP CONSTRAINT "journal_entry_lines_account_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entry_lines" DROP CONSTRAINT "journal_entry_lines_journal_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_created_by_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "locations" DROP CONSTRAINT "locations_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_created_by_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "packaging" DROP CONSTRAINT "packaging_product_id_fkey";

-- DropForeignKey
ALTER TABLE "po_lines" DROP CONSTRAINT "po_lines_po_id_fkey";

-- DropForeignKey
ALTER TABLE "po_lines" DROP CONSTRAINT "po_lines_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_product_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_agreement_lines" DROP CONSTRAINT "purchase_agreement_lines_agreement_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_agreement_lines" DROP CONSTRAINT "purchase_agreement_lines_product_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_agreements" DROP CONSTRAINT "purchase_agreements_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_rfq_id_fkey";

-- DropForeignKey
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "reorder_rules" DROP CONSTRAINT "reorder_rules_preferred_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "reorder_rules" DROP CONSTRAINT "reorder_rules_product_id_fkey";

-- DropForeignKey
ALTER TABLE "request_for_qtn" DROP CONSTRAINT "request_for_qtn_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "rfq_lines" DROP CONSTRAINT "rfq_lines_product_id_fkey";

-- DropForeignKey
ALTER TABLE "rfq_lines" DROP CONSTRAINT "rfq_lines_rfq_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_created_by_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_inventory_item_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "supplier_pricelists" DROP CONSTRAINT "supplier_pricelists_product_id_fkey";

-- DropForeignKey
ALTER TABLE "supplier_pricelists" DROP CONSTRAINT "supplier_pricelists_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "vendor_bills" DROP CONSTRAINT "vendor_bills_po_id_fkey";

-- DropTable
DROP TABLE "approval_requests";

-- DropTable
DROP TABLE "approval_rules";

-- DropTable
DROP TABLE "chart_of_accounts";

-- DropTable
DROP TABLE "customers";

-- DropTable
DROP TABLE "departments";

-- DropTable
DROP TABLE "employees";

-- DropTable
DROP TABLE "goods_receipts";

-- DropTable
DROP TABLE "internal_moves";

-- DropTable
DROP TABLE "inventory_items";

-- DropTable
DROP TABLE "journal_entries";

-- DropTable
DROP TABLE "journal_entry_lines";

-- DropTable
DROP TABLE "leads";

-- DropTable
DROP TABLE "locations";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "packaging";

-- DropTable
DROP TABLE "po_lines";

-- DropTable
DROP TABLE "product_variants";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "purchase_agreement_lines";

-- DropTable
DROP TABLE "purchase_agreements";

-- DropTable
DROP TABLE "purchase_orders";

-- DropTable
DROP TABLE "reorder_rules";

-- DropTable
DROP TABLE "request_for_qtn";

-- DropTable
DROP TABLE "rfq_lines";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "stock_movements";

-- DropTable
DROP TABLE "supplier_pricelists";

-- DropTable
DROP TABLE "suppliers";

-- DropTable
DROP TABLE "tenants";

-- DropTable
DROP TABLE "uom";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "vendor_bills";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PasswordHistory" ADD CONSTRAINT "PasswordHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
