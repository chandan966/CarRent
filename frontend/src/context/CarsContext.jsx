import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buyCars as demoBuyCars, rentalCars as demoRentalCars } from "../data/cars";
import { getCars } from "../Services/carservices";

const CarsContext = createContext(null);
const demoCars = [
  ...demoBuyCars.map((car) => ({ ...car, id: String(car.id), listingType: "buy", status: "active" })),
  ...demoRentalCars.map((car) => ({ ...car, id: String(car.id), listingType: "rent", status: "active" })),
];

function groupCars(cars) {
  const buyCars = cars.filter((car) => car.listingType === "buy").map((car) => ({
    ...car,
    price: Number(car.priceValue ?? car.price),
    priceValue: Number(car.priceValue ?? car.price),
    priceLabel: car.priceLabel || `₹${Number(car.priceValue ?? car.price).toLocaleString("en-IN")}`,
  }));
  const rentalCars = cars.filter((car) => car.listingType === "rent").map((car) => ({
    ...car,
    pricePerDay: Number(car.pricePerDay ?? car.priceValue),
    priceLabel: car.priceLabel || `₹${Number(car.pricePerDay ?? car.priceValue).toLocaleString("en-IN")}/day`,
  }));
  const carsData = buyCars.map((car) => ({ ...car, model: car.model || car.name.replace(`${car.brand} `, ""), price: car.priceLabel }));
  return { cars, buyCars, rentalCars, carsData };
}

export function CarsProvider({ children }) {
  const [catalogState, setCatalogState] = useState(() => ({ ...groupCars(demoCars), isLoading: true, error: "", usingDemoData: true }));
  const refresh = useCallback(async () => {
    try {
      const cars = await getCars();
      setCatalogState({ ...groupCars(cars), isLoading: false, error: "", usingDemoData: false });
    } catch (error) {
      setCatalogState({ ...groupCars(demoCars), isLoading: false, error: error.message, usingDemoData: true });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  const value = useMemo(() => ({ ...catalogState, refresh }), [catalogState, refresh]);
  return <CarsContext.Provider value={value}>{children}</CarsContext.Provider>;
}

export function useCars() {
  const value = useContext(CarsContext);
  if (!value) throw new Error("useCars must be used inside CarsProvider");
  return value;
}
