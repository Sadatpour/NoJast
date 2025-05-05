import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
// import { format } from "date-fns"
// import { fa } from "@/lib/date-locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate slug from string
export const slugify = (text: string): string => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Get initials from name
export const getInitials = (name?: string | null): string => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  if (names.length === 0 || names[0] === '') return '?';
  if (names.length === 1) return names[0][0].toUpperCase();
  // Handle potential multiple spaces between names
  const filteredNames = names.filter(n => n !== '');
  if (filteredNames.length === 1) return filteredNames[0][0].toUpperCase();
  return (filteredNames[0][0] + filteredNames[filteredNames.length - 1][0]).toUpperCase();
}

// Set cookie helper
export const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;
  
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

// Format date to Persian format
export const formatDate = (date: Date | number): string => {
  try {
    // استفاده از API استاندارد جاوااسکریپت برای فرمت تاریخ فارسی
    return new Date(date).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date(date).toLocaleDateString();
  }
} 