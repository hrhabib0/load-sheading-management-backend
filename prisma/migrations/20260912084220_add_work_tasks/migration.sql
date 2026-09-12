-- CreateEnum
CREATE TYPE "WorkTaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateTable
CREATE TABLE "work_tasks" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "technicianId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkTaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "failureReason" TEXT,
    "repairNote" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "work_tasks_incidentId_idx" ON "work_tasks"("incidentId");

-- CreateIndex
CREATE INDEX "work_tasks_technicianId_idx" ON "work_tasks"("technicianId");

-- CreateIndex
CREATE INDEX "work_tasks_status_idx" ON "work_tasks"("status");

-- CreateIndex
CREATE INDEX "work_tasks_createdBy_idx" ON "work_tasks"("createdBy");

-- AddForeignKey
ALTER TABLE "work_tasks" ADD CONSTRAINT "work_tasks_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "outage_incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_tasks" ADD CONSTRAINT "work_tasks_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_tasks" ADD CONSTRAINT "work_tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
