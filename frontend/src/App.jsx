import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Footer from "./components/Footer/Footer";

// Auth
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import NotFound from "./pages/NotFound/NotFound";

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
import SellCar from "./pages/Sell/sellCar";

// Cars - Public
import Cars from "./pages/Cars/Cars";
import CarsDetails from "./pages/Cars/CarsDetails";

// Services
import Services from "./pages/Services/Services";
import ServiceDetails from "./pages/Services/ServiceDetails";
import ServiceRequest from "./pages/Services/ServiceRequest";

// Booking
import Booking from "./pages/Booking/Booking";

// Notifications
import Notifications from "./pages/Notifications/Notification";

// Profile
import Profile from "./pages/Profile/Profile";
import Favorites from "./pages/Profile/Favorites";
import MyPurchases from "./pages/Profile/MyPurchases";
import MyRentals from "./pages/Profile/MyRental";
import MyBookings from "./pages/Profile/MyBookings";

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";

// Admin
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminCars from "./pages/Admin/Cars";
import AdminBookings from "./pages/Admin/Booking";
import AdminUsers from "./pages/Admin/Users";
import AdminPayments from "./pages/Admin/Payments";
import AdminServices from "./pages/Admin/Services";

function AppLayout() {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup", "/forgot-password"].includes(location.pathname);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <div id="main-content" tabIndex={-1}>
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
          element={<Home />}
        />


        {/* ================================
            BUY
        ================================= */}

        <Route
          path="/buy"
          element={<Buy />}
        />

        <Route
          path="/buy/:id"
          element={<BuyDetails />}
        />


        {/* ================================
            RENT
        ================================= */}

        <Route
          path="/rent"
          element={<Rent />}
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
          element={<Sell />}
        />

        <Route
          path="/sell/cars"
          element={
            <ProtectedRoute>
              <SellCar />
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

        <Route
          path="/cars/:id"
          element={<CarsDetails />}
        />


        {/* ================================
            SERVICES
        ================================= */}

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/services/:id"
          element={<ServiceDetails />}
        />

        <Route
          path="/service-request/:id"
          element={<ServiceRequest />}
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
          element={<Favorites />}
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

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />


        {/* ================================
            ADMIN
        ================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/cars"
          element={
            <AdminRoute>
              <AdminCars />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminBookings />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/services"
          element={
            <AdminRoute>
              <AdminServices />
            </AdminRoute>
          }
        />


        {/* ================================
            UNKNOWN ROUTES
        ================================= */}

        <Route path="*" element={<NotFound />} />

      </Routes>
      {!isAuthPage && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
