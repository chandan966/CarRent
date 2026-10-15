export function getFavoriteKey(car, category = car?.category || "buy") {
  if (car?.id !== undefined && car?.id !== null && String(car.id).length) {
    return `${category}:${String(car.id)}`;
  }
  const carName =
    car?.name || [car?.brand, car?.model].filter(Boolean).join(" ") || car?.id;
  const normalizedName = String(carName || "unknown")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return `${category}:${normalizedName}`;
}
