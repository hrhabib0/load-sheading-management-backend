/*
  Warnings:

  - The values [PENDING] on the enum `OutageIncidentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OutageIncidentStatus_new" AS ENUM ('INVESTIGATING', 'REPAIRING', 'RESTORATION_PENDING', 'RESTORED', 'CLOSED');
ALTER TABLE "public"."outage_incidents" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "outage_incidents" ALTER COLUMN "status" TYPE "OutageIncidentStatus_new" USING ("status"::text::"OutageIncidentStatus_new");
ALTER TYPE "OutageIncidentStatus" RENAME TO "OutageIncidentStatus_old";
ALTER TYPE "OutageIncidentStatus_new" RENAME TO "OutageIncidentStatus";
DROP TYPE "public"."OutageIncidentStatus_old";
ALTER TABLE "outage_incidents" ALTER COLUMN "status" SET DEFAULT 'INVESTIGATING';
COMMIT;
