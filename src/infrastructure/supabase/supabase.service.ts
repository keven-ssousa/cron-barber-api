import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { injectable } from "tsyringe";

@injectable()
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_KEY || "";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Supabase URL or Key not provided in environment variables",
      );
    }

    this.client = createClient(supabaseUrl, supabaseKey);
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
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      throw new Error(`Signup error: ${error.message}`);
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Login error: ${error.message}`);
    }

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

  // Database methods
  async getTable(tableName: string) {
    return this.client.from(tableName);
  }
}
