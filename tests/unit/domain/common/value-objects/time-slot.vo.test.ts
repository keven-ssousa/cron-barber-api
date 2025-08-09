import { TimeSlot } from "../../../../../src/domain/common/value-objects/time-slot.vo";

describe("TimeSlot", () => {
  describe("constructor", () => {
    it("should create a valid time slot", () => {
      const startTime = new Date("2024-01-01T10:00:00Z");
      const endTime = new Date("2024-01-01T11:00:00Z");
      const timeSlot = new TimeSlot(startTime, endTime);

      expect(timeSlot.startTime).toEqual(startTime);
      expect(timeSlot.endTime).toEqual(endTime);
      expect(timeSlot.durationMinutes).toBe(60);
    });

    it("should throw error if start time is after end time", () => {
      const startTime = new Date("2024-01-01T11:00:00Z");
      const endTime = new Date("2024-01-01T10:00:00Z");

      expect(() => new TimeSlot(startTime, endTime)).toThrow(
        "O horário de início deve ser anterior ao horário de término",
      );
    });

    it("should throw error if dates are invalid", () => {
      const invalidDate = new Date("invalid");
      const validDate = new Date("2024-01-01T10:00:00Z");

      expect(() => new TimeSlot(invalidDate, validDate)).toThrow(
        "Os horários devem ser datas válidas",
      );

      expect(() => new TimeSlot(validDate, invalidDate)).toThrow(
        "Os horários devem ser datas válidas",
      );
    });
  });

  describe("overlaps", () => {
    it("should return true when time slots overlap", () => {
      const timeSlot1 = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );
      const timeSlot2 = new TimeSlot(
        new Date("2024-01-01T10:30:00Z"),
        new Date("2024-01-01T11:30:00Z"),
      );

      expect(timeSlot1.overlaps(timeSlot2)).toBe(true);
      expect(timeSlot2.overlaps(timeSlot1)).toBe(true);
    });

    it("should return false when time slots do not overlap", () => {
      const timeSlot1 = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );
      const timeSlot2 = new TimeSlot(
        new Date("2024-01-01T11:00:00Z"),
        new Date("2024-01-01T12:00:00Z"),
      );

      expect(timeSlot1.overlaps(timeSlot2)).toBe(false);
      expect(timeSlot2.overlaps(timeSlot1)).toBe(false);
    });
  });

  describe("contains", () => {
    it("should return true when date is within time slot", () => {
      const timeSlot = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );
      const date = new Date("2024-01-01T10:30:00Z");

      expect(timeSlot.contains(date)).toBe(true);
    });

    it("should return true when date is equal to start time", () => {
      const startTime = new Date("2024-01-01T10:00:00Z");
      const endTime = new Date("2024-01-01T11:00:00Z");
      const timeSlot = new TimeSlot(startTime, endTime);

      expect(timeSlot.contains(new Date("2024-01-01T10:00:00Z"))).toBe(true);
    });

    it("should return false when date is equal to end time", () => {
      const startTime = new Date("2024-01-01T10:00:00Z");
      const endTime = new Date("2024-01-01T11:00:00Z");
      const timeSlot = new TimeSlot(startTime, endTime);

      expect(timeSlot.contains(new Date("2024-01-01T11:00:00Z"))).toBe(false);
    });

    it("should return false when date is outside time slot", () => {
      const timeSlot = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );

      expect(timeSlot.contains(new Date("2024-01-01T09:59:59Z"))).toBe(false);
      expect(timeSlot.contains(new Date("2024-01-01T11:00:01Z"))).toBe(false);
    });
  });

  describe("createFromUtcString", () => {
    it("should create a valid TimeSlot from UTC strings", () => {
      const date = "2024-01-01";
      const startTime = "10:00";
      const endTime = "11:00";

      const timeSlot = TimeSlot.createFromUtcString(date, startTime, endTime);

      expect(timeSlot.startTime.toISOString()).toBe("2024-01-01T10:00:00.000Z");
      expect(timeSlot.endTime.toISOString()).toBe("2024-01-01T11:00:00.000Z");
      expect(timeSlot.durationMinutes).toBe(60);
    });
  });

  describe("equals", () => {
    it("should return true for equal time slots", () => {
      const timeSlot1 = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );
      const timeSlot2 = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );

      expect(timeSlot1.equals(timeSlot2)).toBe(true);
    });

    it("should return false for different time slots", () => {
      const timeSlot1 = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );
      const timeSlot2 = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:30:00Z"),
      );

      expect(timeSlot1.equals(timeSlot2)).toBe(false);
    });
  });

  describe("format", () => {
    it("should format time slot correctly with default timezone", () => {
      const timeSlot = new TimeSlot(
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
      );

      // Since the formatting depends on the locale and timezone, we just verify the structure
      const formatted = timeSlot.format();
      expect(formatted).toHaveProperty("start");
      expect(formatted).toHaveProperty("end");
    });
  });
});
