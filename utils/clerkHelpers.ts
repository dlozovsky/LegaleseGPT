import React from 'react';
import { isClerkConfigured, getClerkPublishableKey, requireClerkExpo, tokenCache } from './authConfig';

// ---- Types ----------------------------------------------------------------
interface ClerkAuthHooks {
  useUser: () => { user: any };
  useAuth: () => { signOut: any; isSignedIn: boolean };
  useSignIn: () => { signIn: any; setActive: any; isLoaded: boolean };
  useSignUp: () => { signUp: any; setActive: any; isLoaded: boolean };
  available: boolean;
}

type ClerkProviderConfig =
  | { ClerkProvider: React.ComponentType<any>; publishableKey: string; available: true }
  | { available: false };

// ---- Stubs (used when Clerk is not installed / configured) -----------------
const stubUser = () => ({ user: null });
const stubAuth = () => ({ signOut: null, isSignedIn: false });
const stubSignIn = () => ({ signIn: null, setActive: null, isLoaded: false });
const stubSignUp = () => ({ signUp: null, setActive: null, isLoaded: false });

// ---- Resolved singletons ---------------------------------------------------
let _hooks: ClerkAuthHooks | null = null;
let _provider: ClerkProviderConfig | null = null;

/**
 * Returns Clerk React hooks (useUser, useAuth, useSignIn, useSignUp) if
 * the `@clerk/clerk-expo` package is installed *and* the publishable key
 * is configured.  Otherwise returns safe stubs.
 *
 * The result is cached so that the hook references are stable across renders.
 */
export function getClerkHooks(): ClerkAuthHooks {
  if (_hooks) return _hooks;

  try {
    const configured = isClerkConfigured();
    if (!configured) {
      _hooks = { useUser: stubUser, useAuth: stubAuth, useSignIn: stubSignIn, useSignUp: stubSignUp, available: false };
      return _hooks;
    }
    const mod = requireClerkExpo();
    if (mod) {
      _hooks = {
        useUser: mod.useUser ?? stubUser,
        useAuth: mod.useAuth ?? stubAuth,
        useSignIn: mod.useSignIn ?? stubSignIn,
        useSignUp: mod.useSignUp ?? stubSignUp,
        available: true,
      };
      return _hooks;
    }
  } catch {
    // Clerk not available
  }

  _hooks = { useUser: stubUser, useAuth: stubAuth, useSignIn: stubSignIn, useSignUp: stubSignUp, available: false };
  return _hooks;
}

/**
 * Returns the ClerkProvider component + publishable key when Clerk is properly
 * configured, or `{ available: false }` otherwise.
 */
export function getClerkProvider(): ClerkProviderConfig {
  if (_provider) return _provider;

  try {
    const clerkExpo = requireClerkExpo();
    const publishableKey = getClerkPublishableKey();
    if (clerkExpo && publishableKey) {
      _provider = { ClerkProvider: clerkExpo.ClerkProvider, publishableKey, available: true };
      return _provider;
    }
  } catch {
    // Clerk not available
  }

  _provider = { available: false };
  return _provider;
}

export { tokenCache };
