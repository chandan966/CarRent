import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import postgres from "postgres";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_COST = 32768;
const PASSWORD_BLOCK_SIZE = 8;
const PASSWORD_PARALLELISM = 1;
const MAX_BODY_BYTES = 16 * 1024;
const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-carent_session" : "carent_session";
let sqlClient;
let schemaReady;

export function database() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("Authentication database is not configured.");
    error.statusCode = 503;
    throw error;
  }

  if (!sqlClient) {
    sqlClient = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      prepare: false,
    });
  }

  return sqlClient;
}

export async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS carrent_users (
        id text PRIMARY KEY,
        full_name varchar(100) NOT NULL,
        email varchar(254) NOT NULL UNIQUE,
        phone varchar(20) NOT NULL DEFAULT '',
        location varchar(120) NOT NULL DEFAULT 'India',
        password_hash text NOT NULL,
        role varchar(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`ALTER TABLE carrent_users ADD COLUMN IF NOT EXISTS location varchar(120) NOT NULL DEFAULT 'India'`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_sessions (
        token_hash char(64) PRIMARY KEY,
        user_id text NOT NULL REFERENCES carrent_users(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now(),
        expires_at timestamptz NOT NULL
      )`;
      await sql`CREATE INDEX IF NOT EXISTS carrent_sessions_user_idx ON carrent_sessions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS carrent_sessions_expiry_idx ON carrent_sessions(expires_at)`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_bookings (
        id text PRIMARY KEY,
        user_id text NOT NULL REFERENCES carrent_users(id) ON DELETE CASCADE,
        car_id integer NOT NULL,
        car_name varchar(160) NOT NULL,
        car_image text NOT NULL DEFAULT '',
        booking_type varchar(10) NOT NULL CHECK (booking_type IN ('buy', 'rent')),
        contact_name varchar(100) NOT NULL,
        contact_phone varchar(20) NOT NULL,
        start_date date,
        days integer,
        pickup_location varchar(120) NOT NULL DEFAULT '',
        amount integer NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'Pending',
        payment_status varchar(20) NOT NULL DEFAULT 'Pending',
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS carrent_bookings_user_idx ON carrent_bookings(user_id, created_at DESC)`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_auth_limits (
        fingerprint char(64) PRIMARY KEY,
        attempts integer NOT NULL,
        window_started_at timestamptz NOT NULL,
        blocked_until timestamptz
      )`;
    })().catch((error) => {
      schemaReady = undefined;
      throw error;
    });
  }

  return schemaReady;
}

export function json(response, status, payload, extraHeaders = {}) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Frame-Options", "DENY");
  for (const [name, value] of Object.entries(extraHeaders)) {
    response.setHeader(name, value);
  }
  response.end(JSON.stringify(payload));
}

function setSessionCookie(response, token, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const expiry = Number.isInteger(maxAge) ? `; Max-Age=${maxAge}` : "";
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${expiry}${secure}`
  );
}

function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
  );
}

function getCookie(request, name) {
  const cookieHeader = request.headers?.cookie || "";
  for (const item of cookieHeader.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === name) {
      return decodeURIComponent(item.slice(separator + 1).trim());
    }
  }
  return "";
}

function hashToken(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64, {
    N: PASSWORD_COST,
    r: PASSWORD_BLOCK_SIZE,
    p: PASSWORD_PARALLELISM,
    maxmem: 128 * 1024 * 1024,
  });
  return `scrypt$${PASSWORD_COST}$${PASSWORD_BLOCK_SIZE}$${PASSWORD_PARALLELISM}$${salt.toString("base64")}$${Buffer.from(hash).toString("base64")}`;
}

async function verifyPassword(password, encoded) {
  const [algorithm, nText, rText, pText, saltText, hashText] = String(encoded || "").split("$");
  if (algorithm !== "scrypt" || !nText || !rText || !pText || !saltText || !hashText) return false;
  const n = Number(nText);
  const r = Number(rText);
  const p = Number(pText);
  if (n < 16384 || n > 65536 || r !== 8 || p !== 1) return false;
  const expected = Buffer.from(hashText, "base64");
  if (expected.length !== 64) return false;
  const actual = Buffer.from(await scrypt(password, Buffer.from(saltText, "base64"), expected.length, {
    N: n,
    r,
    p,
    maxmem: 128 * 1024 * 1024,
  }));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function readJson(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body);

  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) {
      const error = new Error("Request is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function requestAction(request) {
  if (request.query?.action) return String(request.query.action).toLowerCase();
  const segments = String(request.url || "").split("?")[0].split("/").filter(Boolean);
  return String(segments.at(-1) || "").toLowerCase();
}

export function verifySameOrigin(request) {
  const origin = request.headers?.origin;
  if (!origin) return false;
  const host = request.headers?.["x-forwarded-host"] || request.headers?.host;
  if (!host) return false;
  const protocol = request.headers?.["x-forwarded-proto"]?.split(",")[0]?.trim() ||
    (process.env.NODE_ENV === "production" ? "https" : "http");
  try {
    return new URL(origin).origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}

function getRequestFingerprint(request, email, scope) {
  const ip = String(request.headers?.["x-forwarded-for"] || request.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
  return hashToken(`${scope}:${email}:${ip}`);
}

export function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function isBlocked(sql, fingerprint) {
  const [limit] = await sql`SELECT blocked_until FROM carrent_auth_limits WHERE fingerprint = ${fingerprint}`;
  return Boolean(limit?.blocked_until && new Date(limit.blocked_until).getTime() > Date.now());
}

async function recordFailure(sql, fingerprint, maxAttempts, windowMinutes) {
  await sql`
    INSERT INTO carrent_auth_limits (fingerprint, attempts, window_started_at, blocked_until)
    VALUES (${fingerprint}, 1, now(), NULL)
    ON CONFLICT (fingerprint) DO UPDATE SET
      attempts = CASE
        WHEN carrent_auth_limits.window_started_at < now() - (${windowMinutes} * interval '1 minute') THEN 1
        ELSE carrent_auth_limits.attempts + 1
      END,
      window_started_at = CASE
        WHEN carrent_auth_limits.window_started_at < now() - (${windowMinutes} * interval '1 minute') THEN now()
        ELSE carrent_auth_limits.window_started_at
      END,
      blocked_until = CASE
        WHEN carrent_auth_limits.window_started_at < now() - (${windowMinutes} * interval '1 minute') THEN NULL
        WHEN carrent_auth_limits.attempts + 1 >= ${maxAttempts} THEN now() + (${windowMinutes} * interval '1 minute')
        ELSE carrent_auth_limits.blocked_until
      END
  `;
}

async function createSession(sql, userId, response, remember = false) {
  const ttlSeconds = remember ? SESSION_TTL_SECONDS : 60 * 60 * 12;
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  await sql`
    INSERT INTO carrent_sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, now() + (${ttlSeconds} * interval '1 second'))
  `;
  setSessionCookie(response, rawToken, remember ? ttlSeconds : undefined);
}

export async function authenticatedUser(sql, request) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || token.length > 128) return null;
  const [user] = await sql`
    SELECT u.id, u.full_name AS "fullName", u.email, u.phone, u.location, u.role
    FROM carrent_sessions s
    JOIN carrent_users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > now()
  `;
  return user || null;
}

function validateProfile(input) {
  const fullName = String(input.fullName || "").trim();
  const phone = String(input.phone || "").trim();
  const location = String(input.location || "India").trim();
  if (fullName.length < 2 || fullName.length > 100) return null;
  if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) return null;
  if (location.length < 2 || location.length > 120) return null;
  return { fullName, phone, location };
}

export async function handleAuthRequest(request, response) {
  const action = requestAction(request);
  const method = String(request.method || "GET").toUpperCase();
  if (!["login", "signup", "logout", "me", "profile"].includes(action)) {
    return json(response, 404, { error: "Endpoint not found." });
  }
  if (!((action === "me" && method === "GET") || (action !== "me" && ["POST", "PATCH"].includes(method)))) {
    response.setHeader("Allow", action === "me" ? "GET" : action === "profile" ? "PATCH" : "POST");
    return json(response, 405, { error: "Method not allowed." });
  }
  if (method !== "GET") {
    if (!verifySameOrigin(request)) return json(response, 403, { error: "Request origin could not be verified." });
    if (!String(request.headers?.["content-type"] || "").toLowerCase().startsWith("application/json")) {
      return json(response, 415, { error: "Send this request as JSON." });
    }
    if (Number(request.headers?.["content-length"] || 0) > MAX_BODY_BYTES) {
      return json(response, 413, { error: "Request is too large." });
    }
  }

  try {
    if (action === "logout") {
      const token = getCookie(request, SESSION_COOKIE);
      clearSessionCookie(response);
      if (token && process.env.DATABASE_URL) {
        const sql = database();
        await ensureSchema(sql);
        await sql`DELETE FROM carrent_sessions WHERE token_hash = ${hashToken(token)}`;
      }
      return json(response, 200, { ok: true });
    }

    const sql = database();
    await ensureSchema(sql);

    if (action === "me") {
      const user = await authenticatedUser(sql, request);
      return json(response, 200, { user });
    }

    if (action === "profile") {
      const user = await authenticatedUser(sql, request);
      if (!user) return json(response, 401, { error: "Please sign in again." });
      const body = await readJson(request);
      const profile = validateProfile(body);
      if (!profile) return json(response, 400, { error: "Enter a name and a valid phone number." });
      const [updated] = await sql`
        UPDATE carrent_users SET full_name = ${profile.fullName}, phone = ${profile.phone}, location = ${profile.location}
        WHERE id = ${user.id}
        RETURNING id, full_name AS "fullName", email, phone, location, role
      `;
      return json(response, 200, { user: updated });
    }

    const body = await readJson(request);
    const email = String(body.email || "").trim().toLowerCase();
    const fingerprint = getRequestFingerprint(request, email, action);
    const ipFingerprint = getRequestFingerprint(request, "all-accounts", action);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return json(response, 400, { error: "Enter a valid email address." });
    }
    if (await isBlocked(sql, fingerprint) || await isBlocked(sql, ipFingerprint)) {
      return json(response, 429, { error: "Too many attempts. Please wait before trying again." });
    }

    if (action === "signup") {
      await recordFailure(sql, fingerprint, 10, 60);
      await recordFailure(sql, ipFingerprint, 10, 60);
      if (await isBlocked(sql, fingerprint) || await isBlocked(sql, ipFingerprint)) {
        return json(response, 429, { error: "Too many account attempts. Please wait before trying again." });
      }
      const fullName = String(body.fullName || "").trim();
      const phone = String(body.phone || "").trim();
      const password = String(body.password || "");
      if (fullName.length < 2 || fullName.length > 100) {
        return json(response, 400, { error: "Name must be between 2 and 100 characters." });
      }
      if (phone && !/^\+?[0-9 ()-]{7,20}$/.test(phone)) {
        return json(response, 400, { error: "Enter a valid phone number." });
      }
      if (password.length < 12 || Buffer.byteLength(password, "utf8") > 128) {
        return json(response, 400, { error: "Use a password with at least 12 characters and no more than 128 bytes." });
      }
      try {
        const [user] = await sql`
          INSERT INTO carrent_users (id, full_name, email, phone, password_hash, role)
          VALUES (${randomUUID()}, ${fullName}, ${email}, ${phone}, ${await hashPassword(password)}, 'user')
          RETURNING id, full_name AS "fullName", email, phone, location, role
        `;
        await createSession(sql, user.id, response);
        return json(response, 201, { user });
      } catch (error) {
        if (error.code === "23505") return json(response, 409, { error: "An account with this email already exists." });
        throw error;
      }
    }

    const password = String(body.password || "");
    if (!password || Buffer.byteLength(password, "utf8") > 128) {
      await recordFailure(sql, fingerprint, 5, 15);
      await recordFailure(sql, ipFingerprint, 5, 15);
      return json(response, 401, { error: "Email or password is incorrect." });
    }
    const [record] = await sql`
      SELECT id, full_name AS "fullName", email, phone, location, role, password_hash
      FROM carrent_users WHERE email = ${email}
    `;
    let valid = false;
    if (record) {
      valid = await verifyPassword(password, record.password_hash);
    } else {
      await scrypt(password, randomBytes(16), 64, {
        N: PASSWORD_COST,
        r: PASSWORD_BLOCK_SIZE,
        p: PASSWORD_PARALLELISM,
        maxmem: 128 * 1024 * 1024,
      });
    }
    if (!record || !valid) {
      await recordFailure(sql, fingerprint, 5, 15);
      await recordFailure(sql, ipFingerprint, 5, 15);
      return json(response, 401, { error: "Email or password is incorrect." });
    }
    await sql`DELETE FROM carrent_auth_limits WHERE fingerprint = ${fingerprint}`;
    await sql`DELETE FROM carrent_sessions WHERE user_id = ${record.id} AND expires_at <= now()`;
    await createSession(sql, record.id, response, body.remember === true);
    const user = {
      id: record.id,
      fullName: record.fullName,
      email: record.email,
      phone: record.phone,
      location: record.location,
      role: record.role,
    };
    return json(response, 200, { user });
  } catch (error) {
    const status = error.statusCode || 500;
    if (status === 503) return json(response, status, { error: "Authentication is not configured. Add DATABASE_URL to the deployment environment." });
    console.error("CarRent authentication request failed:", error.code || "request error");
    return json(response, status, { error: status === 413 ? error.message : "Authentication service is temporarily unavailable." });
  }
}
