-- CreateEnum
CREATE TYPE "CustomerReportStatus" AS ENUM ('PENDING', 'LINKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OutageIncidentStatus" AS ENUM ('INVESTIGATING', 'REPAIRING', 'RESTORATION_PENDING', 'RESTORED', 'CLOSED');

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

-- CreateIndex
CREATE INDEX "customer_reports_customerId_idx" ON "customer_reports"("customerId");

-- CreateIndex
CREATE INDEX "customer_reports_incidentId_idx" ON "customer_reports"("incidentId");

-- CreateIndex
CREATE INDEX "customer_reports_status_idx" ON "customer_reports"("status");

-- CreateIndex
CREATE INDEX "outage_incidents_feederId_idx" ON "outage_incidents"("feederId");

-- CreateIndex
CREATE INDEX "outage_incidents_createdBy_idx" ON "outage_incidents"("createdBy");

-- CreateIndex
CREATE INDEX "outage_incidents_status_idx" ON "outage_incidents"("status");

-- AddForeignKey
ALTER TABLE "customer_reports" ADD CONSTRAINT "customer_reports_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reports" ADD CONSTRAINT "customer_reports_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "outage_incidents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_incidents" ADD CONSTRAINT "outage_incidents_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_incidents" ADD CONSTRAINT "outage_incidents_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outage_incidents" ADD CONSTRAINT "outage_incidents_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
