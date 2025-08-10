import { PrismaClient } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export class PrismaUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findById(id: string) {
    return this.prisma.auth_user.findUnique({
      where: { id },
    });
  }

  async create(data: { id: string; email: string; name: string }) {
    return this.prisma.auth_user.create({
      data: {
        id: data.id,
        email: data.email,
        first_name: data.name,
      },
    });
  }
}
