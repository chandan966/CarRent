export const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  const savedUser = localStorage.getItem("user");

  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
};

export const resolveRole = (userData) => {
  if (userData?.role) return userData.role;

  if (userData?.email?.toLowerCase() === "admin@car-rental.com") {
    return "admin";
  }

  return "user";
};
