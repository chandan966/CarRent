import { apiRequest } from "./Api";

export async function getAdminUsers() {
  const result = await apiRequest("/api/admin/users");
  return result.users || [];
}

export async function updateAdminUser(userId, changes) {
  const result = await apiRequest(`/api/admin/users/${encodeURIComponent(userId)}`, { method: "PATCH", body: changes });
  return result.user;
}

export async function getAdminPayments() {
  return apiRequest("/api/admin/payments");
}

export async function updateAdminBooking(bookingId, status) {
  return apiRequest(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, { method: "PATCH", body: { status } });
}

export async function createServiceRequest(request) {
  return apiRequest("/api/services/requests", { method: "POST", body: request });
}

export async function getServiceRequests() {
  const result = await apiRequest("/api/services/requests");
  return result.requests || [];
}

export async function updateServiceRequestStatus(id, status) {
  return apiRequest(`/api/admin/service-requests/${encodeURIComponent(id)}`, { method: "PATCH", body: { status } });
}

export async function getNotifications() {
  const result = await apiRequest("/api/notifications");
  return result.notifications || [];
}

export function markNotificationsRead(id) {
  return apiRequest("/api/notifications", { method: "PATCH", body: id ? { id } : {} });
}

export function deleteNotification(id) {
  return apiRequest("/api/notifications", { method: "DELETE", body: { id } });
}
