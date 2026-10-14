# Secure authentication setup

CarRent now uses server-side authentication endpoints and PostgreSQL. The browser no longer decides whether a login is valid or whether a user is an administrator.

## Configure the database

1. Create a PostgreSQL database with TLS enabled (for example, a managed database service).
2. Copy `.env.example` to `.env.local` for local development and set `DATABASE_URL` to the real connection string. Do not commit `.env.local`.
3. In Vercel, add `DATABASE_URL` under **Project → Settings → Environment Variables** for Preview and Production, then redeploy.
4. Start the app with `npm run dev` from `frontend`. The API creates the required tables on its first request.

The database connection must permit the application to create and alter the `carrent_users`, `carrent_sessions`, `carrent_auth_limits`, and `carrent_bookings` tables. Use a dedicated application database/user in production.

## Admin access

Public signup always assigns the `user` role. There is no default admin email or password and no public role-selection field. To grant admin access, first create a normal account, then promote it through a trusted database console:

```sql
UPDATE carrent_users
SET role = 'admin'
WHERE email = lower('the-admin-account@example.com');
```

Do not add an admin promotion endpoint to the public API. Admin pages get their role from the server-backed session; admin booking data is returned only to a session whose database role is `admin`.

## Security behavior

- Passwords are hashed with Node.js `scrypt` and a per-password random salt; plaintext passwords are never stored.
- Login and signup input is validated again on the server. Signup cannot set a role.
- Login failures and account creation attempts are rate limited in PostgreSQL.
- Session tokens are random, stored only as hashes in the database, and sent in `HttpOnly`, `SameSite=Lax` cookies. Production cookies use `Secure` and the `__Host-` prefix.
- Normal sessions expire after 12 hours. “Remember me” sessions expire after 7 days. Logout revokes the database session.
- Mutating auth and booking requests require JSON and a matching same-origin `Origin` header.
- Booking requests are tied to the signed-in account and stored server-side. Government ID numbers, document uploads, and full residential addresses are no longer collected or saved by the booking form.
- Old demo auth and booking keys are removed from browser storage on app startup because those records could contain sensitive details.
- Vercel sends a content security policy and browser security headers.

## Local development and hosting

The Vite development and preview servers include middleware for `/api/auth/*` and `/api/bookings`. These endpoints need a reachable `DATABASE_URL`; without it, authentication and booking submission return a clear service-configuration error.

The included serverless API files are configured for Vercel. The frontend can still be built as a static site, but another static host needs equivalent serverless functions and secure environment-variable configuration before login or booking will work. Password reset and Google sign-in remain unavailable until an email provider and OAuth application are configured.
