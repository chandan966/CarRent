import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { FavoritesProvider } from "./hooks/useFavorites.jsx";
import { CarsProvider } from "./context/CarsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <CarsProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </CarsProvider>
    </AuthProvider>
  </StrictMode>
);  
