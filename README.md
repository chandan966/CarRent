# CarRent — Car Rental and Sales Marketplace

CarRent is a web application for browsing cars to buy or rent, saving favorite cars, submitting booking requests, and creating car sale listings. It also includes profile and admin pages.

**Live website:** [https://car-rent-seven-ruddy.vercel.app/](https://car-rent-seven-ruddy.vercel.app/)

## Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Run Locally](#run-locally)
- [Available Commands](#available-commands)
- [Pages and Routes](#pages-and-routes)
- [Typical User Workflows](#typical-user-workflows)
- [Project Structure](#project-structure)
- [How Data Is Saved](#how-data-is-saved)
- [Current Demo Limitations](#current-demo-limitations)
- [Deploy to Vercel](#deploy-to-vercel)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## Project Overview

CarRent provides separate experiences for people who want to buy a car, rent a car, sell a car, or browse the car catalogue. Users can also save cars as favorites and view profile sections for favorites, purchases, rentals, and booking requests.

The app is built with React and Vite. React Router handles page navigation, and the Vercel configuration supports direct access to routes such as `/buy` and `/profile`.

> **Project status:** The current version is primarily a frontend demo. Some screens use sample data, and user and listing information is stored in the browser. The project does not currently have a connected production backend or database.

## Features

### Account pages

- Sign-up and login pages
- Password recovery page layout
- Protected pages that redirect logged-out users to the login page
- Profile page with editable profile information and a profile photo
- Logout

Account handling currently runs in the frontend. It does not use a server to verify user credentials.

### Browse and buy cars

- Browse cars on the Buy page
- Search and filter the available listings
- Open a car details page
- Use the seller contact interface where available
- Save or remove cars from Favorites

### Rent cars

- Browse rental cars
- Search and filter rental listings
- Open rental car details
- Continue to the booking form from a rental listing

### Sell a car

The sell form collects car details such as brand, model, year, price, location, mileage, fuel type, transmission, and seller phone number.

The form has separate photo upload sections for:

- Exterior photos
- Interior photos

Each section accepts up to five photos, and the form requires at least one photo in each section. The file input accepts JPEG, PNG, and WebP images, with a maximum file size of 5 MB per photo.

### Favorites and profile

- Add and remove favorite cars
- View the saved favorite count on the Profile page
- Open the Purchases, Rentals, and Bookings sections from the Profile page

The current Purchases and Rentals pages use example records. The Bookings page reads booking requests saved in the current browser.

### Services

- Browse the listed services
- Open a service details page

### Admin pages

The application includes admin screens for:

- Dashboard
- Car management
- Booking management
- User management
- Payments

These pages are currently interface screens. They are not connected to a production admin API or database.

## Technology

| Technology | Purpose |
| --- | --- |
| React | Builds the user interface |
| Vite | Runs the development server and creates production builds |
| React Router | Handles page routes and navigation |
| Lucide React | Supplies interface icons |
| `localStorage` | Saves some demo user, favorite, booking, and listing data in the browser |
| IndexedDB | Saves uploaded seller photo files in the browser |
| Vercel | Hosts the deployed website |

## Requirements

Install the following before running the project:

- Node.js
- npm

Use the project folder that contains `package.json` when running the commands below.

## Run Locally

1. Open a terminal in the frontend project folder.
2. Install the project dependencies:

   ```bash
   npm install
3. Start the development server:
   npm run dev
4. Open the local URL printed in the terminal. Vite commonly uses http://localhost:5173.
To stop the development server, press Ctrl+C in the terminal.
Available Commands
npm run dev
Starts the Vite development server.
npm run build
Creates the production build in the dist folder.
npm run preview
Serves the production build locally so you can preview it.
npm run lint
Runs Oxlint on the project.
Pages and Routes
Route	Page	Access
/login	Login	Public
/signup	Sign-up	Public
/forgot-password	Password recovery	Public
/	Home	Login required
/buy	Browse cars for purchase	Login required
/buy/:id	Purchase car details	Login required
/rent	Browse rental cars	Login required
/car/:id	Rental car details	Public
/sell	Sell information page	Login required
/sell/cars	Create a car listing	Login required
/cars	Browse the car catalogue	Public
/cars/:id	Car catalogue details	Public
/services	Browse services	Login required
/services/:id	Service details	Login required
/booking	Booking form	Login required
/notifications	Notifications	Login required
/profile	User profile	Login required
/favorites	Favorite cars	Login required
/my-purchases	Purchase history	Login required
/my-rentals	Rental history	Login required
/my-bookings	Booking requests saved in this browser	Login required
/admin	Admin dashboard	Admin role required
/admin/dashboard	Admin dashboard	Admin role required
/admin/cars	Admin car management	Admin role required
/admin/bookings	Admin booking management	Admin role required
/admin/users	Admin user management	Admin role required
/admin/payments	Admin payments page	Admin role required


:id represents the ID of a car or service. For example, /buy/1 opens the purchase details for a car with ID 1.
Typical User Workflows
Buy a car
1. Log in.
2. Open Buy in the navigation bar.
3. Search or filter the listings.
4. Open a car to see its details.
5. Use the available seller contact or purchase-related options.
Rent a car
1. Log in.
2. Open Rent in the navigation bar.
3. Browse or filter the rental cars.
4. Open a car’s details.
5. Continue to the booking form when that option is available.
6. View saved booking requests under Profile → Bookings.
Save a favorite
1. Open a car listing or its details page.
2. Select the heart button.
3. Open Favorites from the navigation bar or profile.
4. Select the heart again, or use the remove option, to remove the car.
List a car for sale
1. Log in.
2. Open Sell.
3. Open the car listing form.
4. Enter the vehicle and seller details.
5. Upload at least one exterior photo and one interior photo.
6. Submit the form.
Project Structure
frontend/
├── public/                     # Public static files and icons
├── server/                     # Placeholder server folder; no working API yet
├── src/
│   ├── components/
│   │   ├── booking/             # Booking form and summary components
│   │   ├── buy/                 # Buy-related components
│   │   ├── home/                # Home page sections
│   │   ├── Navbar/              # Navigation bar
│   │   ├── rent/                # Rental components and filters
│   │   ├── sell/                # Sell form components
│   │   └── services/            # Service components
│   ├── context/                 # Authentication, car, and booking contexts
│   ├── data/                    # Car data
│   ├── hooks/                   # Shared React hooks, including favorites
│   ├── pages/
│   │   ├── Admin/               # Admin screens
│   │   ├── Auth/                # Login, sign-up, and password recovery
│   │   ├── Booking/             # Booking page
│   │   ├── Cars/                # Public car catalogue
│   │   ├── Home/                # Home page
│   │   ├── Notifications/       # Notifications page
│   │   ├── Profile/             # Profile, favorites, and history pages
│   │   ├── Rent/                # Rental pages
│   │   ├── Sell/                # Sell car pages
│   │   ├── Services/            # Service pages
│   │   └── buy/                 # Buy and seller contact pages
│   ├── routes/                  # Protected route components
│   ├── Services/                # Service and API modules
│   ├── utils/                   # Storage and helper functions
│   ├── App.jsx                  # Application routes
│   ├── App.css                  # Application-level styles
│   ├── index.css                # Global styles
│   └── main.jsx                 # React entry point and providers
├── index.html
├── package-lock.json
├── package.json
├── vercel.json                  # Vercel SPA route rewrite
└── vite.config.js
How Data Is Saved
The current app saves some information in the browser rather than sending it to a server.
Information	Current storage
Signed-in demo user	localStorage, under carrent.auth.user
Favorites	localStorage, under favoriteCars
Booking request history	localStorage, under carRentalBookingHistory
Most recent booking	localStorage, under latestBooking
Seller listing details	localStorage, under carRentalSellerListings
Seller photo files	IndexedDB database carRentalPhotoStorage, store photos
Purchase history	Example data in the frontend
Rental history	Example data in the frontend


Data saved in localStorage or IndexedDB belongs to the browser and device where it was created. It does not automatically sync to another device or browser. Clearing browser site data can remove it.
Current Demo Limitations
- No production backend: The app does not currently connect to a working backend API or database.
- Demo authentication: Login and sign-up are handled in frontend code. They do not provide secure, server-verified accounts.
- Demo admin access: The admin role is determined by frontend demo logic. Replace this with server-side authentication and role checks before using real accounts.
- Example records: The Purchases and Rentals profile pages show example data. Some catalogue and admin pages also use sample data.
- Local booking history: Booking requests saved by the booking form are stored in the browser. They are not sent to an admin database.
- No real payment processing: The payment page does not charge a card or connect to a payment provider.
- Browser-based seller listings: Seller details and photos are stored in that browser, not made available to other users through a server.
- Google login buttons: Google sign-in is not connected to an authentication provider.
- Password recovery: The password recovery page is a frontend page and is not connected to an email or password reset service.
Before using the site for real customer transactions, add a backend, database, secure authentication, server-side authorization, and a payment provider.
Deploy to Vercel
1. Import the repository into Vercel.
2. Select the folder that contains this frontend package.json as the project root.
3. Set the build command to:
   npm run build
4. Set the output directory to:
   dist
5. Deploy the project.
The vercel.json file rewrites incoming routes to index.html. This lets React Router handle routes such as /buy, /rent, and /profile when users open or refresh those pages directly.
Environment Variables
The current frontend does not require environment variables.
When adding a backend later, configure its URL through an environment variable rather than hardcoding it into source files. Never put private keys, database passwords, or other server secrets in frontend variables.
Troubleshooting
The page sends me to the login screen
Most pages are protected and require a user session. Log in or create an account first.
A page works from the navigation but not after refreshing
Vercel needs the SPA rewrite in vercel.json. Make sure that file is included in the deployed project and that Vercel’s project root is the folder containing it.
My favorites or bookings are missing on another device
Favorites and booking history are stored in the current browser. They are not synced to an account or server.
My uploaded car photos are missing in another browser
Seller photos are stored in IndexedDB in the browser where they were uploaded. They are not uploaded to a shared server.
npm run dev does not start
Confirm that you are in the folder containing package.json, then run:
npm install
npm run dev