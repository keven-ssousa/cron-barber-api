import { inject, injectable } from "tsyringe";
import { Customer } from "../../../domain/customer/entities/customer.entity";
import { CustomerRepository } from "../../../domain/customer/repositories/customer.repository";

export interface FindOrCreateCustomerCommand {
  name: string;
  email: string;
  phone: string;
}

@injectable()
export class FindOrCreateCustomerHandler {
  constructor(
    @inject("CustomerRepository")
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(command: FindOrCreateCustomerCommand): Promise<Customer> {
    const { email, name, phone } = command;

    // Try to find customer by email or phone
    let customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      customer = await this.customerRepository.findByPhone(phone);
    }

    // If customer doesn't exist, create new one
    if (!customer) {
      customer = new Customer({
        name,
        email,
        phone,
      });
      await this.customerRepository.save(customer);
    }

    return customer;
  }
}
