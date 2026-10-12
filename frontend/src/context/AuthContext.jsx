import { useState } from "react";
import { AuthContext } from "./authContext";
import { getStoredUser, resolveRole } from "./authHelpers";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());

  const login = (userData) => {
    const normalizedUser = {
      ...userData,
      role: resolveRole(userData),
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("isLoggedIn", "true");

    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("profileImage");

    setUser(null);
  };

  const signup = (userData) => {
    const normalizedUser = {
      ...userData,
      role: resolveRole(userData),
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    localStorage.setItem("isLoggedIn", "true");

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