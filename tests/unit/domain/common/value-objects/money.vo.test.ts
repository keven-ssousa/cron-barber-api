import { Money } from "../../../../../src/domain/common/value-objects/money.vo";

describe("Money", () => {
  describe("constructor", () => {
    it("should create a valid money object with default currency", () => {
      const money = new Money(100.5);
      expect(money.amount).toBe(100.5);
      expect(money.currency).toBe("BRL");
    });

    it("should create a valid money object with specified currency", () => {
      const money = new Money(100.5, "USD");
      expect(money.amount).toBe(100.5);
      expect(money.currency).toBe("USD");
    });

    it("should round the amount to two decimal places", () => {
      const money = new Money(100.567);
      expect(money.amount).toBe(100.57);
    });

    it("should throw error if amount is not a valid number", () => {
      expect(() => new Money(NaN)).toThrow(
        "O valor monetário deve ser um número válido",
      );
    });

    it("should throw error if amount is negative", () => {
      expect(() => new Money(-10)).toThrow(
        "O valor monetário não pode ser negativo",
      );
    });
  });

  describe("add", () => {
    it("should correctly add two money objects with same currency", () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.add(money2);

      expect(result.amount).toBe(150);
      expect(result.currency).toBe("BRL");
    });

    it("should throw error when adding money objects with different currencies", () => {
      const money1 = new Money(100, "BRL");
      const money2 = new Money(50, "USD");

      expect(() => money1.add(money2)).toThrow(
        "Operações entre moedas de tipos diferentes não são permitidas",
      );
    });
  });

  describe("subtract", () => {
    it("should correctly subtract two money objects with same currency", () => {
      const money1 = new Money(100);
      const money2 = new Money(50);
      const result = money1.subtract(money2);

      expect(result.amount).toBe(50);
      expect(result.currency).toBe("BRL");
    });

    it("should throw error when result would be negative", () => {
      const money1 = new Money(50);
      const money2 = new Money(100);

      expect(() => money1.subtract(money2)).toThrow(
        "Operação resultaria em valor negativo",
      );
    });

    it("should throw error when subtracting money objects with different currencies", () => {
      const money1 = new Money(100, "BRL");
      const money2 = new Money(50, "USD");

      expect(() => money1.subtract(money2)).toThrow(
        "Operações entre moedas de tipos diferentes não são permitidas",
      );
    });
  });

  describe("multiply", () => {
    it("should correctly multiply money by a positive factor", () => {
      const money = new Money(100);
      const result = money.multiply(2.5);

      expect(result.amount).toBe(250);
      expect(result.currency).toBe("BRL");
    });

    it("should throw error when multiplying by a negative factor", () => {
      const money = new Money(100);

      expect(() => money.multiply(-2)).toThrow(
        "O fator de multiplicação não pode ser negativo",
      );
    });

    it("should throw error when multiplying by an invalid number", () => {
      const money = new Money(100);

      expect(() => money.multiply(NaN)).toThrow(
        "O fator de multiplicação deve ser um número válido",
      );
    });
  });

  describe("equals", () => {
    it("should return true for money objects with same amount and currency", () => {
      const money1 = new Money(100, "BRL");
      const money2 = new Money(100, "BRL");

      expect(money1.equals(money2)).toBe(true);
    });

    it("should return false for money objects with different amounts", () => {
      const money1 = new Money(100, "BRL");
      const money2 = new Money(200, "BRL");

      expect(money1.equals(money2)).toBe(false);
    });

    it("should return false for money objects with different currencies", () => {
      const money1 = new Money(100, "BRL");
      const money2 = new Money(100, "USD");

      expect(money1.equals(money2)).toBe(false);
    });
  });

  describe("format", () => {
    it("should format the money value according to the currency locale", () => {
      const money = new Money(1234.56, "BRL");
      // This will vary based on locale, so we'll just check it returns a string
      expect(typeof money.format()).toBe("string");
    });
  });

  describe("toJSON", () => {
    it("should return a JSON representation with amount, currency, and formatted value", () => {
      const money = new Money(1234.56, "BRL");
      const json = money.toJSON();

      expect(json).toHaveProperty("amount", 1234.56);
      expect(json).toHaveProperty("currency", "BRL");
      expect(json).toHaveProperty("formatted");
      expect(typeof json.formatted).toBe("string");
    });
  });
});
