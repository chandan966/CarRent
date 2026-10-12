import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Home
import Home from "./pages/Home/Home";

// Buy
import Buy from "./pages/buy/buy";
import BuyDetails from "./pages/buy/BuyDetails";

// Rent
import Rent from "./pages/Rent/Rent";
import RentDetail from "./pages/Rent/RentDetails";

// Sell
import Sell from "./pages/Sell/Sell";

// Cars - Public
import Cars from "./pages/Cars/Cars";

// Services
import Services from "./pages/Services/Services";
import ServiceDetails from "./pages/Services/ServiceDetails";

// Booking
import Booking from "./pages/Booking/Booking";

// Notifications
import Notifications from "./pages/Notifications/Notification";

// Profile
import Profile from "./pages/Profile/Profile";
import Favorites from "./pages/Profile/Favorites";
import MyPurchases from "./pages/Profile/MyPurchases";
import MyRentals from "./pages/Profile/MyRental";

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";
import AdmiRoute from "./routes/AdmiRoute";

// Admin
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminCars from "./pages/Admin/Cars";
import AdminBookings from "./pages/Admin/Booking";
import AdminUsers from "./pages/Admin/Users";
import AdminPayments from "./pages/Admin/Payments";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================
            AUTH
        ================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        {/* ================================
            HOME
        ================================= */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />


        {/* ================================
            BUY
        ================================= */}

        <Route
          path="/buy"
          element={
            <ProtectedRoute>
              <Buy />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buy/:id"
          element={
            <ProtectedRoute>
              <BuyDetails />
            </ProtectedRoute>
          }
        />


        {/* ================================
            RENT
        ================================= */}

        <Route
          path="/rent"
          element={
            <ProtectedRoute>
              <Rent />
            </ProtectedRoute>
          }
        />

        {/* Rent Car Details - Public */}
        <Route
          path="/car/:id"
          element={<RentDetail />}
        />


        {/* ================================
            SELL
        ================================= */}

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Sell />
            </ProtectedRoute>
          }
        />


        {/* ================================
            CARS
        ================================= */}

        <Route
          path="/cars"
          element={<Cars />}
        />


        {/* ================================
            SERVICES
        ================================= */}

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services/:id"
          element={
            <ProtectedRoute>
              <ServiceDetails />
            </ProtectedRoute>
          }
        />


        {/* ================================
            BOOKING
        ================================= */}

        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />


        {/* ================================
            NOTIFICATIONS
        ================================= */}

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />


        {/* ================================
            PROFILE
        ================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-purchases"
          element={
            <ProtectedRoute>
              <MyPurchases />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-rentals"
          element={
            <ProtectedRoute>
              <MyRentals />
            </ProtectedRoute>
          }
        />


        {/* ================================
            ADMIN
        ================================= */}

        <Route
          path="/admin"
          element={
            <AdmiRoute>
              <AdminDashboard />
            </AdmiRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdmiRoute>
              <AdminDashboard />
            </AdmiRoute>
          }
        />

        <Route
          path="/admin/cars"
          element={
            <AdmiRoute>
              <AdminCars />
            </AdmiRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdmiRoute>
              <AdminBookings />
            </AdmiRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdmiRoute>
              <AdminUsers />
            </AdmiRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <AdmiRoute>
              <AdminPayments />
            </AdmiRoute>
          }
        />


        {/* ================================
            UNKNOWN ROUTES
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>


      {/* DEVELOPER CREDIT */}

      <div className="developer-credit">
        Developer Chandan Ghanghav
      </div>

    </BrowserRouter>
  );
}

export default App;