import { handleBookingsRequest } from "../_lib/bookings.js";

export default async function bookingsHandler(request, response) {
  return handleBookingsRequest(request, response);
}
