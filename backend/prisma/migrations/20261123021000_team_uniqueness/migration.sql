DROP INDEX "Invoice_invoiceNumber_key";
CREATE UNIQUE INDEX "Invoice_teamId_invoiceNumber_key" ON "Invoice"("teamId","invoiceNumber");
DROP INDEX "CustomPermission_slug_key";
CREATE UNIQUE INDEX "CustomPermission_teamId_slug_key" ON "CustomPermission"("teamId","slug");
