-- CreateEnum
CREATE TYPE "LoadSheddingScheduleStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "load_shedding_feeders" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "feederId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "load_shedding_feeders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_shedding_schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "LoadSheddingScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "scheduledStartAt" TIMESTAMP(3) NOT NULL,
    "scheduledEndAt" TIMESTAMP(3) NOT NULL,
    "actualStartAt" TIMESTAMP(3),
    "actualEndAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "load_shedding_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "load_shedding_feeders_scheduleId_idx" ON "load_shedding_feeders"("scheduleId");

-- CreateIndex
CREATE INDEX "load_shedding_feeders_feederId_idx" ON "load_shedding_feeders"("feederId");

-- CreateIndex
CREATE UNIQUE INDEX "load_shedding_feeders_scheduleId_feederId_key" ON "load_shedding_feeders"("scheduleId", "feederId");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_createdBy_idx" ON "load_shedding_schedules"("createdBy");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_approvedBy_idx" ON "load_shedding_schedules"("approvedBy");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_status_idx" ON "load_shedding_schedules"("status");

-- CreateIndex
CREATE INDEX "load_shedding_schedules_scheduledStartAt_idx" ON "load_shedding_schedules"("scheduledStartAt");

-- AddForeignKey
ALTER TABLE "load_shedding_feeders" ADD CONSTRAINT "load_shedding_feeders_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "load_shedding_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_feeders" ADD CONSTRAINT "load_shedding_feeders_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_schedules" ADD CONSTRAINT "load_shedding_schedules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_schedules" ADD CONSTRAINT "load_shedding_schedules_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
