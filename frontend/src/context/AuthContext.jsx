import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  updateAccountProfile,
} from "../Services/authServices";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    for (const key of [
      "carrent.auth.user",
      "user",
      "isLoggedIn",
      "carRentalBookingHistory",
      "latestBooking",
      "profileImage",
    ]) {
      try {
        localStorage.removeItem(key);
      } catch {
        // Browser storage can be unavailable in privacy-restricted contexts.
      }
    }
    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const authenticatedUser = await signIn(credentials);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const signup = useCallback(async (account) => {
    const registeredUser = await signUp(account);
    setUser(registeredUser);
    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut();
    } finally {
      setUser(null);
    }
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const updatedUser = await updateAccountProfile(profile);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
  }), [user, isLoading, login, signup, logout, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
