import { inject, injectable } from "tsyringe";
import { AuthService } from "../../domain/auth/services/auth-service.interface";
import { SupabaseService } from "../supabase/supabase.service";

@injectable()
export class SupabaseAuthService implements AuthService {
  constructor(
    @inject("SupabaseService")
    private readonly supabaseService: SupabaseService,
  ) {}

  async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ user: any; token: string }> {
    const result = await this.supabaseService.signUp(email, password, {
      firstName,
      lastName,
    });

    if (!result.user || !result.session) {
      throw new Error("Failed to create user account");
    }

    return {
      user: result.user,
      token: result.session.access_token,
    };
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: any; token: string }> {
    const result = await this.supabaseService.signIn(email, password);

    if (!result.user || !result.session) {
      throw new Error("Invalid credentials");
    }

    return {
      user: result.user,
      token: result.session.access_token,
    };
  }

  async signOut(token: string): Promise<boolean> {
    return await this.supabaseService.signOut();
  }

  async validateToken(token: string): Promise<any> {
    const user = await this.supabaseService.getUser(token);
    return user;
  }
}
