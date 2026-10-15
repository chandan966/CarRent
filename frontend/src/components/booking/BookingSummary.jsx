import "./BookingSummary.css";

function BookingSummary({ car, type, startDate, days = 1 }) {
	const amount = type === "rent" ? car.pricePerDay * Number(days || 1) : car.price;
	const total = new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 0,
	}).format(amount || 0);

	return (
		<div className="booking-summary" aria-label="Booking price summary">
			<h2>Booking summary</h2>
			<p className="booking-summary-car">{car.name}</p>
			<p className="booking-summary-type">{type === "rent" ? "Rental request" : "Purchase request"}</p>
			<strong className="booking-summary-total">{type === "rent" ? `${total} estimated total` : car.priceLabel}</strong>
			{type === "rent" && <p className="booking-summary-breakdown">{car.priceLabel} × {days} day{Number(days) === 1 ? "" : "s"}</p>}
			{startDate && <p className="booking-summary-date">Pickup: {new Date(`${startDate}T00:00:00`).toLocaleDateString("en-IN")}</p>}
			<p className="booking-summary-note">No payment is taken at this step. This submits a request for the seller or rental team to confirm.</p>
		</div>
	);
}

export default BookingSummary;
