import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";
import { BarberShop } from "../../../domain/barbershop/entities/barbershop.entity";
import { Service } from "../../../domain/barbershop/entities/service.entity";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";
import { Money } from "../../../domain/common/value-objects/money.vo";
import { ScheduleRule } from "../../../domain/common/value-objects/schedule-rule.vo";

@injectable()
export class PrismaBarbershopRepository implements BarbershopRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: number): Promise<BarberShop | null> {
    const barbershop = await this.prisma.barberShop.findUnique({
      where: { id },
      include: {
        services: true,
        scheduleRules: true,
      },
    });

    if (!barbershop) {
      return null;
    }

    return this.mapToDomain(barbershop);
  }

  async findBySlug(slug: string): Promise<BarberShop | null> {
    const barbershop = await this.prisma.barberShop.findUnique({
      where: { slug },
      include: {
        services: true,
        scheduleRules: true,
      },
    });

    if (!barbershop) {
      return null;
    }

    return this.mapToDomain(barbershop);
  }

  async findByOwnerId(ownerId: number): Promise<BarberShop[]> {
    const barbershops = await this.prisma.barberShop.findMany({
      where: { ownerId: String(ownerId) },
      include: {
        services: true,
        scheduleRules: true,
      },
    });

    return barbershops.map(this.mapToDomain);
  }

  async create(barbershop: BarberShop): Promise<BarberShop> {
    const data = {
      name: barbershop.name,
      slug: barbershop.slug,
      description: barbershop.description,
      address: barbershop.address,
      logoUrl: barbershop.logoUrl,
      ownerId: String(barbershop.ownerId),
      timezone: barbershop.timezone,
    };

    const created = await this.prisma.barberShop.create({
      data,
      include: {
        services: true,
        scheduleRules: true,
      },
    });

    return this.mapToDomain(created);
  }

  async update(barbershop: BarberShop): Promise<BarberShop> {
    if (!barbershop.id) {
      throw new Error("Não é possível atualizar uma barbearia sem ID");
    }

    const data = {
      name: barbershop.name,
      slug: barbershop.slug,
      description: barbershop.description,
      address: barbershop.address,
      logoUrl: barbershop.logoUrl,
      timezone: barbershop.timezone,
    };

    const updated = await this.prisma.barberShop.update({
      where: { id: barbershop.id },
      data,
      include: {
        services: true,
        scheduleRules: true,
      },
    });

    return this.mapToDomain(updated);
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.barberShop.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      console.error("Erro ao excluir barbearia:", error);
      return false;
    }
  }

  private mapToDomain(barbershopData: any): BarberShop {
    const services = barbershopData.services.map((serviceData: any) => {
      return new Service({
        id: serviceData.id,
        name: serviceData.name,
        description: serviceData.description,
        price: new Money(Number(serviceData.price)),
        durationMinutes: serviceData.durationMinutes,
        isActive: serviceData.isActive,
        barbershopId: serviceData.barbershopId,
        createdAt: serviceData.createdAt,
        updatedAt: serviceData.updatedAt,
      });
    });

    const scheduleRules = barbershopData.scheduleRules.map((ruleData: any) => {
      return new ScheduleRule(
        ruleData.dayOfWeek,
        ruleData.startTime,
        ruleData.endTime,
        ruleData.isActive,
      );
    });

    return new BarberShop({
      id: barbershopData.id,
      name: barbershopData.name,
      slug: barbershopData.slug,
      description: barbershopData.description,
      address: barbershopData.address,
      logoUrl: barbershopData.logoUrl,
      ownerId: barbershopData.ownerId,
      timezone: barbershopData.timezone,
      createdAt: barbershopData.createdAt,
      updatedAt: barbershopData.updatedAt,
      services,
      scheduleRules,
    });
  }
}
