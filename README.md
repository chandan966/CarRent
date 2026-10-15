CarRent

CarRent is a React + Vite car marketplace and rental application. Users can browse cars for sale or rent, save favorites, submit purchase or rental requests, manage their profiles, and use account-based features backed by a MySQL database.

Live deployment
 
*Live:** [car-rent-seven-ruddy.vercel.app](https://car-rent-seven-ruddy.vercel.app/) 

Frontend: https://car-rent-seven-ruddy.vercel.app/

Backend API: https://carrent-co9g.onrender.com

Backend health check: https://carrent-co9g.onrender.com/api/health

Source repository: https://github.com/chandan966/CarRent

Database: Aiven MySQL

The health endpoint has been verified to return status: "ok" and database: "connected". This confirms that the deployed backend can reach MySQL, but it does not by itself verify every application feature.

The Render URL is an API host, not the website homepage. Opening https://carrent-co9g.onrender.com/ may return {"error":"API endpoint not found."} because no homepage route is defined for /. Use the Vercel URL to open the website and /api/health to check backend/database readiness.

Architecture

Browser
  |
  v
Vercel frontend (React + Vite)
  |
  | same-origin /api/* requests
  v
Render backend (Node.js HTTP API)
  |
  | TLS-protected MySQL connection
  v
Aiven MySQL database

The frontend calls API routes using relative /api/... URLs. In production, Vercel must rewrite /api/* requests to the Render backend before the catch-all SPA rewrite. This keeps API calls same-origin in the browser and supports the application's session-cookie and same-origin protections. After changing the Vercel configuration, verify that the change is committed, pushed, and deployed.

Example rewrite rules for frontend/vercel.json (keep the project's existing security headers as well):

{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://carrent-co9g.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

Do not replace the entire existing frontend/vercel.json with this snippet unless you also preserve its current security headers. If API routes return the frontend HTML or authentication fails, check the deployed rewrite configuration first.

Project layout

car-rental/
├── Backend/
│   ├── server.js             # Node.js HTTP API server
│   ├── .env.example          # Safe template for local environment variables
│   ├── certs/
│   │   └── aiven-ca.pem      # Aiven CA certificate for TLS verification
│   └── src/
│       ├── api/              # Authentication, booking, and other API handlers
│       └── config/           # Private local environment loading
├── frontend/
│   ├── src/                  # React pages, components, routes, contexts, API clients
│   ├── vercel.json           # Vercel rewrites and security headers
│   └── vite.config.js        # Local development proxy for /api/*
├── shared/cars.js            # Inventory shared by the UI and server validation
└── scripts/dev.js            # Starts the frontend and backend together

The frontend does not run the Node.js API itself. The backend runs on port 3001 during local development; Vite forwards local /api/* requests to it. The frontend and backend share car-inventory data so the server can validate booking prices against the same inventory used by the UI.

Run locally on Windows

Open PowerShell in the project root (the folder containing this README.md).

Install dependencies:

npm install
npm install --prefix frontend
npm install --prefix Backend

If Backend/.env.local does not exist, create it from the safe template:

Copy-Item Backend/.env.example Backend/.env.local

Open Backend/.env.local and configure DATABASE_URL for your local MySQL database. Keep secrets in this private file. Do not paste passwords into chat or commit .env.local.

Start MySQL and run both apps from the project root:

npm run dev

Open the frontend at http://localhost:5173. The local API health endpoint is http://localhost:3001/api/health; the Vite-proxied health endpoint is http://localhost:5173/api/health.

Use Ctrl+C in the terminal to stop both servers. If only the frontend is started, the authentication and booking APIs will not run; the backend must also be running.

Local MySQL connection example

Use your own local credentials in Backend/.env.local:

DATABASE_URL=mysql://YOUR_MYSQL_USER:URL_ENCODED_PASSWORD@127.0.0.1:3306/carrent

The carrent database must exist, and the MySQL account must have the permissions needed by the app to create or update its tables. URL-encode reserved characters in passwords, especially @, #, /, and :. CarRent creates or updates its schema on API use.

See Backend/SECURITY_SETUP.md for additional database, Google sign-in, and admin-account setup details.

Production environment configuration

Configure production secrets in the hosting provider's environment settings, not in committed files.

Render backend

The Render web service uses Backend as its root directory, installs dependencies with npm install, and starts with npm start.

Required environment variables:

DATABASE_URL — Aiven MySQL connection URL in the format mysql://USER:URL_ENCODED_PASSWORD@HOST:PORT/DATABASE.

DATABASE_SSL — set to require when using the project's corresponding TLS configuration.

The backend must use the Aiven CA certificate and keep certificate verification enabled. Keep the certificate at Backend/certs/aiven-ca.pem if the backend configuration loads it from that path. Never disable certificate verification as a workaround for TLS errors.

Optional Google sign-in variables:

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

GOOGLE_REDIRECT_URI

For production Google OAuth, register the exact HTTPS callback URL used by the deployed frontend/API proxy, for example https://car-rent-seven-ruddy.vercel.app/api/auth/google-callback, in the Google OAuth client and set the matching GOOGLE_REDIRECT_URI. Google sign-in remains optional until its credentials and callback are configured correctly.

Vercel frontend

Deploy the frontend application on Vercel. Keep the /api/(.*) rewrite to the Render API ahead of the SPA catch-all rewrite. A successful frontend build alone does not prove that API requests, authentication, or booking flows work.

Aiven MySQL

The production database is hosted on Aiven. Use the private connection URL only in Render's environment variables. Do not commit database credentials, local .env.local files, database dumps, or other private data. The CA certificate is not a database password; it is used to verify the server's TLS certificate.

Common commands

Run these from the project root:

npm run dev           # Start backend and Vite frontend together
npm run dev:backend   # Start only the backend
npm run dev:frontend  # Start only the frontend
npm run build         # Build the frontend for deployment
npm run preview       # Start the preview setup
npm run lint          # Run Oxlint on the frontend

Features

Search, filter, and browse cars available for sale or rent.

Keep guest favorites in the current browser and synchronize signed-in favorites with MySQL.

Submit server-validated purchase and rental requests.

View bookings, purchases, rentals, and profile information.

Update account profile details through authenticated API requests.

Protect signed-in routes and restrict administration endpoints by database role.

Hash passwords with Node.js scrypt; store only hashed session tokens and use HttpOnly session cookies.

Validate authentication and booking input on the server, enforce same-origin checks, and rate-limit sign-in attempts.

Submit seller listings and vehicle photos for administrator review; listings remain pending until published.

Manage cars, users, bookings, service requests, payment statuses, and CSV exports through the admin area where supported by the API.

Create in-app notifications for supported booking and service-status updates.

Support responsive layouts, keyboard focus, reduced-motion preferences, form validation, navigation/search, and contact-seller flows.

The public inventory loads from the backend catalogue, with demo cars used as a fallback if the API is unavailable. Demo inventory may be inserted into MySQL when the catalogue API is first used. Car photos are stored under Backend/uploads/ in the current implementation; use durable object storage before relying on uploaded files in production because many hosting filesystems are temporary.

Backend endpoints

GET /api/health — backend and MySQL readiness, including schema setup.

/api/auth/* — sign-up, login, logout, current session, profile updates, and optional Google OAuth.

GET /api/cars and GET /api/cars/:id?type=rent — published inventory.

POST /api/cars — authenticated seller listing and photo upload.

GET /api/bookings and POST /api/bookings — booking requests, with server-side price/date validation and administrator list access.

/api/favorites — signed-in account favorites.

/api/notifications — list, mark as read, and delete the current user's in-app notifications.

POST /api/services/requests — submit a service request; administrator-only GET /api/services/requests lists requests.

/api/admin/cars, /api/admin/users, /api/admin/bookings/:id, /api/admin/service-requests/:id, and /api/admin/payments — administrator management endpoints and read views.

Testing and troubleshooting

Check https://carrent-co9g.onrender.com/api/health. A healthy response should include "status":"ok" and "database":"connected".

Open the Vercel frontend URL for the user-facing website. The Render backend root / is not the frontend homepage and may return {"error":"API endpoint not found."}; this alone does not indicate a backend failure.

If login, signup, or bookings fail on Vercel, inspect the browser Network tab and Render logs. Confirm the Vercel /api/* rewrite targets https://carrent-co9g.onrender.com/api/$1, then redeploy Vercel if the configuration changed.

If the database is unavailable, check Render's DATABASE_URL, DATABASE_SSL, the Aiven service status, and the TLS CA certificate path. Never expose credentials in logs, screenshots, or chat.

For local ER_ACCESS_DENIED_ERROR, correct the username/password and grants in the private Backend/.env.local file. A frontend change cannot fix a database login rejected by MySQL.

Render's free web services may sleep when idle and take time to wake. Aiven's free database tier, where available, has storage and resource limits; check your own provider dashboard for current plan and usage. Free plans and limits can change.

Known limitations

CarRent is not yet a complete commercial transaction platform. No payment is collected until a payment provider, checkout flow, and signed webhook verification are configured. Email verification, password-reset delivery, durable cloud photo storage, automated backups, monitoring/alerting, and legal documents still require their respective services and operational setup. Payment management currently displays booking amounts and payment statuses; it does not itself collect money.

Run npm run build and npm run lint before a release. A successful frontend build does not prove that OAuth, API routing, MySQL access, uploads, or every production feature is working; test the deployed flows after each deployment.