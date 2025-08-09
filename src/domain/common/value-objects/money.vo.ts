export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  constructor(amount: number, currency: string = "BRL") {
    this.validateAmount(amount);
    this._amount = Math.round(amount * 100) / 100; // Arredonda para 2 casas decimais
    this._currency = currency;
  }

  private validateAmount(amount: number): void {
    if (typeof amount !== "number" || isNaN(amount)) {
      throw new Error("O valor monetário deve ser um número válido");
    }

    if (amount < 0) {
      throw new Error("O valor monetário não pode ser negativo");
    }
  }

  public get amount(): number {
    return this._amount;
  }

  public get currency(): string {
    return this._currency;
  }

  public add(other: Money): Money {
    this.validateSameCurrency(other);
    return new Money(this._amount + other._amount, this._currency);
  }

  public subtract(other: Money): Money {
    this.validateSameCurrency(other);
    const result = this._amount - other._amount;

    if (result < 0) {
      throw new Error("Operação resultaria em valor negativo");
    }

    return new Money(result, this._currency);
  }

  public multiply(factor: number): Money {
    if (typeof factor !== "number" || isNaN(factor)) {
      throw new Error("O fator de multiplicação deve ser um número válido");
    }

    if (factor < 0) {
      throw new Error("O fator de multiplicação não pode ser negativo");
    }

    return new Money(this._amount * factor, this._currency);
  }

  private validateSameCurrency(other: Money): void {
    if (this._currency !== other._currency) {
      throw new Error(
        "Operações entre moedas de tipos diferentes não são permitidas",
      );
    }
  }

  public equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  public format(): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: this._currency,
    }).format(this._amount);
  }

  public toJSON(): { amount: number; currency: string; formatted: string } {
    return {
      amount: this._amount,
      currency: this._currency,
      formatted: this.format(),
    };
  }
}
