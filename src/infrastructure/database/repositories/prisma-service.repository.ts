import { Prisma, PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";
import { Service } from "../../../domain/barbershop/entities/service.entity";
import { ServiceRepository } from "../../../domain/barbershop/repositories/service.repository";
import { Money } from "../../../domain/common/value-objects/money.vo";

@injectable()
export class PrismaServiceRepository implements ServiceRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: number): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: {
        id: id as unknown as Prisma.ServiceWhereUniqueInput["id"],
      },
    });

    if (!service) {
      return null;
    }

    return new Service({
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      price: new Money(Number(service.price)),
      durationMinutes: service.durationMinutes,
      isActive: service.isActive,
      barbershopId: service.barbershopId,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    });
  }

  async findByBarbershopId(barbershopId: number): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: { barbershopId },
    });

    return services.map(
      (service) =>
        new Service({
          id: service.id,
          name: service.name,
          description: service.description || undefined,
          price: new Money(Number(service.price)),
          durationMinutes: service.durationMinutes,
          isActive: service.isActive,
          barbershopId: service.barbershopId,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        }),
    );
  }

  async create(service: Service): Promise<Service> {
    const created = await this.prisma.service.create({
      data: {
        name: service.name,
        description: service.description,
        price: service.price.amount,
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
        barbershopId: service.barbershopId,
      },
    });

    return new Service({
      id: created.id,
      name: created.name,
      description: created.description || undefined,
      price: new Money(Number(created.price)),
      durationMinutes: created.durationMinutes,
      isActive: created.isActive,
      barbershopId: created.barbershopId,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(service: Service): Promise<Service> {
    if (!service.id) {
      throw new Error("Service must have an id to be updated");
    }

    const updated = await this.prisma.service.update({
      where: {
        id: service.id as unknown as Prisma.ServiceWhereUniqueInput["id"],
      },
      data: {
        name: service.name,
        description: service.description,
        price: service.price.amount,
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
      },
    });

    return new Service({
      id: updated.id,
      name: updated.name,
      description: updated.description || undefined,
      price: new Money(Number(updated.price)),
      durationMinutes: updated.durationMinutes,
      isActive: updated.isActive,
      barbershopId: updated.barbershopId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.service.delete({
        where: { id: id as unknown as Prisma.ServiceWhereUniqueInput["id"] },
      });
      return true;
    } catch (error) {
      console.error("Error deleting service:", error);
      return false;
    }
  }
}
