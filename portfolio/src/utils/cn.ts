import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to conditionally merge CSS classes.
 * We are not using tailwind-merge here since the prompt specified Vanilla CSS.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
