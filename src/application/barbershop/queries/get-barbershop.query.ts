import { inject, injectable } from "tsyringe";
import { BarberShop } from "../../../domain/barbershop/entities/barbershop.entity";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";

export interface GetBarbershopQuery {
  slug: string;
}

@injectable()
export class GetBarbershopHandler {
  constructor(
    @inject("BarbershopRepository")
    private readonly barbershopRepository: BarbershopRepository,
  ) {}

  async execute(query: GetBarbershopQuery): Promise<BarberShop> {
    const barbershop = await this.barbershopRepository.findBySlug(query.slug);
    if (!barbershop) {
      throw new Error(`Barbearia não encontrada`);
    }

    return barbershop;
  }
}
