# CarRent

CarRent is a React and Vite car marketplace and rental app. Users can browse cars for sale or rent, save favorites, create purchase or rental requests, and manage their profile. The project includes MySQL-backed authentication and booking APIs.

**Live frontend:** [car-rent-seven-ruddy.vercel.app](https://car-rent-seven-ruddy.vercel.app/)

## Project layout

```text
car-rental/
├── Backend/
│   ├── server.js             # Standalone Node.js HTTP API server
│   ├── .env.example          # Safe template; copy to .env.local for local secrets
│   └── src/
│       ├── api/              # Authentication and booking request handlers
│       └── config/           # Private local environment loading
├── frontend/
│   ├── src/                  # React pages, components, routes, contexts, and API clients
│   └── vite.config.js        # Proxies /api requests to the backend during local dev
├── shared/cars.js            # Demo inventory shared by UI and server validation
└── scripts/dev.js            # Starts frontend and backend together
```

The frontend no longer contains server/API implementation files. The backend handles API requests on port `3001`; Vite forwards local `/api/*` requests to it. Both apps import the same car inventory so booking prices are checked against the data shown in the app.

## Run locally on Windows

1. Open PowerShell in the project root, the folder containing this `README.md`.
2. Install project dependencies:

   ```powershell
   npm install
   npm install --prefix frontend
   npm install --prefix Backend
   ```

3. If `Backend/.env.local` does not exist, copy the safe template:

   ```powershell
   Copy-Item Backend/.env.example Backend/.env.local
   ```

   Open `Backend/.env.local` and put your MySQL connection in `DATABASE_URL`. Keep the existing local credentials if you already have them. Do not paste passwords into chat or commit this file. The backend's local file takes priority over a stale `DATABASE_URL` already set in PowerShell.

4. Start MySQL, then run both apps from the project root:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173). The API health address is [http://localhost:3001/api/health](http://localhost:3001/api/health).

Use **Ctrl+C** in that terminal to stop both servers. If you start only the frontend, login and booking APIs will not run; the backend must also be running.

### MySQL connection example

In `Backend/.env.local`, use this format with your own values:

```env
DATABASE_URL=mysql://carrent_app:URL_ENCODED_PASSWORD@127.0.0.1:3306/carrent
```

The `carrent` database must exist, and the MySQL account must be allowed to create and alter the app tables. URL-encode special characters in the password, especially `@`, `#`, `/`, and `:`. CarRent creates or updates its tables on the first API request.

See [Backend/SECURITY_SETUP.md](Backend/SECURITY_SETUP.md) for the MySQL, Google sign-in, and admin account setup details.

Google sign-in is optional. To enable it locally, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `Backend/.env.local`. Register this Google OAuth redirect URI:

```text
http://localhost:5173/api/auth/google-callback
```

Restart `npm run dev` after changing backend environment values.

## Common commands

Run these from the project root:

```powershell
npm run dev           # Start backend and Vite frontend together
npm run dev:backend   # Start only the backend
npm run dev:frontend  # Start only the frontend
npm run build         # Build the frontend for deployment
npm run preview       # Start backend and frontend build preview together
npm run lint          # Run Oxlint on the frontend
```

## Current features

- Search, filter, and view sale and rental cars.
- Save favorites in the current browser; guest favorites and signed-in account favorites are kept separately.
- Submit server-validated purchase and rental requests.
- View booking, purchase, rental, and profile information.
- Update account profile details through the authenticated API.
- Protect signed-in routes and restrict admin data by database role.
- Hash passwords with Node.js `scrypt`; store only hashed session tokens and use `HttpOnly` session cookies.
- Validate auth and booking input on the server, enforce same-origin checks, and rate-limit sign-in attempts.

## Deployment notes

`npm run build` creates the static frontend. The Node API is a separate service and must also be deployed with private environment variables and access to MySQL. Production login and booking requests require the frontend host to proxy `/api/*` to that backend on the same site so secure session cookies and same-origin protections work correctly. The existing Vercel site configuration is for the frontend; it does not automatically run `Backend/server.js`. Configure a production reverse proxy before expecting login or booking APIs to work on the live site.

The backend now stores seller listings, favorites, bookings, service requests, notifications, and account data in MySQL. Demo inventory is inserted into the database the first time the catalogue API is used. This still is not a complete commercial transaction platform: no payment provider, email verification/password-reset provider, production image object storage, backups, monitoring, or legal documents are configured.

## Frontend UI status

The frontend includes responsive routes for home, car browsing, sale and rental listings and details, selling, services, sign-in/sign-up, favorites, booking, notifications, profile history, and admin dashboards for cars, bookings, users, payments, and service requests. The public inventory loads from the backend catalog, with demo cars shown only as a fallback if the API is unavailable. Seller submissions and their exterior/interior photos are uploaded to the backend and remain pending until an administrator publishes them. Signed-in favorites sync to MySQL; guest favorites remain in this browser. Admin users can change roles and disable accounts subject to last-admin safeguards. Admin booking and service status changes are stored and create in-app notifications. Booking totals are recalculated server-side from catalog prices, and overlapping active rental dates are rejected. Navigation/search, contact-seller, form validation, keyboard focus, reduced-motion handling, and responsive layouts are supported.

Notifications and service requests use the backend. The admin dashboard and CSV export use live booking API data. Payment management can show booking amounts and payment statuses, but no money is collected until a real payment provider, signed webhook verification, and checkout flow are configured.

### Backend endpoints

- `GET /api/health` — backend and MySQL readiness, including schema setup.
- `/api/auth/*` — sign-up, login, logout, current session, profile updates, and optional Google OAuth.
- `GET /api/cars` and `GET /api/cars/:id?type=rent` — published inventory; `POST /api/cars` — authenticated seller listing and photo upload.
- `GET /api/bookings` and `POST /api/bookings` — account booking requests, with admin list access and server-side price/date validation.
- `/api/favorites` — signed-in account favorites.
- `/api/notifications` — list, mark read, and delete the current user's in-app notifications.
- `POST /api/services/requests` — submit a service request; admin-only `GET /api/services/requests` lists requests.
- `/api/admin/cars`, `/api/admin/users`, `/api/admin/bookings/:id`, `/api/admin/service-requests/:id`, and `/api/admin/payments` — administrator-only management operations and read views.

The schema is created/upgraded by the API on demand. Car photos are stored in `Backend/uploads/` for local development; use durable object storage before deploying the backend because many hosting disks are temporary.

Run `npm run build` to create the production frontend bundle and `npm run lint` to check frontend source. The frontend build does not prove that the API, MySQL connection, OAuth, or production deployment is working.

For local end-to-end use, start MySQL, configure `Backend/.env.local`, then run `npm run dev`. Check `http://localhost:3001/api/health` (or the Vite-proxied `/api/health`) before signing in. If MySQL reports `ER_ACCESS_DENIED_ERROR`, fix the username/password and database grants in that private file; the frontend cannot repair a rejected database login. For the deployed Vercel site, configure a backend host, MySQL, and a same-origin `/api/*` and `/uploads/*` reverse proxy as described above. Payment collection, password reset/email verification, durable cloud photo storage, backups, monitoring, and legal documents still need their respective external services and operational setup.
