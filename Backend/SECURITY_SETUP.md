# Secure authentication setup

CarRent uses server-side authentication endpoints and MySQL. The browser cannot decide whether a login is valid or whether an account is an administrator.

## Local MySQL setup

1. Install and start MySQL Server. In MySQL Workbench, create a schema named `carrent` (or run `CREATE DATABASE carrent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`).
2. Create `Backend/.env.local` with your local connection details. Start by copying `Backend/.env.example`. A typical local URL is:

   ```env
   DATABASE_URL=mysql://root:YOUR_MYSQL_PASSWORD@127.0.0.1:3306/carrent
   ```

   Replace the username and password with the ones set on your computer. If your password contains URL-reserved characters such as `@`, `#`, `/`, or `:`, URL-encode those characters. Keep `.env.local` private and do not commit it.
3. From the project root, install dependencies with `npm install`, `npm install --prefix frontend`, and `npm install --prefix Backend`. Start the app with `npm run dev`; this starts both the backend and frontend. The API creates the required tables the first time it connects. The MySQL user must have permission to create and alter tables, indexes, and foreign keys in `carrent`.

The local connection uses localhost without TLS by default. To use TLS locally, set `DATABASE_SSL=require` in `.env.local`.

## Production setup

1. Create a MySQL database with a dedicated application user.
2. Add `DATABASE_URL` to the private environment settings of the service that runs `Backend/server.js`. Production database connections require TLS and a trusted server certificate. The static Vercel frontend does not run this Node backend.
3. Grant the application user only the permissions needed for its database; startup needs permission to create and alter the application tables, indexes, and foreign keys.

## Google sign-in setup

Google sign-in uses a server-side OAuth authorization-code flow. The application verifies Google's signed ID token, requires a verified email, and then creates the same database-backed session used by password login.

1. Open [Google Cloud Console](https://console.cloud.google.com/) and select or create a project.
2. Configure the OAuth consent screen. While the app is in **Testing**, add the Google accounts that should be allowed to sign in as test users.
3. Create an OAuth client ID with application type **Web application**.
4. Add these exact **Authorized redirect URIs** to the OAuth client:

   ```text
   http://localhost:5173/api/auth/google-callback
   https://car-rent-seven-ruddy.vercel.app/api/auth/google-callback
   ```

   Google requires the URI to match the one sent by the app. If your deployed domain changes, add its callback URI here too.
5. Copy the client ID and client secret into the ignored `Backend/.env.local` file. Keep the existing `DATABASE_URL` there, then add:

   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google-callback
   ```

6. Restart the backend with `npm run dev`. Open `/login` or `/signup` and click **Continue with Google**.
7. For a deployed site, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` to the backend host's private environment settings. The production callback URI must use your HTTPS frontend/API domain and be registered in Google Cloud.

Do not paste the client secret into frontend React code, commit it, or share it in chat. `Backend/.env.example` contains placeholders only; put real values in `Backend/.env.local` for local use or the backend host's private environment settings for deployment.

## Admin access

Public signup always assigns the `user` role. There is no default admin email or password and no public role-selection field. To grant admin access, first create a normal account, then promote it through a trusted MySQL console:

```sql
UPDATE carrent_users
SET role = 'admin'
WHERE email = LOWER('the-admin-account@example.com');
```

Do not add an admin promotion endpoint to the public API. Admin pages get their role from the server-backed session; admin booking data is returned only to a session whose database role is `admin`.

## Security behavior

- Passwords are hashed with Node.js `scrypt` and a per-password random salt; plaintext passwords are never stored.
- Login and signup input is validated again on the server. Signup cannot set a role.
- Login failures and account creation attempts are rate limited in MySQL.
- Session tokens are random, stored only as hashes in MySQL, and sent in `HttpOnly`, `SameSite=Lax` cookies. Production cookies use `Secure` and the `__Host-` prefix.
- Normal sessions expire after 12 hours. “Remember me” sessions expire after 7 days. Logout revokes the database session.
- Mutating auth and booking requests require JSON and a matching same-origin `Origin` header.
- Booking requests are tied to the signed-in account and stored server-side. The server reads prices from the catalogue, validates dates and contact input, and rejects overlapping active rental dates. Government ID numbers, document uploads, and full residential addresses are not collected or saved by the booking form.
- Seller submissions require a signed-in session, are validated by the server, store images only after file-signature checks, and remain pending until an administrator publishes them. Upload filenames are generated by the server.
- Admin endpoints check the database-backed role on every request. Admin account changes prevent self-removal and removal of the last active administrator; disabling an account revokes its sessions.
- Favorites and in-app notifications are scoped to the signed-in user. Service requests are validated, rate limited, and visible to administrators.
- Old demo auth and booking keys are removed from browser storage on app startup because those records could contain sensitive details.
- Vercel sends a content security policy and browser security headers.

## Hosting limitations

The standalone Node backend serves `/api/auth/*`, `/api/bookings`, `/api/cars`, `/api/favorites`, `/api/notifications`, `/api/services/requests`, `/api/admin/*`, `/uploads/*`, and `/api/health` on port `3001`. Vite proxies `/api/*` to it for local development and preview. These endpoints need a reachable MySQL database through `DATABASE_URL`; without it, database-backed actions return a setup error. Google sign-in needs the OAuth environment variables above. The Vercel frontend configuration does not start this backend. Production hosting must run the backend separately and proxy `/api/*` and `/uploads/*` through the frontend origin over HTTPS so session cookies, same-origin checks, and uploaded images work.

Local seller photos are stored in `Backend/uploads/`. Configure durable object storage before production because container disks can be temporary. Online payments are not implemented; a provider checkout, verified webhooks, refunds, and reconciliation still need setup. Password reset and email verification also need an email provider and token flows.
