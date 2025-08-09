import { inject, injectable } from "tsyringe";
import { AuthService } from "../../../domain/auth/services/auth-service.interface";

export interface SignInCommand {
  email: string;
  password: string;
}

export interface SignInResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

@injectable()
export class SignInHandler {
  constructor(
    @inject("AuthService")
    private readonly authService: AuthService,
  ) {}

  async execute(command: SignInCommand): Promise<SignInResult> {
    const { email, password } = command;

    // Validate inputs
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const result = await this.authService.signIn(email, password);

    return {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.user_metadata?.firstName || "",
      lastName: result.user.user_metadata?.lastName || "",
      token: result.token,
    };
  }
}
