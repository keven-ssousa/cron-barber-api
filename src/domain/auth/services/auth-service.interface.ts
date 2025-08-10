export interface AuthService {
  signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ user: any; token: string }>;
  signIn(
    email: string,
    password: string,
  ): Promise<{ user: any; token: string }>;
  signOut(token: string): Promise<boolean>;
  validateToken(token: string): Promise<any>;
  resendConfirmationEmail(email: string): Promise<boolean>;
  verifyEmail(tokenHash: string): Promise<boolean>;
  resendVerificationEmail(email: string): Promise<boolean>;
}
