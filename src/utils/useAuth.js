import { useCallback } from 'react';
import { useAuth as useClerkAuth, useSignIn, useSignUp, useClerk } from '@clerk/react-router';

function useAuth() {
  const { signOut: clerkSignOut } = useClerk();
  const { signIn: clerkSignIn } = useSignIn();
  const { signUp: clerkSignUp } = useSignUp();

  const signInWithCredentials = useCallback(async (options) => {
    const { email, password, callbackUrl } = options ?? {};
    try {
      const result = await clerkSignIn.create({
        identifier: email,
        password,
      });
      if (result.status === 'complete') {
        window.location.href = callbackUrl ?? '/account';
      }
      return result;
    } catch (err) {
      console.error('Sign in error:', err);
      throw err;
    }
  }, [clerkSignIn]);

  const signUpWithCredentials = useCallback(async (options) => {
    const { email, password, name, callbackUrl } = options ?? {};
    try {
      const result = await clerkSignUp.create({
        emailAddress: email,
        password,
        firstName: name?.split(' ')[0],
        lastName: name?.split(' ').slice(1).join(' '),
      });
      if (result.status === 'complete') {
        window.location.href = callbackUrl ?? '/account';
      }
      return result;
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
    }
  }, [clerkSignUp]);

  const signInWithGoogle = useCallback(async (options) => {
    try {
      await clerkSignIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: options?.callbackUrl ?? '/account',
      });
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
    }
  }, [clerkSignIn]);

  const signOut = useCallback(async (options) => {
    await clerkSignOut();
    window.location.href = options?.callbackUrl ?? '/';
  }, [clerkSignOut]);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signOut,
  };
}

export default useAuth;