export function not(value: any): boolean {
  return !value;
}

export function isNull(value: any): boolean {
  return value === null || value === undefined;
}

export function isNotNull(value: any): boolean {
  return not(isNull(value));
}
