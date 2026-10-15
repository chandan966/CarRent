import { mkdir, unlink, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { buyCars, rentalCars } from "../../../shared/cars.js";
import { authenticatedUser, database, ensureSchema, json, readJson, verifySameOrigin } from "./auth.js";

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const uploadRoot = resolve(backendRoot, "uploads");
const MAX_UPLOAD_FILE_BYTES = 5 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 54 * 1024 * 1024;
let marketplaceReady;

export async function ensureMarketplaceSchema(sql) {
  await ensureSchema(sql);
  if (!marketplaceReady) {
    marketplaceReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS carrent_cars (
        id varchar(64) NOT NULL,
        listing_type enum('buy', 'rent') NOT NULL,
        name varchar(160) NOT NULL,
        brand varchar(80) NOT NULL,
        model varchar(100) NOT NULL,
        year smallint NOT NULL,
        vehicle_type varchar(32) NOT NULL DEFAULT 'Car',
        price integer NULL,
        price_per_day integer NULL,
        location varchar(120) NOT NULL,
        fuel varchar(32) NOT NULL DEFAULT 'Petrol',
        transmission varchar(32) NOT NULL DEFAULT 'Automatic',
        seats smallint NOT NULL DEFAULT 5,
        mileage varchar(60) NOT NULL DEFAULT '',
        image text NOT NULL,
        images_json json NOT NULL,
        badge varchar(40) NOT NULL DEFAULT '',
        seller_name varchar(100) NOT NULL DEFAULT '',
        seller_phone varchar(20) NOT NULL DEFAULT '',
        seller_email varchar(254) NOT NULL DEFAULT '',
        owner_id varchar(64) NULL,
        status enum('pending', 'active', 'rejected') NOT NULL DEFAULT 'active',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, listing_type),
        KEY carrent_cars_public_idx (listing_type, status, created_at),
        KEY carrent_cars_owner_idx (owner_id),
        CONSTRAINT carrent_cars_owner_fk FOREIGN KEY (owner_id)
          REFERENCES carrent_users(id) ON DELETE SET NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_favorites (
        user_id varchar(64) NOT NULL,
        favorite_key varchar(220) NOT NULL,
        category varchar(16) NOT NULL,
        car_json json NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, favorite_key),
        KEY carrent_favorites_user_idx (user_id, created_at),
        CONSTRAINT carrent_favorites_user_fk FOREIGN KEY (user_id)
          REFERENCES carrent_users(id) ON DELETE CASCADE
      )`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_service_requests (
        id varchar(64) PRIMARY KEY,
        user_id varchar(64) NULL,
        service_id varchar(40) NOT NULL,
        service_name varchar(100) NOT NULL,
        full_name varchar(100) NOT NULL,
        email varchar(254) NOT NULL,
        phone varchar(20) NOT NULL,
        preferred_date date NOT NULL,
        notes varchar(1000) NOT NULL DEFAULT '',
        status enum('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY carrent_service_requests_created_idx (created_at),
        KEY carrent_service_requests_user_idx (user_id),
        CONSTRAINT carrent_service_requests_user_fk FOREIGN KEY (user_id)
          REFERENCES carrent_users(id) ON DELETE SET NULL
      )`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_notifications (
        id varchar(64) PRIMARY KEY,
        user_id varchar(64) NOT NULL,
        title varchar(120) NOT NULL,
        message varchar(500) NOT NULL,
        notification_type varchar(24) NOT NULL DEFAULT 'booking',
        href varchar(240) NOT NULL DEFAULT '/my-bookings',
        is_read boolean NOT NULL DEFAULT FALSE,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY carrent_notifications_user_idx (user_id, is_read, created_at),
        CONSTRAINT carrent_notifications_user_fk FOREIGN KEY (user_id)
          REFERENCES carrent_users(id) ON DELETE CASCADE
      )`;

      for (const [listingType, cars] of [["buy", buyCars], ["rent", rentalCars]]) {
        for (const car of cars) {
          await sql`INSERT IGNORE INTO carrent_cars
            (id, listing_type, name, brand, model, year, vehicle_type, price, price_per_day,
             location, fuel, transmission, seats, mileage, image, images_json, badge,
             seller_name, seller_phone, status)
            VALUES
            (${String(car.id)}, ${listingType}, ${car.name}, ${car.brand}, ${car.model || car.name.replace(`${car.brand} `, "")},
             ${car.year}, ${car.type || "Sedan"}, ${listingType === "buy" ? car.price : null},
             ${listingType === "rent" ? car.pricePerDay : null}, ${car.location}, ${car.fuel},
             ${car.transmission}, ${car.seats || 5}, ${car.mileage || ""}, ${car.image},
             ${JSON.stringify([car.image])}, ${car.badge || ""}, ${car.sellerName || "CarRent"},
             ${car.sellerPhone || ""}, 'active')`;
        }
      }
    })().catch((error) => {
      marketplaceReady = undefined;
      throw error;
    });
  }
  return marketplaceReady;
}

export async function createNotification(sql, userId, title, message, type = "booking", href = "/my-bookings") {
  try {
    await sql`INSERT INTO carrent_notifications (id, user_id, title, message, notification_type, href)
      VALUES (${randomUUID()}, ${userId}, ${title.slice(0, 120)}, ${message.slice(0, 500)}, ${type.slice(0, 24)}, ${href.slice(0, 240)})`;
  } catch (error) {
    // A notification must not turn an already-saved booking or admin update
    // into a failed response that could be submitted twice.
    console.error("CarRent notification save failed:", error.code || "database error");
  }
}

function formatPrice(value, listingType) {
  const amount = Number(value || 0);
  const formatted = `₹${amount.toLocaleString("en-IN")}`;
  return listingType === "rent" ? `${formatted}/day` : formatted;
}

function mapCar(row) {
  const photos = Array.isArray(row.imagesJson)
    ? row.imagesJson
    : typeof row.imagesJson === "string" ? JSON.parse(row.imagesJson || "[]") : [];
  const sale = row.listingType === "buy";
  const priceValue = Number(sale ? row.price : row.pricePerDay);
  return {
    id: row.id,
    listingType: row.listingType,
    name: row.name,
    brand: row.brand,
    model: row.model,
    year: Number(row.year),
    type: row.vehicleType,
    price: sale ? priceValue : formatPrice(priceValue, "rent"),
    priceValue: sale ? priceValue : undefined,
    pricePerDay: sale ? undefined : priceValue,
    priceLabel: formatPrice(priceValue, row.listingType),
    location: row.location,
    fuel: row.fuel,
    transmission: row.transmission,
    seats: Number(row.seats),
    mileage: row.mileage,
    image: row.image,
    images: photos,
    badge: row.badge,
    sellerName: row.sellerName,
    sellerPhone: row.sellerPhone,
    sellerEmail: row.sellerEmail,
    status: row.status,
  };
}

function isMutating(request) {
  return !["GET", "HEAD", "OPTIONS"].includes(String(request.method || "GET").toUpperCase());
}

function verifyMutation(request, response, maxBytes = 16 * 1024, requireJson = true) {
  if (!verifySameOrigin(request)) {
    json(response, 403, { error: "Request origin could not be verified." });
    return false;
  }
  if (Number(request.headers?.["content-length"] || 0) > maxBytes) {
    json(response, 413, { error: "Request is too large." });
    return false;
  }
  if (requireJson && !String(request.headers?.["content-type"] || "").toLowerCase().startsWith("application/json")) {
    json(response, 415, { error: "Send this request as JSON." });
    return false;
  }
  return true;
}

async function getSignedInUser(sql, request, response) {
  const user = await authenticatedUser(sql, request);
  if (!user) json(response, 401, { error: "Please sign in to continue." });
  return user;
}

async function getAdmin(sql, request, response) {
  const user = await getSignedInUser(sql, request, response);
  if (!user) return null;
  if (user.role !== "admin") {
    json(response, 403, { error: "Administrator access is required." });
    return null;
  }
  return user;
}

async function readRequestBody(request) {
  try {
    return await readJson(request);
  } catch (error) {
    if (error.statusCode) throw error;
    const invalid = new Error("Request body must be valid JSON.");
    invalid.statusCode = 400;
    throw invalid;
  }
}

function imageExtension(file) {
  const bytes = file.data;
  if (file.mime === "image/jpeg" && bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
  if (file.mime === "image/png" && bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return ".png";
  if (file.mime === "image/webp" && bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return ".webp";
  return "";
}

async function readMultipart(request) {
  const contentType = String(request.headers?.["content-type"] || "");
  const boundary = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!/^multipart\/form-data\b/i.test(contentType) || !boundary) {
    const error = new Error("Upload car photos using a multipart form.");
    error.statusCode = 415;
    throw error;
  }
  const marker = Buffer.from(`--${boundary[1] || boundary[2]}`);
  const chunks = [];
  let total = 0;
  for await (const chunk of request) {
    total += chunk.length;
    if (total > MAX_UPLOAD_BYTES) {
      const error = new Error("The photo upload is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks);
  const fields = {};
  const files = { outsidePhotos: [], insidePhotos: [] };
  let offset = raw.indexOf(marker);
  while (offset !== -1) {
    offset += marker.length;
    if (raw.subarray(offset, offset + 2).toString() === "--") break;
    if (raw.subarray(offset, offset + 2).toString() === "\r\n") offset += 2;
    const headerEnd = raw.indexOf(Buffer.from("\r\n\r\n"), offset);
    if (headerEnd < 0) break;
    const headers = raw.subarray(offset, headerEnd).toString("utf8");
    const bodyStart = headerEnd + 4;
    const partEnd = raw.indexOf(marker, bodyStart);
    if (partEnd < 0) break;
    let bodyEnd = partEnd;
    if (raw.subarray(bodyEnd - 2, bodyEnd).toString() === "\r\n") bodyEnd -= 2;
    const disposition = headers.match(/content-disposition:\s*form-data;([^\r\n]+)/i)?.[1] || "";
    const fieldName = disposition.match(/name="([^"]+)"/i)?.[1] || "";
    const filename = disposition.match(/filename="([^"]*)"/i)?.[1];
    const data = raw.subarray(bodyStart, bodyEnd);
    if (filename !== undefined && filename !== "") {
      const mime = headers.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim().toLowerCase() || "";
      if (!files[fieldName]) {
        const error = new Error("Unexpected photo field.");
        error.statusCode = 400;
        throw error;
      }
      if (data.length > MAX_UPLOAD_FILE_BYTES) {
        const error = new Error("Each image must be 5 MB or smaller.");
        error.statusCode = 413;
        throw error;
      }
      const extension = imageExtension({ mime, data });
      if (!extension) {
        const error = new Error("Only valid JPG, PNG, and WebP image files are accepted.");
        error.statusCode = 400;
        throw error;
      }
      if (files[fieldName].length >= 5) {
        const error = new Error("Upload no more than 5 photos per section.");
        error.statusCode = 400;
        throw error;
      }
      files[fieldName].push({ filename, mime, data, extension });
    } else if (fieldName) {
      if (data.length > 2048) {
        const error = new Error("A listing field is too long.");
        error.statusCode = 400;
        throw error;
      }
      fields[fieldName] = data.toString("utf8");
    }
    offset = partEnd;
  }
  return { fields, files };
}

function validateSellerListing(fields) {
  const clean = {
    brand: String(fields.brand || "").trim(),
    model: String(fields.model || "").trim(),
    year: Number(fields.year),
    price: Number(fields.price),
    location: String(fields.location || "").trim(),
    mileage: String(fields.mileage || "").trim(),
    fuel: String(fields.fuel || "Petrol").trim(),
    transmission: String(fields.transmission || "Automatic").trim(),
    phone: String(fields.phone || "").trim(),
  };
  const currentYear = new Date().getFullYear() + 1;
  if (clean.brand.length < 2 || clean.brand.length > 80 || clean.model.length < 1 || clean.model.length > 100) return null;
  if (!Number.isInteger(clean.year) || clean.year < 1950 || clean.year > currentYear) return null;
  if (!Number.isSafeInteger(clean.price) || clean.price < 1 || clean.price > 100_000_000) return null;
  if (clean.location.length < 2 || clean.location.length > 120 || clean.mileage.length > 60) return null;
  if (!/^[A-Za-z][A-Za-z -]{1,31}$/.test(clean.fuel) || !/^(Automatic|Manual)$/i.test(clean.transmission)) return null;
  if (!/^\+?[0-9 ()-]{7,20}$/.test(clean.phone)) return null;
  return clean;
}

async function createSellerListing(request, response) {
  if (!verifyMutation(request, response, MAX_UPLOAD_BYTES, false)) return;
  const sql = database();
  await ensureMarketplaceSchema(sql);
  const user = await getSignedInUser(sql, request, response);
  if (!user) return;
  const { fields, files } = await readMultipart(request);
  const listing = validateSellerListing(fields);
  if (!listing) return json(response, 400, { error: "Check the car details and contact phone number." });
  if (!files.outsidePhotos.length || !files.insidePhotos.length) {
    return json(response, 400, { error: "Upload at least one outside and one inside photo." });
  }

  await mkdir(uploadRoot, { recursive: true });
  const savedFiles = [];
  try {
    const outside = [];
    const inside = [];
    for (const [key, destination] of [["outsidePhotos", outside], ["insidePhotos", inside]]) {
      for (const file of files[key]) {
        const filename = `${randomUUID()}${file.extension}`;
        await writeFile(resolve(uploadRoot, filename), file.data, { flag: "wx" });
        savedFiles.push(filename);
        destination.push(`/uploads/${filename}`);
      }
    }
    const id = `seller-${randomUUID()}`;
    const images = [...outside, ...inside];
    const name = `${listing.brand} ${listing.model}`;
    await sql`INSERT INTO carrent_cars
      (id, listing_type, name, brand, model, year, vehicle_type, price, location, fuel,
       transmission, seats, mileage, image, images_json, badge, seller_name, seller_phone,
       seller_email, owner_id, status)
      VALUES (${id}, 'buy', ${name}, ${listing.brand}, ${listing.model}, ${listing.year}, 'Car',
       ${listing.price}, ${listing.location}, ${listing.fuel}, ${listing.transmission}, 5,
       ${listing.mileage}, ${outside[0]}, ${JSON.stringify(images)}, 'New listing',
       ${user.fullName}, ${listing.phone}, ${user.email}, ${user.id}, 'pending')`;
    const [row] = await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType,
      price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image,
      images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone,
      seller_email AS sellerEmail, status FROM carrent_cars WHERE id = ${id} AND listing_type = 'buy'`;
    return json(response, 201, { car: mapCar(row) });
  } catch (error) {
    await Promise.all(savedFiles.map((filename) => unlink(resolve(uploadRoot, filename)).catch(() => {})));
    throw error;
  }
}

export async function handleCatalogRequest(request, response) {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  const method = String(request.method || "GET").toUpperCase();
  try {
    if (pathname === "/api/cars" && method === "POST") return await createSellerListing(request, response);
    if (pathname !== "/api/cars" && !pathname.startsWith("/api/cars/")) return json(response, 404, { error: "Car endpoint not found." });
    if (method !== "GET") {
      response.setHeader("Allow", pathname === "/api/cars" ? "GET, POST" : "GET");
      return json(response, 405, { error: "Method not allowed." });
    }
    const sql = database();
    await ensureMarketplaceSchema(sql);
    const type = new URL(request.url || "/", "http://localhost").searchParams.get("type");
    const id = pathname.slice("/api/cars/".length);
    if (id) {
      const [row] = type === "rent"
        ? await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType, price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image, images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone, seller_email AS sellerEmail, status FROM carrent_cars WHERE id = ${decodeURIComponent(id)} AND listing_type = 'rent' AND status = 'active'`
        : await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType, price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image, images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone, seller_email AS sellerEmail, status FROM carrent_cars WHERE id = ${decodeURIComponent(id)} AND listing_type = 'buy' AND status = 'active'`;
      return row ? json(response, 200, { car: mapCar(row) }) : json(response, 404, { error: "Car not found." });
    }
    const rows = type === "buy"
      ? await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType, price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image, images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone, seller_email AS sellerEmail, status FROM carrent_cars WHERE listing_type = 'buy' AND status = 'active' ORDER BY created_at DESC`
      : type === "rent"
        ? await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType, price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image, images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone, seller_email AS sellerEmail, status FROM carrent_cars WHERE listing_type = 'rent' AND status = 'active' ORDER BY created_at DESC`
        : await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType, price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image, images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone, seller_email AS sellerEmail, status FROM carrent_cars WHERE status = 'active' ORDER BY created_at DESC`;
    return json(response, 200, { cars: rows.map(mapCar) });
  } catch (error) {
    return apiError(response, error, "Car catalogue");
  }
}

async function handleAdminCars(request, response, pathname) {
  const sql = database();
  await ensureMarketplaceSchema(sql);
  if (!(await getAdmin(sql, request, response))) return;
  const method = String(request.method || "GET").toUpperCase();
  if (pathname === "/api/admin/cars" && method === "GET") {
    const cars = await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType, price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image, images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone, seller_email AS sellerEmail, status, owner_id AS ownerId, created_at AS createdAt FROM carrent_cars ORDER BY created_at DESC`;
    return json(response, 200, { cars: cars.map(mapCar) });
  }
  const match = pathname.match(/^\/api\/admin\/cars\/([^/]+)$/);
  if (!match || !["PATCH", "DELETE"].includes(method)) {
    response.setHeader("Allow", "GET, PATCH, DELETE");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (!verifyMutation(request, response)) return;
  const id = decodeURIComponent(match[1]);
  const type = new URL(request.url || "/", "http://localhost").searchParams.get("type") === "rent" ? "rent" : "buy";
  if (method === "DELETE") {
    const [used] = await sql`SELECT COUNT(*) AS count FROM carrent_bookings WHERE car_id = ${id} AND booking_type = ${type}`;
    if (Number(used?.count) > 0) return json(response, 409, { error: "This car has booking history. Archive it instead of deleting it." });
    const result = await sql`DELETE FROM carrent_cars WHERE id = ${id} AND listing_type = ${type}`;
    return Number(result.affectedRows) ? json(response, 200, { ok: true }) : json(response, 404, { error: "Car not found." });
  }
  const body = await readRequestBody(request);
  const status = String(body.status || "").toLowerCase();
  if (!["pending", "active", "rejected"].includes(status)) return json(response, 400, { error: "Status must be pending, active, or rejected." });
  const [existing] = await sql`SELECT id FROM carrent_cars WHERE id = ${id} AND listing_type = ${type}`;
  if (!existing) return json(response, 404, { error: "Car not found." });
  await sql`UPDATE carrent_cars SET status = ${status} WHERE id = ${id} AND listing_type = ${type}`;
  return json(response, 200, { ok: true, status });
}

async function handleAdminUsers(request, response, pathname) {
  const sql = database();
  await ensureMarketplaceSchema(sql);
  const actor = await getAdmin(sql, request, response);
  if (!actor) return;
  const method = String(request.method || "GET").toUpperCase();
  if (pathname === "/api/admin/users" && method === "GET") {
    const users = await sql`SELECT id, full_name AS fullName, email, phone, location, role, is_active AS isActive, created_at AS createdAt FROM carrent_users ORDER BY created_at DESC`;
    return json(response, 200, { users });
  }
  const match = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (!match || method !== "PATCH") {
    response.setHeader("Allow", "GET, PATCH");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (!verifyMutation(request, response)) return;
  const targetId = decodeURIComponent(match[1]);
  const body = await readRequestBody(request);
  const changes = {};
  if (body.role !== undefined) {
    if (!["user", "admin"].includes(body.role)) return json(response, 400, { error: "Role must be user or admin." });
    changes.role = body.role;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") return json(response, 400, { error: "isActive must be true or false." });
    changes.isActive = body.isActive;
  }
  if (!Object.keys(changes).length) return json(response, 400, { error: "No supported account change was provided." });
  if (actor.id === targetId && (changes.role === "user" || changes.isActive === false)) {
    return json(response, 409, { error: "You cannot remove your own administrator access or disable your own account." });
  }
  const [target] = await sql`SELECT id, role, is_active AS isActive FROM carrent_users WHERE id = ${targetId}`;
  if (!target) return json(response, 404, { error: "User not found." });
  const removesAdmin = target.role === "admin" && ((changes.role && changes.role !== "admin") || changes.isActive === false);
  if (removesAdmin && target.isActive) {
    const [count] = await sql`SELECT COUNT(*) AS count FROM carrent_users WHERE role = 'admin' AND is_active = TRUE`;
    if (Number(count.count) <= 1) return json(response, 409, { error: "The last active administrator cannot be removed." });
  }
  if (changes.role !== undefined && changes.isActive !== undefined) {
    await sql`UPDATE carrent_users SET role = ${changes.role}, is_active = ${changes.isActive} WHERE id = ${targetId}`;
  } else if (changes.role !== undefined) {
    await sql`UPDATE carrent_users SET role = ${changes.role} WHERE id = ${targetId}`;
  } else {
    await sql`UPDATE carrent_users SET is_active = ${changes.isActive} WHERE id = ${targetId}`;
  }
  if (changes.isActive === false) await sql`DELETE FROM carrent_sessions WHERE user_id = ${targetId}`;
  const [user] = await sql`SELECT id, full_name AS fullName, email, phone, location, role, is_active AS isActive, created_at AS createdAt FROM carrent_users WHERE id = ${targetId}`;
  return json(response, 200, { user });
}

async function handleAdminBookings(request, response, pathname) {
  const sql = database();
  await ensureMarketplaceSchema(sql);
  if (!(await getAdmin(sql, request, response))) return;
  const match = pathname.match(/^\/api\/admin\/bookings\/([^/]+)$/);
  if (!match || request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (!verifyMutation(request, response)) return;
  const body = await readRequestBody(request);
  const status = String(body.status || "");
  if (!["Pending", "Confirmed", "Cancelled", "Completed"].includes(status)) {
    return json(response, 400, { error: "Choose a valid booking status." });
  }
  const bookingId = decodeURIComponent(match[1]);
  const [booking] = await sql`SELECT user_id AS userId, car_name AS carName, status FROM carrent_bookings WHERE id = ${bookingId}`;
  if (!booking) return json(response, 404, { error: "Booking not found." });
  await sql`UPDATE carrent_bookings SET status = ${status} WHERE id = ${bookingId}`;
  if (booking.status !== status) await createNotification(sql, booking.userId, "Booking status updated", `Your request for ${booking.carName} is now ${status.toLowerCase()}.`, "booking", "/my-bookings");
  return json(response, 200, { ok: true, status });
}

async function handleAdminServiceRequests(request, response, pathname) {
  const sql = database();
  await ensureMarketplaceSchema(sql);
  if (!(await getAdmin(sql, request, response))) return;
  const match = pathname.match(/^\/api\/admin\/service-requests\/([^/]+)$/);
  if (!match || request.method !== "PATCH") {
    response.setHeader("Allow", "PATCH");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (!verifyMutation(request, response)) return;
  const body = await readRequestBody(request);
  const status = String(body.status || "").toLowerCase();
  if (!["pending", "confirmed", "completed", "cancelled"].includes(status)) return json(response, 400, { error: "Choose a valid service request status." });
  const id = decodeURIComponent(match[1]);
  const [serviceRequest] = await sql`SELECT user_id AS userId, service_name AS serviceName, status FROM carrent_service_requests WHERE id = ${id}`;
  if (!serviceRequest) return json(response, 404, { error: "Service request not found." });
  await sql`UPDATE carrent_service_requests SET status = ${status} WHERE id = ${id}`;
  if (serviceRequest.userId && serviceRequest.status !== status) await createNotification(sql, serviceRequest.userId, "Service request updated", `Your ${serviceRequest.serviceName} request is now ${status}.`, "service", "/notifications");
  return json(response, 200, { ok: true, status });
}

const serviceCatalog = new Map([
  ["1", "Car Service"], ["2", "Car Detailing"], ["3", "Car Inspection"],
  ["4", "Battery Service"], ["5", "Diagnostics"], ["6", "General Maintenance"],
]);
const serviceRequestBuckets = new Map();

async function handleServiceRequests(request, response) {
  const method = String(request.method || "GET").toUpperCase();
  const sql = database();
  await ensureMarketplaceSchema(sql);
  if (method === "POST") {
    if (!verifyMutation(request, response)) return;
    if (!String(request.headers?.["content-type"] || "").toLowerCase().startsWith("application/json")) return json(response, 415, { error: "Send this request as JSON." });
    const ip = String(request.headers?.["x-forwarded-for"] || request.socket?.remoteAddress || "unknown").split(",")[0].trim();
    const now = Date.now();
    const bucket = serviceRequestBuckets.get(ip) || { count: 0, start: now };
    if (now - bucket.start > 60 * 60 * 1000) { bucket.count = 0; bucket.start = now; }
    bucket.count += 1;
    serviceRequestBuckets.set(ip, bucket);
    if (bucket.count > 8) return json(response, 429, { error: "Too many service requests. Please try again later." });
    const body = await readRequestBody(request);
    const serviceId = String(body.serviceId || "");
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();
    const date = String(body.date || "");
    const notes = String(body.notes || "").trim();
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
    if (!serviceCatalog.has(serviceId) || fullName.length < 2 || fullName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^\+?[0-9 ()-]{7,20}$/.test(phone) || !parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || date < new Date().toISOString().slice(0, 10) || notes.length > 1000) {
      return json(response, 400, { error: "Check the service, contact details, preferred date, and notes." });
    }
    const user = await authenticatedUser(sql, request);
    const id = `SERVICE-${randomUUID()}`;
    await sql`INSERT INTO carrent_service_requests
      (id, user_id, service_id, service_name, full_name, email, phone, preferred_date, notes)
      VALUES (${id}, ${user?.id || null}, ${serviceId}, ${serviceCatalog.get(serviceId)}, ${fullName}, ${email}, ${phone}, ${date}, ${notes})`;
    if (user) await createNotification(sql, user.id, "Service request submitted", `Your ${serviceCatalog.get(serviceId)} request is saved for ${date}.`, "service", "/notifications");
    return json(response, 201, { request: { id, serviceId, serviceName: serviceCatalog.get(serviceId), status: "pending", preferredDate: date } });
  }
  if (method === "GET") {
    if (!(await getAdmin(sql, request, response))) return;
    const requests = await sql`SELECT id, user_id AS userId, service_id AS serviceId, service_name AS serviceName, full_name AS fullName, email, phone, preferred_date AS preferredDate, notes, status, created_at AS createdAt FROM carrent_service_requests ORDER BY created_at DESC`;
    return json(response, 200, { requests });
  }
  response.setHeader("Allow", "GET, POST");
  return json(response, 405, { error: "Method not allowed." });
}

export async function handleAdminRequest(request, response) {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  try {
    if (pathname === "/api/admin/cars" || pathname.startsWith("/api/admin/cars/")) return await handleAdminCars(request, response, pathname);
    if (pathname === "/api/admin/users" || pathname.startsWith("/api/admin/users/")) return await handleAdminUsers(request, response, pathname);
    if (pathname.startsWith("/api/admin/bookings/")) return await handleAdminBookings(request, response, pathname);
    if (pathname.startsWith("/api/admin/service-requests/")) return await handleAdminServiceRequests(request, response, pathname);
    if (pathname === "/api/admin/payments" && request.method === "GET") {
      const sql = database();
      await ensureMarketplaceSchema(sql);
      if (!(await getAdmin(sql, request, response))) return;
      const payments = await sql`SELECT b.id AS bookingId, b.car_name AS carName, b.booking_type AS bookingType,
        b.amount, b.payment_status AS paymentStatus, b.status AS bookingStatus, b.created_at AS createdAt,
        u.full_name AS customerName, u.email FROM carrent_bookings b JOIN carrent_users u ON u.id = b.user_id
        ORDER BY b.created_at DESC`;
      return json(response, 200, { payments, providerConfigured: Boolean(process.env.PAYMENT_PROVIDER_SECRET) });
    }
    if (pathname === "/api/admin/payments") {
      response.setHeader("Allow", "GET");
      return json(response, 405, { error: "Method not allowed." });
    }
    return json(response, 404, { error: "Admin endpoint not found." });
  } catch (error) {
    return apiError(response, error, "Admin service");
  }
}

export async function handleServicesRequest(request, response) {
  try {
    return await handleServiceRequests(request, response);
  } catch (error) {
    return apiError(response, error, "Service request");
  }
}

export async function handleFavoritesRequest(request, response) {
  try {
    if (isMutating(request) && !verifyMutation(request, response)) return;
    const sql = database();
    await ensureMarketplaceSchema(sql);
    const user = await getSignedInUser(sql, request, response);
    if (!user) return;
    const method = String(request.method || "GET").toUpperCase();
    if (method === "GET") {
      const rows = await sql`SELECT favorite_key AS favoriteKey, category, car_json AS carJson FROM carrent_favorites WHERE user_id = ${user.id} ORDER BY created_at DESC`;
      return json(response, 200, { favorites: rows.map((row) => ({ ...(typeof row.carJson === "string" ? JSON.parse(row.carJson) : row.carJson), category: row.category, favoriteKey: row.favoriteKey })) });
    }
    if (method === "POST") {
      const body = await readRequestBody(request);
      const car = body.car && typeof body.car === "object" ? body.car : null;
      const category = String(body.category || "");
      if (!car || !["buy", "rent"].includes(category) || String(car.name || "").trim().length < 2 || String(car.name).length > 160 || String(car.id || "").length > 64) {
        return json(response, 400, { error: "Choose a valid car to save." });
      }
      const [carRow] = await sql`SELECT id, listing_type AS listingType, name, brand, model, year, vehicle_type AS vehicleType, price, price_per_day AS pricePerDay, location, fuel, transmission, seats, mileage, image, images_json AS imagesJson, badge, seller_name AS sellerName, seller_phone AS sellerPhone, seller_email AS sellerEmail, status FROM carrent_cars WHERE id = ${String(car.id)} AND listing_type = ${category} AND status = 'active'`;
      if (!carRow) return json(response, 404, { error: "This car is no longer available." });
      const safeCar = mapCar(carRow);
      const key = `${category}:${String(safeCar.id)}`;
      await sql`INSERT INTO carrent_favorites (user_id, favorite_key, category, car_json)
        VALUES (${user.id}, ${key}, ${category}, ${JSON.stringify(safeCar)})
        ON DUPLICATE KEY UPDATE car_json = VALUES(car_json)`;
      return json(response, 201, { favoriteKey: key });
    }
    if (method === "DELETE") {
      const body = await readRequestBody(request);
      const key = String(body.favoriteKey || "").slice(0, 220);
      if (!key) return json(response, 400, { error: "Favorite key is required." });
      await sql`DELETE FROM carrent_favorites WHERE user_id = ${user.id} AND favorite_key = ${key}`;
      return json(response, 200, { ok: true });
    }
    response.setHeader("Allow", "GET, POST, DELETE");
    return json(response, 405, { error: "Method not allowed." });
  } catch (error) {
    return apiError(response, error, "Favorites service");
  }
}

export async function handleNotificationsRequest(request, response) {
  try {
    const sql = database();
    await ensureMarketplaceSchema(sql);
    const user = await getSignedInUser(sql, request, response);
    if (!user) return;
    const method = String(request.method || "GET").toUpperCase();
    if (method === "GET") {
      const notifications = await sql`SELECT id, title, message, notification_type AS type, href, is_read AS isRead, created_at AS createdAt FROM carrent_notifications WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 100`;
      return json(response, 200, { notifications });
    }
    if (!["PATCH", "DELETE"].includes(method)) {
      response.setHeader("Allow", "GET, PATCH, DELETE");
      return json(response, 405, { error: "Method not allowed." });
    }
    if (!verifyMutation(request, response)) return;
    if (method === "PATCH") {
      const body = await readRequestBody(request);
      const id = String(body.id || "");
      if (id) await sql`UPDATE carrent_notifications SET is_read = TRUE WHERE id = ${id} AND user_id = ${user.id}`;
      else await sql`UPDATE carrent_notifications SET is_read = TRUE WHERE user_id = ${user.id}`;
      return json(response, 200, { ok: true });
    }
    const body = await readRequestBody(request);
    const id = String(body.id || "");
    if (!id) return json(response, 400, { error: "Notification ID is required." });
    await sql`DELETE FROM carrent_notifications WHERE id = ${id} AND user_id = ${user.id}`;
    return json(response, 200, { ok: true });
  } catch (error) {
    return apiError(response, error, "Notifications service");
  }
}

export function serveUploadedImage(request, response, pathname) {
  const filename = decodeURIComponent(pathname.slice("/uploads/".length));
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename)) return json(response, 404, { error: "Image not found." });
  const path = resolve(uploadRoot, filename);
  if (!path.startsWith(`${uploadRoot}/`) && !path.startsWith(`${uploadRoot}\\`)) return json(response, 404, { error: "Image not found." });
  const stream = createReadStream(path);
  stream.on("error", () => {
    if (!response.headersSent) json(response, 404, { error: "Image not found." });
    else response.destroy();
  });
  const extension = filename.split(".").at(-1);
  response.statusCode = 200;
  response.setHeader("Content-Type", extension === "jpg" ? "image/jpeg" : `image/${extension}`);
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  response.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  stream.pipe(response);
}

function apiError(response, error, service) {
  const status = Number(error.statusCode) || (error instanceof SyntaxError ? 400 : 500);
  if (status >= 500) console.error(`CarRent ${service} failed:`, error.code || "request error");
  const message = status === 503 && process.env.NODE_ENV !== "production"
    ? "Database is not configured. Check Backend/.env.local and ensure MySQL is running."
    : status >= 500 ? `${service} is temporarily unavailable.` : error.message;
  return json(response, status, { error: message });
}
