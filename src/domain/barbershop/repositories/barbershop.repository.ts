import { BarberShop } from "../entities/barbershop.entity";

export interface BarbershopRepository {
  findById(id: number): Promise<BarberShop | null>;
  findBySlug(slug: string): Promise<BarberShop | null>;
  findByOwnerId(ownerId: number): Promise<BarberShop[]>;
  create(barbershop: BarberShop): Promise<BarberShop>;
  update(barbershop: BarberShop): Promise<BarberShop>;
  delete(id: number): Promise<boolean>;
}
