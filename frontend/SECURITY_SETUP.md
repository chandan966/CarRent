# Secure authentication setup

CarRent uses server-side authentication endpoints and MySQL. The browser cannot decide whether a login is valid or whether an account is an administrator.

## Local MySQL setup

1. Install and start MySQL Server. In MySQL Workbench, create a schema named `carrent` (or run `CREATE DATABASE carrent CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`).
2. Create `frontend/.env.local` with your local connection details. A typical local URL is:

   ```env
   DATABASE_URL=mysql://root:YOUR_MYSQL_PASSWORD@127.0.0.1:3306/carrent
   ```

   Replace the username and password with the ones set on your computer. If your password contains URL-reserved characters such as `@`, `#`, `/`, or `:`, URL-encode those characters. Keep `.env.local` private and do not commit it.
3. From the `frontend` folder, run `npm install` and `npm run dev`. The API creates the required tables the first time it connects. The MySQL user must have permission to create and alter tables, indexes, and foreign keys in `carrent`.

The local connection uses localhost without TLS by default. To use TLS locally, set `DATABASE_SSL=require` in `.env.local`.

## Production setup

1. Create a MySQL database with a dedicated application user.
2. In Vercel, add `DATABASE_URL` under **Project → Settings → Environment Variables** for Preview and Production, then redeploy. Production database connections require TLS and a trusted server certificate.
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
5. Copy the client ID and client secret into the ignored `frontend/.env.local` file. Keep the existing `DATABASE_URL` there, then add:

   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=http://localhost:5173/api/auth/google-callback
   ```

6. Restart the local Vite server. Open `/login` or `/signup` and click **Continue with Google**.
7. For the deployed site, add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in **Vercel → Project → Settings → Environment Variables**. Set the redirect URI to `https://car-rent-seven-ruddy.vercel.app/api/auth/google-callback`, then redeploy.

Do not paste the client secret into frontend React code, commit it, or share it in chat. `.env.example` contains placeholders only; put real values in `.env.local` and Vercel's private environment settings.

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
- Booking requests are tied to the signed-in account and stored server-side. Government ID numbers, document uploads, and full residential addresses are not collected or saved by the booking form.
- Old demo auth and booking keys are removed from browser storage on app startup because those records could contain sensitive details.
- Vercel sends a content security policy and browser security headers.

## Hosting limitations

The Vite development and preview servers include middleware for `/api/auth/*` and `/api/bookings`. Those endpoints need a reachable MySQL database through `DATABASE_URL`; without it, authentication and booking submission return a setup error. Google sign-in also needs the OAuth environment variables above. The included serverless API files are configured for Vercel. A static-only host needs equivalent serverless functions and secure environment-variable configuration. Password reset still needs an email provider and a separate reset flow.
