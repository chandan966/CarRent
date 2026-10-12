import React from "react";
import "./ViewDetail.css";

const ViewDetail = ({ car }) => {
  if (!car) {
    return (
      <div className="view-detail-page">
        <h2>Car details not found</h2>
      </div>
    );
  }

  return (
    <div className="view-detail-page">
      <div className="view-detail-container">
        <div className="view-detail-image">
          <img src={car.image || car.img || car.poster} alt={car.name} />
        </div>

        <div className="view-detail-info">
          <h1>{car.name}</h1>

          <p className="car-price">
            ₹{car.price || car.rent || "Price not available"}
          </p>

          <p>
            <strong>Brand:</strong> {car.brand || "N/A"}
          </p>

          <p>
            <strong>Model:</strong> {car.model || "N/A"}
          </p>

          <p>
            <strong>Fuel:</strong> {car.fuel || "N/A"}
          </p>

          <p>
            <strong>Transmission:</strong> {car.transmission || "N/A"}
          </p>

          <p>
            <strong>Seats:</strong> {car.seats || "N/A"}
          </p>

          <button className="rent-now-btn">Rent Now</button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetail;