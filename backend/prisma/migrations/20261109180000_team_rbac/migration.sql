-- CreateEnum
CREATE TYPE "InviteType" AS ENUM ('EMAIL', 'PUBLIC_CODE', 'TEMP_ACCOUNT');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELLED', 'EXPIRED');

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "publicCode" TEXT;
ALTER TABLE "User" ADD COLUMN "extraPermissions" JSONB NOT NULL DEFAULT '[]';

UPDATE "User"
SET "publicCode" = '1' || lpad((abs(hashtext("id"::text)) % 100000000)::text, 8, '0')
WHERE "publicCode" IS NULL;

ALTER TABLE "User" ALTER COLUMN "publicCode" SET NOT NULL;

CREATE UNIQUE INDEX "User_publicCode_key" ON "User"("publicCode");
CREATE INDEX "User_publicCode_idx" ON "User"("publicCode");

-- CreateTable CustomPermission
CREATE TABLE "CustomPermission" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPermission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomPermission_slug_key" ON "CustomPermission"("slug");

-- CreateTable TeamInvite
CREATE TABLE "TeamInvite" (
    "id" UUID NOT NULL,
    "type" "InviteType" NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "email" TEXT,
    "targetPublicCode" TEXT,
    "tokenHash" TEXT,
    "roleId" UUID,
    "departmentId" UUID,
    "extraPermissions" JSONB NOT NULL DEFAULT '[]',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID NOT NULL,
    "provisionedUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TeamInvite_tokenHash_key" ON "TeamInvite"("tokenHash");
CREATE UNIQUE INDEX "TeamInvite_provisionedUserId_key" ON "TeamInvite"("provisionedUserId");
CREATE INDEX "TeamInvite_status_idx" ON "TeamInvite"("status");
CREATE INDEX "TeamInvite_email_idx" ON "TeamInvite"("email");
CREATE INDEX "TeamInvite_targetPublicCode_idx" ON "TeamInvite"("targetPublicCode");

ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_provisionedUserId_fkey" FOREIGN KEY ("provisionedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
