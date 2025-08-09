export class ScheduleRule {
  private readonly _dayOfWeek: number;
  private readonly _startTime: string;
  private readonly _endTime: string;
  private readonly _isActive: boolean;

  constructor(
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    isActive: boolean = true,
  ) {
    this.validateDayOfWeek(dayOfWeek);
    this.validateTimeFormat(startTime, "horário de início");
    this.validateTimeFormat(endTime, "horário de término");
    this.validateTimeRange(startTime, endTime);

    this._dayOfWeek = dayOfWeek;
    this._startTime = startTime;
    this._endTime = endTime;
    this._isActive = isActive;
  }

  private validateDayOfWeek(dayOfWeek: number): void {
    if (typeof dayOfWeek !== "number" || dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error(
        "Dia da semana deve ser um número entre 0 (Domingo) e 6 (Sábado)",
      );
    }
  }

  private validateTimeFormat(time: string, fieldName: string): void {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) {
      throw new Error(`O ${fieldName} deve estar no formato HH:MM (24h)`);
    }
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (startTotal >= endTotal) {
      throw new Error(
        "O horário de início deve ser anterior ao horário de término",
      );
    }
  }

  public get dayOfWeek(): number {
    return this._dayOfWeek;
  }

  public get startTime(): string {
    return this._startTime;
  }

  public get endTime(): string {
    return this._endTime;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  public getDayName(): string {
    const days = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    return days[this._dayOfWeek];
  }

  public getFormattedTime(): string {
    return `${this._startTime} - ${this._endTime}`;
  }

  public deactivate(): ScheduleRule {
    return new ScheduleRule(
      this._dayOfWeek,
      this._startTime,
      this._endTime,
      false,
    );
  }

  public activate(): ScheduleRule {
    return new ScheduleRule(
      this._dayOfWeek,
      this._startTime,
      this._endTime,
      true,
    );
  }

  public updateTimes(startTime: string, endTime: string): ScheduleRule {
    return new ScheduleRule(
      this._dayOfWeek,
      startTime,
      endTime,
      this._isActive,
    );
  }

  public equals(other: ScheduleRule): boolean {
    return (
      this._dayOfWeek === other._dayOfWeek &&
      this._startTime === other._startTime &&
      this._endTime === other._endTime &&
      this._isActive === other._isActive
    );
  }

  public toJSON(): {
    dayOfWeek: number;
    dayName: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
  } {
    return {
      dayOfWeek: this._dayOfWeek,
      dayName: this.getDayName(),
      startTime: this._startTime,
      endTime: this._endTime,
      isActive: this._isActive,
    };
  }
}
