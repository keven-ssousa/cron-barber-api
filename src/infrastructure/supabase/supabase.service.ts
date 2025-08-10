import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { injectable } from "tsyringe";

@injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey =
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase URL or Key not provided in environment variables",
      );
    }

    this.client = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client initialized with URL:", supabaseUrl);
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  // Auth methods
  async signUp(
    email: string,
    password: string,
    userData?: { firstName: string; lastName: string },
  ) {
    console.log(`Attempting to sign up user with email: ${email}`);

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      console.error("Signup error details:", error);
      throw new Error(`Signup error: ${error.message}`);
    }

    console.log("Signup successful, user data:", data.user?.id || "No user ID");
    return data;
  }

  async signIn(email: string, password: string) {
    console.log(`Attempting to sign in user with email: ${email}`);

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error details:", error);
      throw new Error(`Login error: ${error.message}`);
    }

    console.log("Login successful, user data:", data.user?.id || "No user ID");
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new Error(`Logout error: ${error.message}`);
    }
    return true;
  }

  async getUser(token: string) {
    const { data, error } = await this.client.auth.getUser(token);
    if (error) {
      throw new Error(`Get user error: ${error.message}`);
    }
    return data.user;
  }

  async resendConfirmationEmail(email: string) {
    console.log(`Attempting to resend confirmation email to: ${email}`);

    const { data, error } = await this.client.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      console.error("Resend confirmation error:", error);
      throw new Error(`Resend confirmation error: ${error.message}`);
    }

    console.log("Confirmation email resent successfully");
    return data;
  }

  async verifyEmail(tokenHash: string) {
    console.log(`Attempting to verify email with token hash: ${tokenHash}`);

    const { data, error } = await this.client.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (error) {
      console.error("Email verification error:", error);
      throw new Error(`Email verification error: ${error.message}`);
    }

    console.log("Email verified successfully");
    return data;
  }

  async resendVerificationEmail(email: string) {
    console.log(`Attempting to resend verification email to: ${email}`);

    const { data, error } = await this.client.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${process.env.API_URL || "http://localhost:3000"}/auth/verify`,
      },
    });

    if (error) {
      console.error("Resend verification error:", error);
      throw new Error(`Resend verification error: ${error.message}`);
    }

    console.log("Verification email resent successfully");
    return data;
  }

  // Database methods
  async getTable(tableName: string) {
    return this.client.from(tableName);
  }
}
