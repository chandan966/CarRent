import "./BookingSummary.css";

function BookingSummary({ car, type }) {
	return (
		<div className="booking-summary">
			<h2>Booking summary</h2>
			<p>{car.name}</p>
			<p>{type === "rent" ? "Rental" : "Purchase"}</p>
			<strong>{car.priceLabel}</strong>
		</div>
	);
}

export default BookingSummary;
