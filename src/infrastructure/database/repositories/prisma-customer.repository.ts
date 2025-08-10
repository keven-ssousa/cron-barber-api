import { injectable } from "tsyringe";
import { Customer } from "../../../domain/customer/entities/customer.entity";
import { CustomerRepository } from "../../../domain/customer/repositories/customer.repository";
import { PrismaService } from "../services/prisma.service";

@injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(customer: Customer): Promise<Customer> {
    const data = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    };

    const prismaCustomer = await this.prisma.customer.upsert({
      where: { id: customer.id || 0 },
      update: data,
      create: data,
    });

    return new Customer(prismaCustomer);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    return customer ? new Customer(customer) : null;
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { phone },
    });

    return customer ? new Customer(customer) : null;
  }

  async findById(id: number): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    return customer ? new Customer(customer) : null;
  }
}
