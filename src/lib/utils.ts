
export function cn(...classes: Array<string | undefined | null | boolean>): string {
  return classes.filter(Boolean).join(' ');
}
