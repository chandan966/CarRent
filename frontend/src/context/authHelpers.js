const AUTH_USER_STORAGE_KEY = "carrent.auth.user";

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");

  const savedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!savedUser) return null;

  try {
    const user = JSON.parse(savedUser);
    return user && typeof user === "object" && !Array.isArray(user)
      ? user
      : null;
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

export const storeUser = (userData) => {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userData));
};

export const removeStoredUser = () => {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
};

export const resolveRole = (userData) => {
  if (userData?.role) return userData.role;

  if (userData?.email?.toLowerCase() === "admin@car-rental.com") {
    return "admin";
  }

  return "user";
};
