function formatDate(value, fallback = "Not provided") {
  if (!value) return fallback;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function dateAfterDays(startDate, days) {
  if (!startDate || !Number.isInteger(Number(days)) || Number(days) < 1) return "";
  const date = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + Number(days));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getBookingHistory(bookings = []) {
  return Array.isArray(bookings) ? bookings : [];
}

export function getPurchaseHistory(bookings = []) {
  return getBookingHistory(bookings)
    .filter((booking) => booking.bookingType === "buy")
    .map((booking) => ({
      id: booking.id,
      carId: booking.carId,
      name: booking.carName || "Purchase request",
      image: booking.carImage || "",
      price: formatCurrency(booking.amount),
      amount: Number(booking.amount) || 0,
      location: booking.pickupLocation || "Location to be confirmed",
      date: formatDate(booking.createdAt),
      status: String(booking.status || "Pending").toLowerCase() === "completed" ? "Completed" : "Processing",
      payment: booking.paymentStatus || "Pending",
    }));
}

export function getRentalHistory(bookings = []) {
  return getBookingHistory(bookings)
    .filter((booking) => booking.bookingType === "rent")
    .map((booking) => {
      const status = String(booking.status || "Pending").toLowerCase();
      return {
        id: booking.id,
        carId: booking.carId,
        name: booking.carName || "Rental request",
        image: booking.carImage || "",
        location: booking.pickupLocation || "Location to be confirmed",
        startDate: formatDate(booking.startDate, "Not selected"),
        endDate: formatDate(dateAfterDays(booking.startDate, booking.days), "To be confirmed"),
        duration: Number(booking.days) > 0 ? `${booking.days} day${Number(booking.days) === 1 ? "" : "s"}` : "Not provided",
        price: formatCurrency(booking.amount),
        amount: Number(booking.amount) || 0,
        status: status === "completed" ? "Completed" : ["confirmed", "upcoming"].includes(status) ? "Upcoming" : "Pending",
        payment: booking.paymentStatus || "Pending",
      };
    });
}
