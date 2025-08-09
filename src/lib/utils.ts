import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * This function is used to convert data to substring
 * @param value -value
 * @param start -start
 * @param end -end
 */
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
