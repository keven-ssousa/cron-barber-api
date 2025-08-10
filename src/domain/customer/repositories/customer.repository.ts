import { Customer } from "../entities/customer.entity";

export interface CustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findByEmail(email: string): Promise<Customer | null>;
  findByPhone(phone: string): Promise<Customer | null>;
  findById(id: number): Promise<Customer | null>;
}
