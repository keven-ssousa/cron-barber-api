import { inject, injectable } from "tsyringe";
import { AuthService } from "../../../domain/auth/services/auth-service.interface";
import { BarberShop } from "../../../domain/barbershop/entities/barbershop.entity";
import { BarbershopRepository } from "../../../domain/barbershop/repositories/barbershop.repository";
import { SubscriptionInviteService } from "../../../domain/subscription/services/subscription-invite-service.interface";

interface CreateAccountFromInviteInput {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
  barbershopName: string;
  barbershopSlug: string;
}

interface CreateAccountFromInviteOutput {
  userId: string;
  barbershopId: number;
  token: string;
}

@injectable()
export class CreateAccountFromInviteHandler {
  constructor(
    @inject("SubscriptionInviteService")
    private subscriptionInviteService: SubscriptionInviteService,

    @inject("AuthService")
    private authService: AuthService,

    @inject("BarbershopRepository")
    private barbershopRepository: BarbershopRepository,
  ) {}

  async execute(
    input: CreateAccountFromInviteInput,
  ): Promise<CreateAccountFromInviteOutput> {
    // 1. Validar token de convite
    const inviteData = await this.subscriptionInviteService.validateInvite(
      input.token,
    );

    if (!inviteData) {
      throw new Error("Token de convite inválido ou expirado");
    }

    // 2. Criar conta de usuário
    const userResult = await this.authService.signUp(
      inviteData.email,
      input.password,
      input.firstName,
      input.lastName,
    );

    // 3. Criar barbearia e associar ao usuário
    const barbershop = new BarberShop({
      name: input.barbershopName,
      slug: input.barbershopSlug,
      ownerId: userResult.user.id,
      timezone: "America/Sao_Paulo", // Valor padrão, pode ser personalizado depois
    });

    const createdBarbershop =
      await this.barbershopRepository.create(barbershop);

    // 4. Marcar convite como usado
    await this.subscriptionInviteService.markInviteAsUsed(inviteData.inviteId);

    // 5. Retornar dados do usuário, barbearia e token
    return {
      userId: userResult.user.id,
      barbershopId: createdBarbershop.id as number,
      token: userResult.token,
    };
  }
}
