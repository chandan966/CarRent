import { randomUUID } from "node:crypto";
import {
  authenticatedUser,
  database,
  json,
  readJson,
  todayInIndia,
  verifySameOrigin,
} from "./auth.js";
import { createNotification, ensureMarketplaceSchema } from "./marketplace.js";

export async function handleBookingsRequest(request, response) {
  const method = String(request.method || "GET").toUpperCase();
  if (!["GET", "POST"].includes(method)) {
    response.setHeader("Allow", "GET, POST");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (method === "POST") {
    if (!verifySameOrigin(request)) return json(response, 403, { error: "Request origin could not be verified." });
    if (!String(request.headers?.["content-type"] || "").toLowerCase().startsWith("application/json")) {
      return json(response, 415, { error: "Send this request as JSON." });
    }
    if (Number(request.headers?.["content-length"] || 0) > 16 * 1024) {
      return json(response, 413, { error: "Request is too large." });
    }
  }

  try {
    const sql = database();
    await ensureMarketplaceSchema(sql);
    const user = await authenticatedUser(sql, request);
    if (!user) return json(response, 401, { error: "Please sign in to continue." });

    if (method === "GET") {
      const bookings = user.role === "admin"
        ? await sql`SELECT b.id, b.car_id AS carId, b.car_name AS carName, b.car_image AS carImage, b.booking_type AS bookingType, b.contact_name AS fullName, b.contact_phone AS mobile, u.email, b.start_date AS startDate, b.days, b.pickup_location AS pickupLocation, b.amount, b.status, b.payment_status AS paymentStatus, b.created_at AS createdAt FROM carrent_bookings b JOIN carrent_users u ON u.id = b.user_id ORDER BY b.created_at DESC`
        : await sql`SELECT id, car_id AS carId, car_name AS carName, car_image AS carImage, booking_type AS bookingType, contact_name AS fullName, contact_phone AS mobile, start_date AS startDate, days, pickup_location AS pickupLocation, amount, status, payment_status AS paymentStatus, created_at AS createdAt FROM carrent_bookings WHERE user_id = ${user.id} ORDER BY created_at DESC`;
      return json(response, 200, { bookings });
    }

    const body = await readJson(request);
    const bookingType = body.bookingType === "rent" ? "rent" : body.bookingType === "buy" ? "buy" : "";
    const carId = String(body.carId || "").trim();
    const [car] = await sql`SELECT id, listing_type AS listingType, name, image, location, price, price_per_day AS pricePerDay
      FROM carrent_cars WHERE id = ${carId} AND listing_type = ${bookingType} AND status = 'active'`;
    const fullName = String(body.fullName || "").trim();
    const mobile = String(body.mobile || "").trim();
    if (!car || fullName.length < 2 || fullName.length > 100 || !/^\+?[0-9 ()-]{7,20}$/.test(mobile)) {
      return json(response, 400, { error: "Check the selected car, name, and phone number." });
    }

    let days = null;
    let startDate = null;
    let amount = Number(car.price);
    if (bookingType === "rent") {
      days = Number(body.days);
      startDate = String(body.startDate || "");
      const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(startDate) ? new Date(`${startDate}T00:00:00Z`) : null;
      const validDate = parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === startDate;
      if (!Number.isInteger(days) || days < 1 || days > 90 || !validDate || startDate < todayInIndia()) {
        return json(response, 400, { error: "Choose a valid rental start date and duration (1–90 days)." });
      }
      amount = Number(car.pricePerDay) * days;
      const [conflict] = await sql`SELECT id FROM carrent_bookings
        WHERE car_id = ${carId} AND booking_type = 'rent' AND status IN ('Pending', 'Confirmed')
          AND start_date < DATE_ADD(${startDate}, INTERVAL ${days} DAY)
          AND DATE_ADD(start_date, INTERVAL days DAY) > ${startDate}
        LIMIT 1`;
      if (conflict) return json(response, 409, { error: "This car is not available for the selected dates. Choose another date." });
    }

    const pickupLocation = bookingType === "rent"
      ? String(body.pickupLocation || car.location).trim().slice(0, 120)
      : car.location;
    const id = `BOOK-${randomUUID()}`;
    await sql`
      INSERT INTO carrent_bookings
        (id, user_id, car_id, car_name, car_image, booking_type, contact_name, contact_phone, start_date, days, pickup_location, amount)
      VALUES
        (${id}, ${user.id}, ${car.id}, ${car.name}, ${car.image || ""}, ${bookingType}, ${fullName}, ${mobile}, ${startDate || null}, ${days}, ${pickupLocation}, ${amount})
    `;
    await createNotification(sql, user.id, "Booking request received", `Your ${bookingType === "rent" ? "rental" : "purchase"} request for ${car.name} is saved and awaiting review.`, "booking", "/my-bookings");
    const [booking] = await sql`
      SELECT id, car_id AS carId, car_name AS carName, car_image AS carImage,
        booking_type AS bookingType, contact_name AS fullName, contact_phone AS mobile,
        start_date AS startDate, days, pickup_location AS pickupLocation, amount,
        status, payment_status AS paymentStatus, created_at AS createdAt
      FROM carrent_bookings WHERE id = ${id}
    `;
    return json(response, 201, { booking });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status === 503) {
      const setupLocation = process.env.NODE_ENV === "production"
        ? "the backend deployment environment"
        : "Backend/.env.local, then restart the backend";
      return json(response, status, { error: `The booking database is not configured. Add DATABASE_URL to ${setupLocation}.` });
    }
    console.error("CarRent booking request failed:", error.code || "unknown error");
    return json(response, status, { error: "Booking service is temporarily unavailable." });
  }
}
