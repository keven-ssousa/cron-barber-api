import { inject, injectable } from "tsyringe";
import { AuthService } from "../../../domain/auth/services/auth-service.interface";

export interface SignUpCommand {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignUpResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  token: string;
}

@injectable()
export class SignUpHandler {
  constructor(
    @inject("AuthService")
    private readonly authService: AuthService,
  ) {}

  async execute(command: SignUpCommand): Promise<SignUpResult> {
    const { email, password, firstName, lastName } = command;

    // Validate inputs
    if (!email || !password || !firstName || !lastName) {
      throw new Error("Missing required fields");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const result = await this.authService.signUp(
      email,
      password,
      firstName,
      lastName,
    );

    return {
      id: result.user.id,
      email: result.user.email,
      firstName: result.user.user_metadata?.firstName || "",
      lastName: result.user.user_metadata?.lastName || "",
      token: result.token,
    };
  }
}
