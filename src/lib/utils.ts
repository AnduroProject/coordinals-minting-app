import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const convertToSubstring = (
  value: string,
  start: number,
  end: number,
): string => {
  if (value.length <= start + end) {
    return value;
  }
  return `${value.substring(0, start)}...${value.substring(value.length - end)}`;
};
