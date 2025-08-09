import { ScheduleRule } from "../../../../../src/domain/common/value-objects/schedule-rule.vo";

describe("ScheduleRule", () => {
  describe("constructor", () => {
    it("should create a valid schedule rule with default active status", () => {
      const rule = new ScheduleRule(1, "09:00", "17:00");

      expect(rule.dayOfWeek).toBe(1);
      expect(rule.startTime).toBe("09:00");
      expect(rule.endTime).toBe("17:00");
      expect(rule.isActive).toBe(true);
    });

    it("should create a valid schedule rule with explicit inactive status", () => {
      const rule = new ScheduleRule(1, "09:00", "17:00", false);

      expect(rule.dayOfWeek).toBe(1);
      expect(rule.startTime).toBe("09:00");
      expect(rule.endTime).toBe("17:00");
      expect(rule.isActive).toBe(false);
    });

    it("should throw error if day of week is invalid", () => {
      expect(() => new ScheduleRule(-1, "09:00", "17:00")).toThrow(
        "Dia da semana deve ser um número entre 0 (Domingo) e 6 (Sábado)",
      );

      expect(() => new ScheduleRule(7, "09:00", "17:00")).toThrow(
        "Dia da semana deve ser um número entre 0 (Domingo) e 6 (Sábado)",
      );
    });

    it("should throw error if time format is invalid", () => {
      expect(() => new ScheduleRule(1, "invalid", "17:00")).toThrow(
        "O horário de início deve estar no formato HH:MM (24h)",
      );

      expect(() => new ScheduleRule(1, "09:00", "invalid")).toThrow(
        "O horário de término deve estar no formato HH:MM (24h)",
      );
    });

    it("should throw error if start time is after or equal to end time", () => {
      expect(() => new ScheduleRule(1, "17:00", "09:00")).toThrow(
        "O horário de início deve ser anterior ao horário de término",
      );

      expect(() => new ScheduleRule(1, "09:00", "09:00")).toThrow(
        "O horário de início deve ser anterior ao horário de término",
      );
    });
  });

  describe("getDayName", () => {
    it("should return correct day name for each day of week", () => {
      const dayNames = [
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado",
      ];

      for (let i = 0; i <= 6; i++) {
        const rule = new ScheduleRule(i, "09:00", "17:00");
        expect(rule.getDayName()).toBe(dayNames[i]);
      }
    });
  });

  describe("getFormattedTime", () => {
    it("should return properly formatted time range string", () => {
      const rule = new ScheduleRule(1, "09:00", "17:00");
      expect(rule.getFormattedTime()).toBe("09:00 - 17:00");
    });
  });

  describe("deactivate", () => {
    it("should return a new inactive rule with same parameters", () => {
      const rule = new ScheduleRule(1, "09:00", "17:00");
      const inactiveRule = rule.deactivate();

      expect(inactiveRule.dayOfWeek).toBe(1);
      expect(inactiveRule.startTime).toBe("09:00");
      expect(inactiveRule.endTime).toBe("17:00");
      expect(inactiveRule.isActive).toBe(false);
    });
  });

  describe("activate", () => {
    it("should return a new active rule with same parameters", () => {
      const rule = new ScheduleRule(1, "09:00", "17:00", false);
      const activeRule = rule.activate();

      expect(activeRule.dayOfWeek).toBe(1);
      expect(activeRule.startTime).toBe("09:00");
      expect(activeRule.endTime).toBe("17:00");
      expect(activeRule.isActive).toBe(true);
    });
  });

  describe("updateTimes", () => {
    it("should return a new rule with updated times", () => {
      const rule = new ScheduleRule(1, "09:00", "17:00");
      const updatedRule = rule.updateTimes("10:00", "18:00");

      expect(updatedRule.dayOfWeek).toBe(1);
      expect(updatedRule.startTime).toBe("10:00");
      expect(updatedRule.endTime).toBe("18:00");
      expect(updatedRule.isActive).toBe(true);
    });
  });

  describe("equals", () => {
    it("should return true for rules with identical properties", () => {
      const rule1 = new ScheduleRule(1, "09:00", "17:00");
      const rule2 = new ScheduleRule(1, "09:00", "17:00");

      expect(rule1.equals(rule2)).toBe(true);
    });

    it("should return false for rules with different properties", () => {
      const rule1 = new ScheduleRule(1, "09:00", "17:00");
      const rule2 = new ScheduleRule(1, "10:00", "17:00");
      const rule3 = new ScheduleRule(2, "09:00", "17:00");
      const rule4 = new ScheduleRule(1, "09:00", "17:00", false);

      expect(rule1.equals(rule2)).toBe(false);
      expect(rule1.equals(rule3)).toBe(false);
      expect(rule1.equals(rule4)).toBe(false);
    });
  });

  describe("toJSON", () => {
    it("should return a JSON representation with all properties", () => {
      const rule = new ScheduleRule(1, "09:00", "17:00");
      const json = rule.toJSON();

      expect(json).toEqual({
        dayOfWeek: 1,
        dayName: "Segunda-feira",
        startTime: "09:00",
        endTime: "17:00",
        isActive: true,
      });
    });
  });
});
