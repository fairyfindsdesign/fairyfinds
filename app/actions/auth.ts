'use server';

import { cookies } from 'next/headers';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'fairyfinds@123';
const COOKIE_NAME = 'admin_session';

/**
 * Validates the admin password and sets an HTTP-only session cookie.
 */
export async function loginAdmin(password: string) {
  if (!password || !password.trim()) {
    return { success: false, error: 'Password is required.' };
  }

  // Artificial delay to prevent automated high-speed brute-force attacks
  await new Promise((resolve) => setTimeout(resolve, 300));

  const cleanInput = password.trim();
  const cleanExpected = (process.env.ADMIN_PASSWORD || 'fairyfinds@123').trim();

  if (cleanInput === cleanExpected) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return { success: true };
  }

  return {
    success: false,
    error: 'Incorrect password. Please enter the valid admin password.',
  };
}

/**
 * Clears the admin session cookie.
 */
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

/**
 * Server-side check if current visitor has a valid admin session.
 */
export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value === 'authenticated';
}
