import { createHmac, timingSafeEqual } from "node:crypto";
import {
  authenticatedUser,
  database,
  ensureSchema,
  json,
  readJson,
  verifySameOrigin,
} from "./auth.js";
import { createNotification } from "./marketplace.js";

const RAZORPAY_API = "https://api.razorpay.com/v1";
const MAX_WEBHOOK_BYTES = 16 * 1024;

function getPaymentCredentials() {
  const keyId = String(process.env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = String(process.env.RAZORPAY_KEY_SECRET || "").trim();
  if (!keyId || !keySecret) {
    console.error("CarRent online payments are unavailable because Razorpay credentials are not configured.");
    const error = new Error("Online payments are temporarily unavailable. Please try again later.");
    error.statusCode = 503;
    throw error;
  }
  return { keyId, keySecret };
}

function getRazorpaySignature(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest();
}

function signatureMatches(payload, signature, secret) {
  if (!/^[a-f0-9]{64}$/i.test(String(signature || ""))) return false;
  const actual = Buffer.from(signature, "hex");
  const expected = getRazorpaySignature(payload, secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function callRazorpay(path, { method = "GET", body } = {}) {
  const { keyId, keySecret } = getPaymentCredentials();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response;
  try {
    response = await fetch(`${RAZORPAY_API}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    console.error("CarRent Razorpay request failed:", error.code || error.name || "network error");
    const requestError = new Error("Could not reach the payment provider. Please try again.");
    requestError.statusCode = 502;
    throw requestError;
  } finally {
    clearTimeout(timeout);
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("CarRent Razorpay request failed with status:", response.status);
    const requestError = new Error("The payment provider could not process this request. Please try again.");
    requestError.statusCode = 502;
    throw requestError;
  }
  return result;
}

async function handleCreateOrder(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (!verifySameOrigin(request)) return json(response, 403, { error: "Request origin could not be verified." });
  if (!String(request.headers?.["content-type"] || "").toLowerCase().startsWith("application/json")) {
    return json(response, 415, { error: "Send this request as JSON." });
  }

  const body = await readJson(request);
  const bookingId = String(body.bookingId || "").trim();
  if (!bookingId || bookingId.length > 64) return json(response, 400, { error: "A valid booking is required." });

  const sql = database();
  await ensureSchema(sql);
  const user = await authenticatedUser(sql, request);
  if (!user) return json(response, 401, { error: "Please sign in to continue." });

  const [booking] = await sql`
    SELECT id, user_id AS userId, booking_type AS bookingType, status,
      payment_status AS paymentStatus, payment_order_id AS paymentOrderId, amount
    FROM carrent_bookings WHERE id = ${bookingId} AND user_id = ${user.id}
  `;
  if (!booking || !["buy", "rent"].includes(booking.bookingType)) return json(response, 404, { error: "Booking not found." });
  const bookingLabel = booking.bookingType === "rent" ? "rental" : "purchase";
  if (String(booking.paymentStatus).toLowerCase() === "paid") {
    return json(response, 409, { error: `This ${bookingLabel} has already been paid.` });
  }
  if (!["Pending", "Confirmed"].includes(booking.status)) {
    return json(response, 409, { error: `This ${bookingLabel} is not available for payment.` });
  }

  const amount = Number(booking.amount);
  const amountInPaise = amount * 100;
  if (!Number.isSafeInteger(amount) || amount < 1 || !Number.isSafeInteger(amountInPaise)) {
    return json(response, 400, { error: "This booking amount cannot be processed online." });
  }

  let orderId = booking.paymentOrderId;
  if (!orderId) {
    const order = await callRazorpay("/orders", {
      method: "POST",
      body: {
        amount: amountInPaise,
        currency: "INR",
        receipt: booking.id.slice(-40),
        notes: { booking_id: booking.id },
      },
    });
    if (!/^order_[A-Za-z0-9]+$/.test(String(order.id || "")) ||
        order.amount !== amountInPaise || order.currency !== "INR" || order.status !== "created") {
      console.error("CarRent Razorpay returned an invalid order identifier.");
      return json(response, 502, { error: "The payment provider returned an invalid order. Please try again." });
    }
    orderId = order.id;
    await sql`
      UPDATE carrent_bookings SET payment_order_id = ${orderId}
      WHERE id = ${booking.id} AND user_id = ${user.id} AND status IN ('Pending', 'Confirmed')
        AND payment_status <> 'Paid' AND payment_order_id IS NULL
    `;
  }

  const [readyBooking] = await sql`
    SELECT payment_order_id AS paymentOrderId, status, payment_status AS paymentStatus
    FROM carrent_bookings WHERE id = ${booking.id} AND user_id = ${user.id}
  `;
  if (!readyBooking || !["Pending", "Confirmed"].includes(readyBooking.status) ||
      String(readyBooking.paymentStatus).toLowerCase() === "paid") {
    return json(response, 409, { error: "This booking is no longer available for payment." });
  }
  if (!readyBooking.paymentOrderId) {
    return json(response, 409, { error: "Could not reserve a payment order for this purchase. Please try again." });
  }
  orderId = readyBooking.paymentOrderId;

  return json(response, 200, {
    keyId: getPaymentCredentials().keyId,
    orderId,
    amount: amountInPaise,
    currency: "INR",
  });
}

async function handleVerifyPayment(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (!verifySameOrigin(request)) return json(response, 403, { error: "Request origin could not be verified." });
  if (!String(request.headers?.["content-type"] || "").toLowerCase().startsWith("application/json")) {
    return json(response, 415, { error: "Send this request as JSON." });
  }

  const body = await readJson(request);
  const bookingId = String(body.bookingId || "").trim();
  const orderId = String(body.razorpay_order_id || "").trim();
  const paymentId = String(body.razorpay_payment_id || "").trim();
  const signature = String(body.razorpay_signature || "").trim();
  if (!bookingId || bookingId.length > 64 || !/^order_[A-Za-z0-9]+$/.test(orderId) ||
      !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) {
    return json(response, 400, { error: "The payment confirmation is invalid." });
  }

  const { keySecret } = getPaymentCredentials();
  if (!signatureMatches(`${orderId}|${paymentId}`, signature, keySecret)) {
    return json(response, 400, { error: "The payment signature could not be verified." });
  }

  const sql = database();
  await ensureSchema(sql);
  const user = await authenticatedUser(sql, request);
  if (!user) return json(response, 401, { error: "Please sign in to continue." });
  const [booking] = await sql`
    SELECT id, user_id AS userId, booking_type AS bookingType, payment_status AS paymentStatus,
      payment_order_id AS paymentOrderId, payment_id AS paymentId, amount, car_name AS carName
    FROM carrent_bookings WHERE id = ${bookingId} AND user_id = ${user.id}
  `;
  if (!booking || !["buy", "rent"].includes(booking.bookingType) || booking.paymentOrderId !== orderId) {
    return json(response, 404, { error: "The booking payment could not be matched to your account." });
  }
  const bookingLabel = booking.bookingType === "rent" ? "rental" : "purchase";
  if (String(booking.paymentStatus).toLowerCase() === "paid") {
    if (booking.paymentId === paymentId) return json(response, 200, { paymentStatus: "Paid" });
    return json(response, 409, { error: `This ${bookingLabel} is already paid. Contact support if you were charged more than once.` });
  }

  let payment = await callRazorpay(`/payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== orderId || payment.currency !== "INR" ||
      payment.amount !== Number(booking.amount) * 100) {
    return json(response, 409, { error: "Payment has not been captured for the correct purchase amount." });
  }
  if (payment.status === "authorized") {
    payment = await callRazorpay(`/payments/${encodeURIComponent(paymentId)}/capture`, {
      method: "POST",
      body: { amount: payment.amount, currency: "INR" },
    });
  }
  if (payment.status !== "captured" || payment.order_id !== orderId ||
      payment.currency !== "INR" || payment.amount !== Number(booking.amount) * 100) {
    return json(response, 409, { error: "Payment has not been captured for the correct purchase amount." });
  }

  const [paymentUpdate] = await sql`
    UPDATE carrent_bookings SET payment_status = 'Paid', payment_id = ${paymentId}
    WHERE id = ${booking.id} AND user_id = ${user.id} AND payment_order_id = ${orderId} AND payment_status <> 'Paid'
  `;
  const [updatedBooking] = await sql`
    SELECT payment_status AS paymentStatus, payment_id AS paymentId
    FROM carrent_bookings WHERE id = ${booking.id} AND user_id = ${user.id}
  `;
  if (updatedBooking?.paymentId !== paymentId || String(updatedBooking.paymentStatus).toLowerCase() !== "paid") {
    return json(response, 409, { error: "This booking was paid in another checkout. Contact support if you were charged more than once." });
  }
  if (paymentUpdate.affectedRows === 1) {
    await createNotification(sql, user.id, "Payment received", `Your payment for ${booking.carName} has been confirmed.`, "booking", booking.bookingType === "rent" ? "/my-rentals" : "/my-purchases");
  }
  return json(response, 200, { paymentStatus: "Paid" });
}

async function readWebhookBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_WEBHOOK_BYTES) {
      const error = new Error("Webhook request is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function handleWebhook(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { error: "Method not allowed." });
  }
  const webhookSecret = String(process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();
  if (!webhookSecret) return json(response, 503, { error: "The Razorpay webhook is not configured." });

  const rawBody = await readWebhookBody(request);
  if (!signatureMatches(rawBody, request.headers?.["x-razorpay-signature"], webhookSecret)) {
    return json(response, 400, { error: "Webhook signature could not be verified." });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return json(response, 400, { error: "Webhook payload is invalid." });
  }
  if (event.event !== "payment.captured") return json(response, 200, { received: true });

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment?.id || payment.currency !== "INR" ||
      !Number.isSafeInteger(payment.amount) || payment.status !== "captured") {
    return json(response, 400, { error: "Captured payment details are invalid." });
  }

  const sql = database();
  await ensureSchema(sql);
  const [booking] = await sql`
    SELECT id, user_id AS userId, booking_type AS bookingType, amount,
      car_name AS carName, payment_status AS paymentStatus
    FROM carrent_bookings
    WHERE payment_order_id = ${payment.order_id} AND booking_type IN ('buy', 'rent')
    LIMIT 1
  `;
  if (!booking || Number(booking.amount) * 100 !== payment.amount) {
    return json(response, 200, { received: true });
  }
  if (String(booking.paymentStatus).toLowerCase() === "paid") {
    return json(response, 200, { received: true });
  }

  const [paymentUpdate] = await sql`
    UPDATE carrent_bookings SET payment_status = 'Paid', payment_id = ${payment.id}
    WHERE id = ${booking.id} AND payment_order_id = ${payment.order_id} AND payment_status <> 'Paid'
  `;
  if (paymentUpdate.affectedRows === 1) {
    await createNotification(sql, booking.userId, "Payment received", `Your payment for ${booking.carName} has been confirmed.`, "booking", booking.bookingType === "rent" ? "/my-rentals" : "/my-purchases");
  }
  return json(response, 200, { received: true });
}

export async function handlePaymentsRequest(request, response, pathname) {
  try {
    if (pathname === "/api/payments/order") return await handleCreateOrder(request, response);
    if (pathname === "/api/payments/verify") return await handleVerifyPayment(request, response);
    if (pathname === "/api/payments/webhook") return await handleWebhook(request, response);
    return json(response, 404, { error: "Payment endpoint not found." });
  } catch (error) {
    if (error.statusCode >= 500) console.error("CarRent payment request failed:", error.code || "payment error");
    return json(response, error.statusCode || (error instanceof SyntaxError ? 400 : 500), {
      error: error.statusCode ? error.message : error instanceof SyntaxError ? "Request body is invalid." : "The payment service could not complete this request.",
    });
  }
}
