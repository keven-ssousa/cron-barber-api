export class SignUpRequestDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
}

export class SignInRequestDto {
  email!: string;
  password!: string;
}
