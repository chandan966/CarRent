import "./BookingSummary.css";

function BookingSummary({ car, type, startDate, days = 1 }) {
	const amount = type === "rent" ? car.pricePerDay * Number(days || 1) : car.price;
	const total = new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount || 0);

	return (
		<div className="booking-summary">
			<h2>Booking summary</h2>
			<p>{car.name}</p>
			<p>{type === "rent" ? "Rental" : "Purchase"}</p>
			<strong>{type === "rent" ? `${total} estimated total` : car.priceLabel}</strong>
			{type === "rent" && <p>{car.priceLabel} × {days} day{Number(days) === 1 ? "" : "s"}</p>}
			{startDate && <p>Pickup: {new Date(`${startDate}T00:00:00`).toLocaleDateString("en-IN")}</p>}
		</div>
	);
}

export default BookingSummary;
