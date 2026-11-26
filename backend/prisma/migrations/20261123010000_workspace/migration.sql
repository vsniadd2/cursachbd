CREATE TABLE "WorkspaceItem" (
 "id" UUID NOT NULL,
 "kind" TEXT NOT NULL,
 "title" TEXT NOT NULL,
 "body" TEXT NOT NULL DEFAULT '',
 "status" TEXT NOT NULL DEFAULT 'DRAFT',
 "ownerId" UUID NOT NULL,
 "runs" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "WorkspaceItem_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WorkspaceItem_kind_status_idx" ON "WorkspaceItem"("kind", "status");

ALTER TABLE "Invoice" ADD COLUMN "paidAt" TIMESTAMP(3);
UPDATE "Invoice" SET "paidAt" = "updatedAt" WHERE "status" = 'PAID';
