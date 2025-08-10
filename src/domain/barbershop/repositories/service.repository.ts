import { Service } from "../entities/service.entity";

export interface ServiceRepository {
  findById(id: number): Promise<Service | null>;
  findByBarbershopId(barbershopId: number): Promise<Service[]>;
  create(service: Service): Promise<Service>;
  update(service: Service): Promise<Service>;
  delete(id: number): Promise<boolean>;
}
