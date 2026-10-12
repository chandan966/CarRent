import { useState } from "react";
import { AuthContext } from "./authContext";
import {
  getStoredUser,
  removeStoredUser,
  resolveRole,
  storeUser,
} from "./authHelpers";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = (userData) => {
    const normalizedUser = {
      ...userData,
      role: resolveRole(userData),
    };

    storeUser(normalizedUser);

    setUser(normalizedUser);
  };

  const logout = () => {
    removeStoredUser();
    localStorage.removeItem("profileImage");

    setUser(null);
  };

  const signup = (userData) => {
    const normalizedUser = {
      ...userData,
      role: resolveRole(userData),
    };

    storeUser(normalizedUser);

    setUser(normalizedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}