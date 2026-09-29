import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMacUserAgent(ua: string): boolean {
  return /Mac|iPhone|iPad|iPod/.test(ua);
}
