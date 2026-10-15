import { apiRequest } from "./Api";

export async function getAccountFavorites() {
  const result = await apiRequest("/api/favorites");
  return result.favorites || [];
}

export function saveAccountFavorite(car, category) {
  return apiRequest("/api/favorites", { method: "POST", body: { car, category } });
}

export function deleteAccountFavorite(favoriteKey) {
  return apiRequest("/api/favorites", { method: "DELETE", body: { favoriteKey } });
}
