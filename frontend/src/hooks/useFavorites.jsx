import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const FAVORITES_STORAGE_KEY = "favoriteCars";
const FavoritesContext = createContext(null);

export function getFavoriteKey(car, category = car?.category || "buy") {
  const carName =
    car?.name || [car?.brand, car?.model].filter(Boolean).join(" ") || car?.id;
  const normalizedName = String(carName || "unknown")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return `${category}:${normalizedName}`;
}

function readFavoriteCars() {
  if (typeof window === "undefined") return [];

  try {
    const savedCars = JSON.parse(
      window.localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]"
    );
    if (!Array.isArray(savedCars)) return [];

    const uniqueCars = [];
    const seenKeys = new Set();

    savedCars.forEach((car) => {
      if (!car || typeof car !== "object") return;

      // Older saved cars did not have a category, so treat them as sale listings.
      const category = car.category || "buy";
      const favoriteKey = getFavoriteKey(car, category);
      if (seenKeys.has(favoriteKey)) return;

      seenKeys.add(favoriteKey);
      uniqueCars.push({
        ...car,
        category,
        favoriteKey,
        price: car.priceLabel ?? car.price ?? "",
      });
    });

    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(uniqueCars)
    );
    return uniqueCars;
  } catch (error) {
    console.error("Error loading favorites:", error);
    return [];
  }
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(readFavoriteCars);

  useEffect(() => {
    const syncFavoritesFromAnotherTab = (event) => {
      if (event.key === FAVORITES_STORAGE_KEY || event.key === null) {
        setFavorites(readFavoriteCars());
      }
    };

    window.addEventListener("storage", syncFavoritesFromAnotherTab);
    return () =>
      window.removeEventListener("storage", syncFavoritesFromAnotherTab);
  }, []);

  const isFavorite = useCallback((car, category = car?.category || "buy") => {
    if (!car) return false;
    const favoriteKey = getFavoriteKey(car, category);
    return favorites.some((favorite) => favorite.favoriteKey === favoriteKey);
  }, [favorites]);

  const toggleFavorite = useCallback((car, category = "buy") => {
    if (!car) return;

    const favoriteKey = getFavoriteKey(car, category);
    const isSaved = favorites.some(
      (favorite) => favorite.favoriteKey === favoriteKey
    );
    const updatedFavorites = isSaved
      ? favorites.filter((favorite) => favorite.favoriteKey !== favoriteKey)
      : [
          ...favorites,
          {
            ...car,
            category,
            favoriteKey,
            price: car.priceLabel ?? car.price ?? "",
          },
        ];

    setFavorites(updatedFavorites);
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }, [favorites]);

  const removeFavorite = useCallback((car) => {
    if (!car) return;

    const favoriteKey = car.favoriteKey || getFavoriteKey(car);
    const updatedFavorites = favorites.filter(
      (favorite) => favorite.favoriteKey !== favoriteKey
    );

    setFavorites(updatedFavorites);
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }, [favorites]);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, removeFavorite }),
    [favorites, isFavorite, toggleFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return context;
}
