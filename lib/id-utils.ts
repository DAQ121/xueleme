export function toInt(id: string | number): number {
  return typeof id === 'string' ? parseInt(id, 10) : id;
}

export function toString(id: number | string): string {
  return String(id);
}

export function toIntArray(ids: (string | number)[]): number[] {
  return ids.map(toInt);
}
