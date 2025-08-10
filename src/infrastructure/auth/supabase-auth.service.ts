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
    try {
      const result = await this.supabaseService.signUp(email, password, {
        firstName,
        lastName,
      });

      if (!result.user) {
        console.error("Supabase signup returned no user data:", result);
        throw new Error("Failed to create user account: no user data returned");
      }

      // Email confirmation is likely enabled - returning user data without session
      if (!result.session) {
        console.log(
          "User registered successfully, email confirmation required",
        );
        return {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.user_metadata?.firstName || firstName,
            lastName: result.user.user_metadata?.lastName || lastName,
          },
          token: "", // Empty token since no session is available yet
        };
      }

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.user_metadata?.firstName || firstName,
          lastName: result.user.user_metadata?.lastName || lastName,
        },
        token: result.session.access_token,
      };
    } catch (error) {
      console.error("Error in SupabaseAuthService.signUp:", error);
      throw new Error(
        `Failed to create user account: ${(error as Error).message}`,
      );
    }
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: any; token: string }> {
    try {
      const result = await this.supabaseService.signIn(email, password);

      if (!result.user || !result.session) {
        console.error("Supabase signin returned incomplete data:", result);
        throw new Error("Invalid credentials or incomplete data returned");
      }

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.user_metadata?.firstName || "",
          lastName: result.user.user_metadata?.lastName || "",
        },
        token: result.session.access_token,
      };
    } catch (error) {
      console.error("Error in SupabaseAuthService.signIn:", error);
      throw new Error(`Invalid credentials: ${(error as Error).message}`);
    }
  }

  async signOut(token: string): Promise<boolean> {
    return await this.supabaseService.signOut();
  }

  async validateToken(token: string): Promise<any> {
    const user = await this.supabaseService.getUser(token);
    return user;
  }

  async resendConfirmationEmail(email: string): Promise<boolean> {
    try {
      await this.supabaseService.resendConfirmationEmail(email);
      return true;
    } catch (error) {
      console.error("Error in resendConfirmationEmail:", error);
      throw new Error(
        `Failed to resend confirmation email: ${(error as Error).message}`,
      );
    }
  }

  async verifyEmail(tokenHash: string): Promise<boolean> {
    try {
      await this.supabaseService.verifyEmail(tokenHash);
      return true;
    } catch (error) {
      console.error("Error in verifyEmail:", error);
      throw new Error(`Failed to verify email: ${(error as Error).message}`);
    }
  }

  async resendVerificationEmail(email: string): Promise<boolean> {
    try {
      await this.supabaseService.resendVerificationEmail(email);
      return true;
    } catch (error) {
      console.error("Error in resendVerificationEmail:", error);
      throw new Error(
        `Failed to resend verification email: ${(error as Error).message}`,
      );
    }
  }
}
