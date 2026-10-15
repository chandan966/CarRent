import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";
import { OAuth2Client } from "google-auth-library";

const scrypt = promisify(scryptCallback);
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_COST = 32768;
const PASSWORD_BLOCK_SIZE = 8;
const PASSWORD_PARALLELISM = 1;
const MAX_BODY_BYTES = 16 * 1024;
const SESSION_COOKIE = process.env.NODE_ENV === "production" ? "__Host-carent_session" : "carent_session";
const OAUTH_COOKIE_PREFIX = process.env.NODE_ENV === "production" ? "__Host-carent_google_" : "carent_google_";
const OAUTH_COOKIE_MAX_AGE = 10 * 60;
let sqlClient;
let schemaReady;

export function database() {
  if (!process.env.DATABASE_URL) {
    const error = new Error("Authentication database is not configured.");
    error.statusCode = 503;
    throw error;
  }

  if (!sqlClient) {
    let connection;
    try {
      connection = new URL(process.env.DATABASE_URL);
    } catch {
      const error = new Error("DATABASE_URL must be a valid MySQL connection URL.");
      error.statusCode = 503;
      throw error;
    }
    if (connection.protocol !== "mysql:") {
      const error = new Error("DATABASE_URL must use the mysql:// protocol.");
      error.statusCode = 503;
      throw error;
    }

    const pool = mysql.createPool({
      host: connection.hostname,
      port: Number(connection.port || 3306),
      user: decodeURIComponent(connection.username),
      password: decodeURIComponent(connection.password),
      database: decodeURIComponent(connection.pathname.replace(/^\//, "")),
      waitForConnections: true,
      connectionLimit: 4,
      queueLimit: 0,
      connectTimeout: 10_000,
      charset: "utf8mb4",
      dateStrings: true,
      ...(process.env.NODE_ENV === "production" || process.env.DATABASE_SSL === "require"
        ? { ssl: { rejectUnauthorized: true } }
        : {}),
    });

    // Keep the existing parameterized template-query call sites while binding
    // all interpolated values through mysql2 prepared statements.
    sqlClient = async (strings, ...values) => {
      const statement = strings.reduce(
        (sql, part, index) => sql + part + (index < values.length ? "?" : ""),
        ""
      );
      const [rows] = await pool.execute(statement, values);
      return rows;
    };
  }

  return sqlClient;
}

export async function ensureSchema(sql) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS carrent_users (
        id varchar(64) PRIMARY KEY,
        full_name varchar(100) NOT NULL,
        email varchar(254) NOT NULL UNIQUE,
        phone varchar(20) NOT NULL DEFAULT '',
        location varchar(120) NOT NULL DEFAULT 'India',
        password_hash varchar(255) NULL,
        role enum('user', 'admin') NOT NULL DEFAULT 'user',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`;
      // Existing password-only installations created this column as NOT NULL.
      // Google-only accounts have no password, so allow NULL after upgrading.
      const [passwordColumn] = await sql`
        SELECT IS_NULLABLE AS isNullable FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'carrent_users' AND COLUMN_NAME = 'password_hash'
      `;
      if (passwordColumn?.isNullable === "NO") {
        await sql`ALTER TABLE carrent_users MODIFY COLUMN password_hash varchar(255) NULL`;
      }
      await sql`CREATE TABLE IF NOT EXISTS carrent_google_identities (
        google_sub varchar(255) PRIMARY KEY,
        user_id varchar(64) NOT NULL UNIQUE,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT carrent_google_identity_user_fk FOREIGN KEY (user_id)
          REFERENCES carrent_users(id) ON DELETE CASCADE
      )`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_sessions (
        token_hash char(64) PRIMARY KEY,
        user_id varchar(64) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at timestamp NOT NULL,
        KEY carrent_sessions_user_idx (user_id),
        KEY carrent_sessions_expiry_idx (expires_at),
        CONSTRAINT carrent_sessions_user_fk FOREIGN KEY (user_id)
          REFERENCES carrent_users(id) ON DELETE CASCADE
      )`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_bookings (
        id varchar(64) PRIMARY KEY,
        user_id varchar(64) NOT NULL,
        car_id integer NOT NULL,
        car_name varchar(160) NOT NULL,
        car_image text NOT NULL,
        booking_type enum('buy', 'rent') NOT NULL,
        contact_name varchar(100) NOT NULL,
        contact_phone varchar(20) NOT NULL,
        start_date date,
        days integer,
        pickup_location varchar(120) NOT NULL DEFAULT '',
        amount integer NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'Pending',
        payment_status varchar(20) NOT NULL DEFAULT 'Pending',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        KEY carrent_bookings_user_idx (user_id, created_at),
        CONSTRAINT carrent_bookings_user_fk FOREIGN KEY (user_id)
          REFERENCES carrent_users(id) ON DELETE CASCADE
      )`;
      await sql`CREATE TABLE IF NOT EXISTS carrent_auth_limits (
        fingerprint char(64) PRIMARY KEY,
        attempts integer NOT NULL,
        window_started_at timestamp NOT NULL,
        blocked_until timestamp NULL
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
  appendSetCookie(response, `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${expiry}${secure}`);
}

function appendSetCookie(response, cookie) {
  const existing = response.getHeader("Set-Cookie");
  const cookies = existing ? (Array.isArray(existing) ? existing : [existing]) : [];
  response.setHeader("Set-Cookie", [...cookies, cookie]);
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

function oauthCookie(name) {
  return `${OAUTH_COOKIE_PREFIX}${name}`;
}

function setOAuthCookie(response, name, value) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  appendSetCookie(
    response,
    `${oauthCookie(name)}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${OAUTH_COOKIE_MAX_AGE}${secure}`
  );
}

function clearOAuthCookies(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  for (const name of ["state", "verifier", "nonce", "screen"]) {
    appendSetCookie(
      response,
      `${oauthCookie(name)}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
    );
  }
}

function setOAuthResponseHeaders(response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Referrer-Policy", "no-referrer");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
}

function redirect(response, location) {
  response.statusCode = 302;
  response.setHeader("Location", location);
  response.end();
}

function getGoogleRedirectUri() {
  const configured = process.env.GOOGLE_REDIRECT_URI ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173/api/auth/google-callback");
  if (!configured) throw new GoogleAuthError("google_not_configured");

  let redirectUri;
  try {
    redirectUri = new URL(configured);
  } catch {
    throw new GoogleAuthError("google_config_invalid");
  }
  if (
    !["http:", "https:"].includes(redirectUri.protocol) ||
    redirectUri.pathname !== "/api/auth/google-callback" ||
    redirectUri.search ||
    redirectUri.hash ||
    (process.env.NODE_ENV === "production" && redirectUri.protocol !== "https:")
  ) {
    throw new GoogleAuthError("google_config_invalid");
  }
  return redirectUri.toString();
}

class GoogleAuthError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function secureStringEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getGoogleScreen(request) {
  return getCookie(request, oauthCookie("screen")) === "signup" ? "signup" : "login";
}

function redirectOAuthError(response, screen, code) {
  const page = screen === "signup" ? "/signup" : "/login";
  const query = new URLSearchParams({ oauthError: code });
  redirect(response, `${page}?${query.toString()}`);
}

function googleConfig() {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.GOOGLE_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) throw new GoogleAuthError("google_not_configured");
  return { clientId, clientSecret, redirectUri: getGoogleRedirectUri() };
}

async function verifyGoogleIdToken(idToken, expectedNonce, clientId) {
  if (typeof idToken !== "string" || idToken.length > 12_000) throw new GoogleAuthError("google_failed");
  let claims;
  try {
    const verifier = new OAuth2Client(clientId);
    const ticket = await verifier.verifyIdToken({ idToken, audience: clientId });
    claims = ticket.getPayload();
  } catch {
    throw new GoogleAuthError("google_failed");
  }
  if (!claims) throw new GoogleAuthError("google_failed");

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (
    !["https://accounts.google.com", "accounts.google.com"].includes(claims.iss) ||
    !audiences.includes(clientId) ||
    (audiences.length > 1 && claims.azp !== clientId) ||
    (claims.azp && claims.azp !== clientId) ||
    !Number.isFinite(claims.exp) || claims.exp <= now ||
    !Number.isFinite(claims.iat) || claims.iat > now + 60 ||
    !secureStringEqual(claims.nonce, expectedNonce) ||
    typeof claims.sub !== "string" || claims.sub.length < 1 || claims.sub.length > 255 ||
    typeof claims.email !== "string" || claims.email.length > 254 ||
    claims.email_verified !== true
  ) {
    throw new GoogleAuthError(claims.email_verified === true ? "google_failed" : "google_email_unverified");
  }
  return claims;
}

async function exchangeGoogleCode(code, verifier, config) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || typeof result.id_token !== "string") throw new GoogleAuthError("google_failed");
    return result.id_token;
  } finally {
    clearTimeout(timeout);
  }
}

async function createGoogleSession(sql, claims, response) {
  const email = claims.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new GoogleAuthError("google_failed");

  const [mappedUser] = await sql`
    SELECT u.id, u.full_name AS fullName, u.email, u.phone, u.location, u.role
    FROM carrent_google_identities g
    JOIN carrent_users u ON u.id = g.user_id
    WHERE g.google_sub = ${claims.sub}
  `;
  if (mappedUser) {
    await createSession(sql, mappedUser.id, response);
    return mappedUser;
  }

  const [existingUser] = await sql`
    SELECT id, email FROM carrent_users WHERE email = ${email}
  `;
  let userId = existingUser?.id;
  if (userId) {
    const [linkedIdentity] = await sql`
      SELECT google_sub FROM carrent_google_identities WHERE user_id = ${userId}
    `;
    if (linkedIdentity && linkedIdentity.google_sub !== claims.sub) {
      throw new GoogleAuthError("google_account_conflict");
    }
  } else {
    userId = randomUUID();
    const rawName = String(claims.name || "").trim();
    const fullName = (rawName || email.split("@")[0] || "Google User").slice(0, 100);
    try {
      await sql`
        INSERT INTO carrent_users (id, full_name, email, phone, password_hash, role)
        VALUES (${userId}, ${fullName}, ${email}, '', NULL, 'user')
      `;
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY") throw error;
      const [racedUser] = await sql`
        SELECT id FROM carrent_users WHERE email = ${email}
      `;
      if (!racedUser) throw error;
      userId = racedUser.id;
      const [linkedIdentity] = await sql`
        SELECT google_sub FROM carrent_google_identities WHERE user_id = ${userId}
      `;
      if (linkedIdentity && linkedIdentity.google_sub !== claims.sub) {
        throw new GoogleAuthError("google_account_conflict");
      }
    }
  }

  try {
    await sql`
      INSERT INTO carrent_google_identities (google_sub, user_id)
      VALUES (${claims.sub}, ${userId})
    `;
  } catch (error) {
    if (error.code !== "ER_DUP_ENTRY") throw error;
    const [racedIdentity] = await sql`
      SELECT user_id FROM carrent_google_identities WHERE google_sub = ${claims.sub}
    `;
    if (racedIdentity?.user_id !== userId) throw new GoogleAuthError("google_account_conflict");
  }

  const [user] = await sql`
    SELECT id, full_name AS fullName, email, phone, location, role
    FROM carrent_users WHERE id = ${userId}
  `;
  if (!user) throw new GoogleAuthError("google_failed");
  await createSession(sql, user.id, response);
  return user;
}

async function startGoogleSignIn(request, response) {
  const url = new URL(request.url || "/api/auth/google", "http://localhost");
  const screen = url.searchParams.get("screen") === "signup" ? "signup" : "login";
  const config = googleConfig();
  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  for (const [name, value] of [["state", state], ["nonce", nonce], ["verifier", verifier], ["screen", screen]]) {
    setOAuthCookie(response, name, value);
  }

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.search = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  redirect(response, googleUrl.toString());
}

async function finishGoogleSignIn(request, response) {
  const screen = getGoogleScreen(request);
  const query = new URL(request.url || "/api/auth/google-callback", "http://localhost").searchParams;
  if (query.has("error")) {
    clearOAuthCookies(response);
    return redirectOAuthError(response, screen, query.get("error") === "access_denied" ? "google_cancelled" : "google_failed");
  }

  const state = query.get("state") || "";
  const code = query.get("code") || "";
  const savedState = getCookie(request, oauthCookie("state"));
  const verifier = getCookie(request, oauthCookie("verifier"));
  const nonce = getCookie(request, oauthCookie("nonce"));
  if (!code || code.length > 4096 || !verifier || verifier.length > 128 || !nonce || !secureStringEqual(state, savedState)) {
    clearOAuthCookies(response);
    return redirectOAuthError(response, screen, "google_invalid_state");
  }

  const config = googleConfig();
  const idToken = await exchangeGoogleCode(code, verifier, config);
  const claims = await verifyGoogleIdToken(idToken, nonce, config.clientId);
  const sql = database();
  await ensureSchema(sql);
  await createGoogleSession(sql, claims, response);
  clearOAuthCookies(response);
  redirect(response, "/");
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
  const [limit] = await sql`
    SELECT blocked_until > CURRENT_TIMESTAMP AS active
    FROM carrent_auth_limits WHERE fingerprint = ${fingerprint}
  `;
  return Boolean(limit?.active);
}

async function recordFailure(sql, fingerprint, maxAttempts, windowMinutes) {
  await sql`
    INSERT INTO carrent_auth_limits (fingerprint, attempts, window_started_at, blocked_until)
    VALUES (${fingerprint}, 1, CURRENT_TIMESTAMP, NULL)
    ON DUPLICATE KEY UPDATE
      blocked_until = IF(
        window_started_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${windowMinutes} MINUTE),
        NULL,
        IF(attempts + 1 >= ${maxAttempts}, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${windowMinutes} MINUTE), blocked_until)
      ),
      attempts = IF(
        window_started_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${windowMinutes} MINUTE),
        1,
        attempts + 1
      ),
      window_started_at = IF(
        window_started_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${windowMinutes} MINUTE),
        CURRENT_TIMESTAMP,
        window_started_at
      )
  `;
}

async function createSession(sql, userId, response, remember = false) {
  const ttlSeconds = remember ? SESSION_TTL_SECONDS : 60 * 60 * 12;
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  await sql`
    INSERT INTO carrent_sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ${ttlSeconds} SECOND))
  `;
  setSessionCookie(response, rawToken, remember ? ttlSeconds : undefined);
}

export async function authenticatedUser(sql, request) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || token.length > 128) return null;
  const [user] = await sql`
    SELECT u.id, u.full_name AS fullName, u.email, u.phone, u.location, u.role
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

function localAuthErrorMessage(error) {
  const code = String(error?.code || "");
  const localMessages = {
    ECONNREFUSED: "MySQL refused the connection. Start the MySQL server and confirm it uses port 3306.",
    ETIMEDOUT: "Connecting to MySQL timed out. Check that the server is running and DATABASE_URL is correct.",
    EHOSTUNREACH: "The MySQL host could not be reached. Check DATABASE_URL.",
    ER_ACCESS_DENIED_ERROR: "MySQL rejected the configured username or password, or that user cannot access the carrent database.",
    ER_BAD_DB_ERROR: "The carrent database was not found. Create it in MySQL first.",
    ER_DBACCESS_DENIED_ERROR: "The MySQL user needs access to the carrent database.",
    ER_TABLEACCESS_DENIED_ERROR: "The MySQL user needs permission to create and alter CarRent tables.",
    ER_PARSE_ERROR: "MySQL rejected a query. Check the MySQL server version and the API query shown in the terminal.",
  };
  if (localMessages[code]) return localMessages[code];
  if (/^[A-Z0-9_]{1,64}$/.test(code)) return `Local authentication database error: ${code}.`;
  return "Authentication service is temporarily unavailable. Check the Vite terminal for the database error code.";
}

export async function handleAuthRequest(request, response) {
  const action = requestAction(request);
  const method = String(request.method || "GET").toUpperCase();
  if (["google", "google-callback"].includes(action)) {
    setOAuthResponseHeaders(response);
    if (method !== "GET") {
      response.setHeader("Allow", "GET");
      return json(response, 405, { error: "Method not allowed." });
    }
    try {
      if (action === "google") return await startGoogleSignIn(request, response);
      return await finishGoogleSignIn(request, response);
    } catch (error) {
      if (action === "google-callback") clearOAuthCookies(response);
      const query = new URL(request.url || "/api/auth/google", "http://localhost").searchParams;
      const screen = action === "google-callback"
        ? getGoogleScreen(request)
        : query.get("screen") === "signup" ? "signup" : "login";
      const code = error instanceof GoogleAuthError ? error.code : "google_failed";
      if (!(error instanceof GoogleAuthError)) {
        console.error("CarRent Google sign-in failed:", error.code || "request error");
      }
      return redirectOAuthError(response, screen, code);
    }
  }

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
      await sql`
        UPDATE carrent_users SET full_name = ${profile.fullName}, phone = ${profile.phone}, location = ${profile.location}
        WHERE id = ${user.id}
      `;
      const [updated] = await sql`
        SELECT id, full_name AS fullName, email, phone, location, role
        FROM carrent_users WHERE id = ${user.id}
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
        const id = randomUUID();
        const passwordHash = await hashPassword(password);
        await sql`
          INSERT INTO carrent_users (id, full_name, email, phone, password_hash, role)
          VALUES (${id}, ${fullName}, ${email}, ${phone}, ${passwordHash}, 'user')
        `;
        const user = { id, fullName, email, phone, location: "India", role: "user" };
        await createSession(sql, user.id, response);
        return json(response, 201, { user });
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return json(response, 409, { error: "An account with this email already exists." });
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
      SELECT id, full_name AS fullName, email, phone, location, role, password_hash
      FROM carrent_users WHERE email = ${email}
    `;
    let valid = false;
    if (record?.password_hash) {
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
    await sql`DELETE FROM carrent_sessions WHERE user_id = ${record.id} AND expires_at <= CURRENT_TIMESTAMP`;
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
    const message = status === 413
      ? error.message
      : process.env.NODE_ENV === "production"
        ? "Authentication service is temporarily unavailable."
        : localAuthErrorMessage(error);
    return json(response, status, { error: message });
  }
}
