import { test as base, Page } from '@playwright/test';

// Unique ID generator for test isolation
export function uniqueId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Generate unique email
export function uniqueEmail(prefix = 'user'): string {
  return `${prefix}-${uniqueId()}@test.com`;
}

// Test user data
export interface TestUser {
  email: string;
  password: string;
  name: string;
}

// Create a test user via API
export async function createUserViaAPI(
  request: any,
  user: TestUser & { role?: 'admin' | 'employee' }
): Promise<{ token: string; user: any }> {
  const response = await request.post('http://localhost:3000/api/auth/register', {
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role || 'employee',
    },
  });
  return response.json();
}

// Create a seat via API
export async function createSeatViaAPI(
  request: any,
  token: string,
  seat: { name: string; type?: 'regular' | 'standing' }
): Promise<any> {
  const response = await request.post('http://localhost:3000/api/seats', {
    headers: { Authorization: `Bearer ${token}` },
    data: seat,
  });
  return response.json();
}

// Login helper
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'));
}

// Register helper
export async function register(
  page: Page,
  name: string,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');
  await page.click('text=Don\'t have an account');
  await page.fill('input#name', name);
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.fill('input#confirmPassword', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'));
}

// Logout helper
export async function logout(page: Page): Promise<void> {
  await page.click('text=Logout');
  await page.waitForURL('/login');
}

// Get future date in YYYY-MM-DD format
export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Extended test fixture with API request context
export const test = base.extend<{
  apiRequest: any;
}>({
  apiRequest: async ({ playwright }: { playwright: any }, use: any) => {
    const context = await playwright.request.newContext({
      baseURL: 'http://localhost:3000',
    });
    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
