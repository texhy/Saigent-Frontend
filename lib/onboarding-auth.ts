/**
 * Client-side onboarding auth (localStorage).
 * Used to gate /channels until user has completed login from the welcome flow.
 */

const KEY_USER = 'saigent_onboarding_user';
const KEY_LOGGED_IN = 'saigent_onboarding_logged_in';

export type BusinessType = 'ecommerce' | 'service';

export interface OnboardingUser {
  email: string;
  password: string;
  businessType: BusinessType;
  businessName: string;
  shopDomain?: string;
}

export function getStoredUser(): OnboardingUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? (JSON.parse(raw) as OnboardingUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: OnboardingUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY_USER, JSON.stringify(user));
}

export function isOnboardingLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEY_LOGGED_IN) === 'true';
}

export function setOnboardingLoggedIn(loggedIn: boolean): void {
  if (typeof window === 'undefined') return;
  if (loggedIn) {
    localStorage.setItem(KEY_LOGGED_IN, 'true');
  } else {
    localStorage.removeItem(KEY_LOGGED_IN);
  }
}

export function loginOnboarding(email: string, password: string, businessType: BusinessType): boolean {
  const user = getStoredUser();
  if (!user) return false;
  if (user.email !== email || user.password !== password || user.businessType !== businessType) {
    return false;
  }
  setOnboardingLoggedIn(true);
  return true;
}

export function logoutOnboarding(): void {
  setOnboardingLoggedIn(false);
}
