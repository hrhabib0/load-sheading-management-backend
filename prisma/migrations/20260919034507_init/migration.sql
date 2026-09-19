-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'TECHNICIAN', 'POWER_OPERATOR', 'ZONE_MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CustomerReportStatus" AS ENUM ('PENDING', 'LINKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutageIncidentStatus" AS ENUM ('INVESTIGATING', 'REPAIRING', 'RESTORATION_PENDING', 'RESTORED', 'CLOSED');

-- CreateEnum
CREATE TYPE "WorkTaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "PlannedOutageStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'REJECTED', 'APPROVED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LoadSheddingScheduleStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LOAD_SHEDDING_PUBLISHED', 'PLANNED_OUTAGE_PUBLISHED', 'UNEXPECTED_OUTAGE', 'OUTAGE_RESTORED', 'WORK_TASK_ASSIGNED', 'GENERAL');

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "feederId" TEXT NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_priorities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_priorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "priorityId" TEXT NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_reports" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CustomerReportStatus" NOT NULL DEFAULT 'PENDING',
    "cancelledAt" TIMESTAMP(3),
    "linkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerId" TEXT NOT NULL,
    "incidentId" TEXT,

    CONSTRAINT "customer_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "substationId" TEXT NOT NULL,

    CONSTRAINT "feeders_pkey" PRIMARY KEY ("id")
);

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
    "requiredReduction" DOUBLE PRECISION,
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

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operator_zone_assignments" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "operatorId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "operator_zone_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outage_incidents" (
    "id" TEXT NOT NULL,
    "status" "OutageIncidentStatus" NOT NULL DEFAULT 'INVESTIGATING',
    "description" TEXT,
    "startedAt" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "feederId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "verifiedBy" TEXT,

    CONSTRAINT "outage_incidents_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "substations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "substations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zone_manager_assignments" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "managerId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "zone_manager_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_code_key" ON "areas"("code");

-- CreateIndex
CREATE INDEX "areas_feederId_idx" ON "areas"("feederId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "customer_priorities_name_key" ON "customer_priorities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_userId_key" ON "customer_profiles"("userId");

-- CreateIndex
CREATE INDEX "customer_profiles_areaId_idx" ON "customer_profiles"("areaId");

-- CreateIndex
CREATE INDEX "customer_profiles_priorityId_idx" ON "customer_profiles"("priorityId");

-- CreateIndex
CREATE INDEX "customer_reports_customerId_idx" ON "customer_reports"("customerId");

-- CreateIndex
CREATE INDEX "customer_reports_incidentId_idx" ON "customer_reports"("incidentId");

-- CreateIndex
CREATE INDEX "customer_reports_status_idx" ON "customer_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "feeders_code_key" ON "feeders"("code");

-- CreateIndex
CREATE INDEX "feeders_substationId_idx" ON "feeders"("substationId");

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

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "operator_zone_assignments_operatorId_idx" ON "operator_zone_assignments"("operatorId");

-- CreateIndex
CREATE INDEX "operator_zone_assignments_zoneId_idx" ON "operator_zone_assignments"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "operator_zone_assignments_operatorId_zoneId_key" ON "operator_zone_assignments"("operatorId", "zoneId");

-- CreateIndex
CREATE INDEX "outage_incidents_feederId_idx" ON "outage_incidents"("feederId");

-- CreateIndex
CREATE INDEX "outage_incidents_createdBy_idx" ON "outage_incidents"("createdBy");

-- CreateIndex
CREATE INDEX "outage_incidents_status_idx" ON "outage_incidents"("status");

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

-- CreateIndex
CREATE UNIQUE INDEX "substations_code_key" ON "substations"("code");

-- CreateIndex
CREATE INDEX "substations_zoneId_idx" ON "substations"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "work_tasks_incidentId_idx" ON "work_tasks"("incidentId");

-- CreateIndex
CREATE INDEX "work_tasks_technicianId_idx" ON "work_tasks"("technicianId");

-- CreateIndex
CREATE INDEX "work_tasks_status_idx" ON "work_tasks"("status");

-- CreateIndex
CREATE INDEX "work_tasks_createdBy_idx" ON "work_tasks"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "zones_code_key" ON "zones"("code");

-- CreateIndex
CREATE INDEX "zone_manager_assignments_zoneId_idx" ON "zone_manager_assignments"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "zone_manager_assignments_managerId_key" ON "zone_manager_assignments"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "zone_manager_assignments_zoneId_key" ON "zone_manager_assignments"("zoneId");

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_priorityId_fkey" FOREIGN KEY ("priorityId") REFERENCES "customer_priorities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reports" ADD CONSTRAINT "customer_reports_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reports" ADD CONSTRAINT "customer_reports_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "outage_incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeders" ADD CONSTRAINT "feeders_substationId_fkey" FOREIGN KEY ("substationId") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_feeders" ADD CONSTRAINT "load_shedding_feeders_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "load_shedding_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_feeders" ADD CONSTRAINT "load_shedding_feeders_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_schedules" ADD CONSTRAINT "load_shedding_schedules_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_shedding_schedules" ADD CONSTRAINT "load_shedding_schedules_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_zone_assignments" ADD CONSTRAINT "operator_zone_assignments_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_zone_assignments" ADD CONSTRAINT "operator_zone_assignments_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_incidents" ADD CONSTRAINT "outage_incidents_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_incidents" ADD CONSTRAINT "outage_incidents_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_incidents" ADD CONSTRAINT "outage_incidents_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedOutage" ADD CONSTRAINT "PlannedOutage_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedOutage" ADD CONSTRAINT "PlannedOutage_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedOutageFeeder" ADD CONSTRAINT "PlannedOutageFeeder_plannedOutageId_fkey" FOREIGN KEY ("plannedOutageId") REFERENCES "PlannedOutage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannedOutageFeeder" ADD CONSTRAINT "PlannedOutageFeeder_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_tasks" ADD CONSTRAINT "work_tasks_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "outage_incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_tasks" ADD CONSTRAINT "work_tasks_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_tasks" ADD CONSTRAINT "work_tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_manager_assignments" ADD CONSTRAINT "zone_manager_assignments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_manager_assignments" ADD CONSTRAINT "zone_manager_assignments_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
