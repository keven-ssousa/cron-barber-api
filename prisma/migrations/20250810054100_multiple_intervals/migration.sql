-- AlterTable
ALTER TABLE "schedule_rules" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- DropIndex
DROP INDEX IF EXISTS "schedule_rules_barbershopId_dayOfWeek_key";

-- CreateIndex
CREATE UNIQUE INDEX "schedule_rules_barbershopId_dayOfWeek_startTime_endTime_key" ON "schedule_rules"("barbershopId", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "schedule_rules_barbershopId_dayOfWeek_order_idx" ON "schedule_rules"("barbershopId", "dayOfWeek", "order");
