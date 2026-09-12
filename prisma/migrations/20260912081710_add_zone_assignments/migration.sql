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
CREATE TABLE "zone_manager_assignments" (
    "id" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT,
    "managerId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,

    CONSTRAINT "zone_manager_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operator_zone_assignments_operatorId_idx" ON "operator_zone_assignments"("operatorId");

-- CreateIndex
CREATE INDEX "operator_zone_assignments_zoneId_idx" ON "operator_zone_assignments"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "operator_zone_assignments_operatorId_zoneId_key" ON "operator_zone_assignments"("operatorId", "zoneId");

-- CreateIndex
CREATE INDEX "zone_manager_assignments_zoneId_idx" ON "zone_manager_assignments"("zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "zone_manager_assignments_managerId_key" ON "zone_manager_assignments"("managerId");

-- CreateIndex
CREATE UNIQUE INDEX "zone_manager_assignments_zoneId_key" ON "zone_manager_assignments"("zoneId");

-- AddForeignKey
ALTER TABLE "operator_zone_assignments" ADD CONSTRAINT "operator_zone_assignments_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operator_zone_assignments" ADD CONSTRAINT "operator_zone_assignments_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_manager_assignments" ADD CONSTRAINT "zone_manager_assignments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zone_manager_assignments" ADD CONSTRAINT "zone_manager_assignments_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
