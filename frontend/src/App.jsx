import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import ForgotPassword from "./pages/Auth/ForgotPassword.jsx";

// Home
import Home from "./pages/Home/Home";

// Buy
import Buy from "./pages/buy/Buy";
import BuyDetails from "./pages/buy/BuyDetails";

// Rent
import Rent from "./pages/Rent/Rent";

// Sell
import Sell from "./pages/Sell/Selll";

// Services
import Services from "./pages/Services/Services";
import ServiceDetails from "./pages/Services/ServiceDetails";

// Booking
import Booking from "./pages/Booking/Booking";

// Profile
import Profile from "./pages/Profile/Profile";
import Favorites from "./pages/Profile/Favorites";
import MyPurchases from "./pages/Profile/MyPurchases";
import MyRentals from "./pages/Profile/MyRental";

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}

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


        {/* HOME */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />


        {/* BUY */}

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


        {/* RENT */}

        <Route
          path="/rent"
          element={
            <ProtectedRoute>
              <Rent />
            </ProtectedRoute>
          }
        />


        {/* SELL */}

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <Sell />
            </ProtectedRoute>
          }
        />


        {/* SERVICES */}

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


        {/* BOOKING */}

        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />


        {/* PROFILE */}

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


        {/* UNKNOWN ROUTES */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

      <div className="developer-credit">
        Developer Chandan Ghanghav
      </div>
    </BrowserRouter>
  );
}

export default App;