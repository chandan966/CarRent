import React from "react";
import "./ContactSeller.css";

export default function ContactSeller({ car, onClose }) {
  if (!car) return null;

  const sellerName = car.sellerName || car.seller?.name || "Car Seller";
  const phone = typeof car.sellerPhone === "string"
    ? car.sellerPhone
    : car.seller?.phone || "";

  const formattedPhone = typeof phone === "string" ? phone.trim() : "";
  const cleanPhone = formattedPhone ? formattedPhone.replace(/[^\d+]/g, "") : "";
  const whatsappPhone = formattedPhone ? formattedPhone.replace(/\D/g, "") : "";
  const carName = car.name || car.title || "Selected Car";

  const message = encodeURIComponent(
    `Hello ${sellerName}, I am interested in your ${carName}. Is it still available?`
  );

  return (
    <div className="seller-modal-overlay" onClick={onClose}>
      <div
        className="seller-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="seller-modal-close"
          onClick={onClose}
          aria-label="Close contact window"
        >
          ×
        </button>

        <div className="seller-modal-icon">👤</div>

        <h2>Narendra Modi </h2>
        <p className="seller-modal-subtitle">
          Get in touch with the seller about this car.
        </p>

        <div className="seller-car-details">
          <h3>{carName}</h3>
          {car.price && <p>Price: {car.price}</p>}
          <p>Seller: {sellerName}</p>
        </div>

        {formattedPhone ? (
          <>
            <p className="seller-phone">{formattedPhone}</p>

            <div className="seller-contact-actions">
              <a className="seller-call-btn" href={`tel:${cleanPhone}`}>
                📞 Call Seller
              </a>

              <a
                className="seller-whatsapp-btn"
                href={
                  whatsappPhone
                    ? `https://wa.me/${whatsappPhone}?text=${message}`
                    : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Seller
              </a>
            </div>
          </>
        ) : (
          <p className="seller-no-phone">
            Seller contact details are not available for this car yet.
          </p>
        )}

        <button className="seller-done-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
