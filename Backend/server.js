import { createServer } from "node:http";
import { loadBackendEnv } from "./src/config/env.js";

await loadBackendEnv();

// Load these only after NODE_ENV and the private local environment are ready.
const [{ handleAuthRequest }, { handleBookingsRequest }] = await Promise.all([
  import("./src/api/auth.js"),
  import("./src/api/bookings.js"),
]);
const [{ database }, { handleAdminRequest, handleCatalogRequest, handleFavoritesRequest, handleNotificationsRequest, handleServicesRequest, ensureMarketplaceSchema, serveUploadedImage }] = await Promise.all([
  import("./src/api/auth.js"),
  import("./src/api/marketplace.js"),
]);

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

const server = createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-DNS-Prefetch-Control", "off");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
  if (process.env.NODE_ENV === "production") response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  let pathname;
  try {
    pathname = new URL(request.url || "/", "http://localhost").pathname;
  } catch {
    return sendJson(response, 400, { error: "Invalid request URL." });
  }

  try {
    if (pathname === "/api/health" && request.method === "GET") {
      try {
        const sql = database();
        await ensureMarketplaceSchema(sql);
        await sql`SELECT 1 AS ready`;
        return sendJson(response, 200, { status: "ok", service: "carrent-api", database: "connected" });
      } catch (error) {
        console.error("CarRent database readiness failed:", error.code || "database error");
        const configured = Boolean(process.env.DATABASE_URL);
        const message = !configured
          ? "DATABASE_URL is missing from Backend/.env.local."
          : process.env.NODE_ENV === "production"
            ? "The database is unavailable. Check the backend host logs."
            : `MySQL is unavailable (${String(error.code || "connection error").slice(0, 64)}). Check Backend/.env.local and the MySQL service.`;
        return sendJson(response, 503, { status: "error", service: "carrent-api", error: message });
      }
    }
    if (pathname.startsWith("/api/auth/")) {
      return await handleAuthRequest(request, response);
    }
    if (pathname === "/api/bookings") {
      return await handleBookingsRequest(request, response);
    }
    if (pathname === "/api/cars" || pathname.startsWith("/api/cars/")) {
      return await handleCatalogRequest(request, response);
    }
    if (pathname === "/api/favorites") {
      return await handleFavoritesRequest(request, response);
    }
    if (pathname === "/api/notifications") {
      return await handleNotificationsRequest(request, response);
    }
    if (pathname === "/api/services/requests") {
      return await handleServicesRequest(request, response);
    }
    if (pathname.startsWith("/api/admin/")) {
      return await handleAdminRequest(request, response);
    }
    if (pathname.startsWith("/uploads/") && request.method === "GET") {
      return serveUploadedImage(request, response, pathname);
    }
    return sendJson(response, 404, { error: "API endpoint not found." });
  } catch (error) {
    console.error("CarRent API request failed:", error.code || "request error");
    if (!response.headersSent) {
      return sendJson(response, 500, { error: "The API could not complete this request." });
    }
    response.end();
  }
});

const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port number.");
}

const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
server.listen(port, host, () => {
  console.log(`CarRent API listening at http://${host}:${port}`);
});
