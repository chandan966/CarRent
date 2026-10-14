const BOOKING_HISTORY_KEY = "carRentalBookingHistory";

export function getBookingHistory() {
  if (typeof window === "undefined") return [];

  try {
    const savedHistory = JSON.parse(
      window.localStorage.getItem(BOOKING_HISTORY_KEY) || "[]"
    );
    const history = Array.isArray(savedHistory) ? savedHistory : [];
    const latestBooking = JSON.parse(
      window.localStorage.getItem("latestBooking") || "null"
    );

    if (!latestBooking) return history;

    const alreadyInHistory = history.some((booking) =>
      (booking.id && latestBooking.id && booking.id === latestBooking.id) ||
      (booking.createdAt && latestBooking.createdAt &&
        booking.createdAt === latestBooking.createdAt)
    );

    return alreadyInHistory ? history : [latestBooking, ...history];
  } catch (error) {
    console.error("Error loading bookings:", error);
    return [];
  }
}

export function saveBooking(booking) {
  if (typeof window === "undefined") return [];

  const savedBooking = {
    ...booking,
    id: booking.id || `BOOK-${Date.now()}`,
  };
  const history = getBookingHistory();
  const updatedHistory = [
    savedBooking,
    ...history.filter((item) => item.id !== savedBooking.id),
  ];

  try {
    window.localStorage.setItem("latestBooking", JSON.stringify(savedBooking));
    window.localStorage.setItem(
      BOOKING_HISTORY_KEY,
      JSON.stringify(updatedHistory)
    );
  } catch (error) {
    console.error("Error saving booking:", error);
  }

  return updatedHistory;
}
