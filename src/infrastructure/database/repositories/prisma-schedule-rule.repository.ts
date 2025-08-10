import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";
import {
  CreateScheduleRuleData,
  ScheduleRuleEntity,
  UpdateScheduleRuleData,
} from "../../../domain/barbershop/entities/schedule-rule.entity";
import { ScheduleRuleRepository } from "../../../domain/barbershop/repositories/schedule-rule.repository";

@injectable()
export class PrismaScheduleRuleRepository implements ScheduleRuleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: number): Promise<ScheduleRuleEntity | null> {
    const rule = await this.prisma.scheduleRule.findUnique({
      where: {
        id: id as unknown as Prisma.ScheduleRuleWhereUniqueInput["id"],
      },
    });

    if (!rule) return null;
    return rule;
  }

  async findByBarbershopId(
    barbershopId: number,
  ): Promise<ScheduleRuleEntity[]> {
    const rules = await this.prisma.scheduleRule.findMany({
      where: { barbershopId },
      orderBy: [{ dayOfWeek: "asc" }, { order: "asc" }],
    });

    return rules;
  }

  async findByBarbershopAndDay(
    barbershopId: number,
    dayOfWeek: number,
  ): Promise<ScheduleRuleEntity[]> {
    const rules = await this.prisma.scheduleRule.findMany({
      where: {
        barbershopId,
        dayOfWeek,
      },
      orderBy: { order: "asc" },
    });

    return rules;
  }

  async create(data: CreateScheduleRuleData): Promise<ScheduleRuleEntity> {
    const created = await this.prisma.scheduleRule.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive,
        barbershopId: data.barbershopId,
        order: data.order,
      },
    });

    return created;
  }

  async update(
    id: number,
    data: UpdateScheduleRuleData,
  ): Promise<ScheduleRuleEntity> {
    const updated = await this.prisma.scheduleRule.update({
      where: { id: id as unknown as Prisma.ScheduleRuleWhereUniqueInput["id"] },
      data: {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: data.isActive,
        order: data.order,
      },
    });

    return updated;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.scheduleRule.delete({
        where: {
          id: id as unknown as Prisma.ScheduleRuleWhereUniqueInput["id"],
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting schedule rule:", error);
      return false;
    }
  }
}
