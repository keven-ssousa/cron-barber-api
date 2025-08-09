export class TimeSlot {
  private readonly _startTime: Date;
  private readonly _endTime: Date;

  constructor(startTime: Date, endTime: Date) {
    this.validateTimeSlot(startTime, endTime);
    this._startTime = startTime;
    this._endTime = endTime;
  }

  private validateTimeSlot(startTime: Date, endTime: Date): void {
    if (!(startTime instanceof Date) || !(endTime instanceof Date)) {
      throw new Error("Os horários devem ser instâncias de Date");
    }

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      throw new Error("Os horários devem ser datas válidas");
    }

    if (startTime >= endTime) {
      throw new Error(
        "O horário de início deve ser anterior ao horário de término",
      );
    }
  }

  public get startTime(): Date {
    return new Date(this._startTime);
  }

  public get endTime(): Date {
    return new Date(this._endTime);
  }

  public get durationMinutes(): number {
    return Math.floor(
      (this._endTime.getTime() - this._startTime.getTime()) / 60000,
    );
  }

  public overlaps(other: TimeSlot): boolean {
    return (
      (this._startTime < other._endTime && this._endTime > other._startTime) ||
      (other._startTime < this._endTime && other._endTime > this._startTime)
    );
  }

  public contains(date: Date): boolean {
    return date >= this._startTime && date < this._endTime;
  }

  public format(timezone: string = "UTC"): { start: string; end: string } {
    return {
      start: this.formatDateToTimezone(this._startTime, timezone),
      end: this.formatDateToTimezone(this._endTime, timezone),
    };
  }

  private formatDateToTimezone(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  public static createFromUtcString(
    date: string,
    startTimeString: string,
    endTimeString: string,
  ): TimeSlot {
    const [year, month, day] = date.split("-").map(Number);

    const [startHour, startMinute] = startTimeString.split(":").map(Number);
    const startTime = new Date(
      Date.UTC(year, month - 1, day, startHour, startMinute),
    );

    const [endHour, endMinute] = endTimeString.split(":").map(Number);
    const endTime = new Date(
      Date.UTC(year, month - 1, day, endHour, endMinute),
    );

    return new TimeSlot(startTime, endTime);
  }

  public equals(other: TimeSlot): boolean {
    return (
      this._startTime.getTime() === other._startTime.getTime() &&
      this._endTime.getTime() === other._endTime.getTime()
    );
  }

  public toJSON(): {
    startTime: string;
    endTime: string;
    durationMinutes: number;
  } {
    return {
      startTime: this._startTime.toISOString(),
      endTime: this._endTime.toISOString(),
      durationMinutes: this.durationMinutes,
    };
  }
}
