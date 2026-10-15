import { apiRequest } from "./Api";

export async function getCars(type = "") {
  const query = type ? `?type=${encodeURIComponent(type)}` : "";
  const result = await apiRequest(`/api/cars${query}`);
  return result.cars || [];
}

export async function createSellerListing(formData) {
  const result = await apiRequest("/api/cars", { method: "POST", body: formData });
  return result.car;
}

export async function getAdminCars() {
  const result = await apiRequest("/api/admin/cars");
  return result.cars || [];
}

export async function setCarListingStatus(car, status) {
  return apiRequest(`/api/admin/cars/${encodeURIComponent(car.id)}?type=${encodeURIComponent(car.listingType)}`, {
    method: "PATCH",
    body: { status },
  });
}

export async function deleteCarListing(car) {
  return apiRequest(`/api/admin/cars/${encodeURIComponent(car.id)}?type=${encodeURIComponent(car.listingType)}`, { method: "DELETE", body: {} });
}
