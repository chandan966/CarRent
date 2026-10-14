async function bookingRequest({ method = "GET", body } = {}) {
  const response = await fetch("/api/bookings", {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Booking request failed.");
  return result;
}

export async function getMyBookings() {
  const result = await bookingRequest();
  return result.bookings || [];
}

export async function createBooking(booking) {
  const result = await bookingRequest({ method: "POST", body: booking });
  return result.booking;
}
