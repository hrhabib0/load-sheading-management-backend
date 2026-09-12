-- CreateEnum
CREATE TYPE "PlannedOutageStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'APPROVED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PlannedOutage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "PlannedOutageStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "actualStartAt" TIMESTAMP(3),
    "actualEndAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannedOutage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannedOutageFeeder" (
    "id" TEXT NOT NULL,
    "plannedOutageId" TEXT NOT NULL,
    "feederId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannedOutageFeeder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlannedOutage_createdBy_idx" ON "PlannedOutage"("createdBy");

-- CreateIndex
CREATE INDEX "PlannedOutage_approvedBy_idx" ON "PlannedOutage"("approvedBy");

-- CreateIndex
CREATE INDEX "PlannedOutage_status_idx" ON "PlannedOutage"("status");

-- CreateIndex
CREATE INDEX "PlannedOutage_scheduledStartAt_idx" ON "PlannedOutage"("scheduledStartAt");

-- CreateIndex
CREATE INDEX "PlannedOutageFeeder_plannedOutageId_idx" ON "PlannedOutageFeeder"("plannedOutageId");

-- CreateIndex
CREATE INDEX "PlannedOutageFeeder_feederId_idx" ON "PlannedOutageFeeder"("feederId");

-- CreateIndex
CREATE UNIQUE INDEX "PlannedOutageFeeder_plannedOutageId_feederId_key" ON "PlannedOutageFeeder"("plannedOutageId", "feederId");

-- AddForeignKey
ALTER TABLE "PlannedOutage" ADD CONSTRAINT "PlannedOutage_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedOutage" ADD CONSTRAINT "PlannedOutage_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedOutageFeeder" ADD CONSTRAINT "PlannedOutageFeeder_plannedOutageId_fkey" FOREIGN KEY ("plannedOutageId") REFERENCES "PlannedOutage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedOutageFeeder" ADD CONSTRAINT "PlannedOutageFeeder_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
