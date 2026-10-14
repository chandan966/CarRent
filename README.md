# CarRent — car marketplace and rentals

CarRent is a React and Vite demo for browsing cars for sale or rent, saving favorites, submitting purchase and rental requests, and managing a user profile. The project also contains admin screens for reviewing requests.

**Live site:** [car-rent-seven-ruddy.vercel.app](https://car-rent-seven-ruddy.vercel.app/)

> The live URL must be redeployed with the database environment variable before the new server authentication and booking features can work. Existing local demo accounts are no longer trusted as sessions.

## Features

- Search, filter, and view sale and rental cars. Sale and rental pages share their inventory data with details and booking pages to keep displayed prices consistent.
- Save favorites per signed-in email in the current browser.
- Submit purchase or rental requests. The server verifies the session, car, rental date, duration, and price, then stores the request under the authenticated account.
- View request history, purchase requests, and rental requests in the profile section.
- Edit account name, phone, and location through an authenticated server endpoint.
- Protect user pages behind a server-verified session. Admin UI access is based on the database role.
- List a car with seller form fields and photos. Seller listings and photo files remain browser-local in this demo.

## Technology and structure

- React 19, Vite, React Router, and Lucide React build the frontend.
- Vercel serverless handlers under `frontend/api` implement authentication and booking APIs.
- MySQL stores accounts, hashed sessions, rate-limit records, and booking requests.
- Node.js `scrypt` hashes passwords with a unique salt.
- React Context provides the current server-verified account and account-specific favorites.

Important folders:

```text
frontend/
├── api/                 # Vercel authentication and booking endpoints
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable page components and forms
│   ├── context/         # Server-backed auth context
│   ├── data/            # Shared demo car inventory
│   ├── hooks/           # Favorites and booking data hooks
│   ├── pages/           # Auth, cars, rentals, profile, admin, and other pages
│   ├── routes/          # Protected route checks
│   ├── Services/        # Browser API clients
│   └── utils/           # Display mapping and validation helpers
├── server/              # Reserved for future server tooling
├── SECURITY_SETUP.md    # Database, local, and deployment security setup
├── .env.example         # Placeholder database connection setting
└── package.json
```

## Run locally

1. Install Node.js and npm.
2. In a terminal, go to `frontend`.
3. Install dependencies and create a local environment file:

   ```bash
   npm install
   cp .env.example .env.local
   ```

4. Set `DATABASE_URL` in `.env.local` to your MySQL connection string. For a local MySQL Server, see `frontend/SECURITY_SETUP.md`.
5. Start Vite:

   ```bash
   npm run dev
   ```

The local Vite middleware serves `/api/auth/*` and `/api/bookings` as well as the frontend. Database tables are created by the API on its first request. If `DATABASE_URL` is not configured, login, signup, profile updates, and booking requests return an authentication/database configuration error; they do not fall back to insecure browser-only authentication.

## Commands

```bash
npm run dev       # Start local Vite app and API middleware
npm run build     # Build the frontend
npm run preview   # Preview the frontend build with the local API middleware
npm run lint      # Run Oxlint
npm audit         # Check installed package advisories
```

## Main routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/login`, `/signup`, `/forgot-password` | Account entry and recovery information | Public |
| `/` | Home | Signed in |
| `/buy`, `/buy/:id` | Sale listings and details | Signed in |
| `/rent`, `/car/:id` | Rental listings and details | Signed in for list; details page is public |
| `/cars`, `/cars/:id` | Car catalogue | Public |
| `/booking?car=:id&type=buy\|rent` | Submit a purchase or rental request | Signed in |
| `/sell`, `/sell/cars` | Seller information and create listing form | Signed in |
| `/favorites`, `/profile` | User favorites and account profile | Signed in |
| `/my-bookings`, `/my-purchases`, `/my-rentals` | Account request history | Signed in |
| `/admin/*` | Admin screens | Database role `admin` required |

## Security and account configuration

Follow [frontend/SECURITY_SETUP.md](frontend/SECURITY_SETUP.md) for database setup, deployment environment variables, and trusted admin provisioning.

- Signup always assigns the regular `user` role. The browser cannot grant admin access.
- Passwords are hashed with `scrypt`; sessions use random tokens stored as hashes in MySQL and `HttpOnly`, `SameSite=Lax` cookies.
- Login and account creation are rate limited. Mutating requests require JSON and same-origin validation.
- Purchase and rental request prices are recalculated on the server from the shared inventory; the client cannot submit an arbitrary amount.
- Booking requests no longer collect or save government ID numbers, document photos, or full residential addresses.
- On app startup, old local demo session and booking keys are removed because they were not protected server-side.
- Vercel is configured with a content security policy and standard browser security headers.

## Production limitations

This is still a marketplace prototype rather than a complete commercial transaction system. The frontend build can succeed without external credentials, but real authentication and booking requests require a reachable MySQL database. The Vercel API files are not automatically supported by a static-only host; another host needs equivalent server functions and environment-variable configuration.

- The car inventory is demo data in `frontend/src/data/cars.js`.
- Car listing management, user management, payments, and several dashboard metrics are not backed by production APIs.
- No payment provider is connected, so requests do not charge customers and invoices/receipts are unavailable.
- Google sign-in is available after configuring the Google OAuth credentials described in `frontend/SECURITY_SETUP.md`; password reset still needs an email provider and a reset flow.
- Email addresses are not verified yet. Add a verification flow and published privacy/terms documents before inviting real customers.
- Seller listing data and photos are still local to the browser and are not visible to other users.
- Favorites are stored per account in the current browser and do not sync between devices.

Do not use real customer transactions until the missing production services, monitoring, backup, privacy, and legal requirements are in place.
