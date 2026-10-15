import React, { useEffect, useRef } from "react";
import "./ContactSeller.css";

export default function ContactSeller({ car, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!car) return undefined;

    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus?.();
    };
  }, [car, onClose]);

  if (!car) return null;

  const sellerName = car.sellerName || car.seller?.name || "Car Seller";
  const phone = typeof car.sellerPhone === "string"
    ? car.sellerPhone
    : car.seller?.phone || "";

  const formattedPhone = typeof phone === "string" ? phone.trim() : "";
  const cleanPhone = formattedPhone ? formattedPhone.replace(/[^\d+]/g, "") : "";
  const whatsappPhone = formattedPhone ? formattedPhone.replace(/\D/g, "") : "";
  const carName = car.name || car.title || "Selected Car";
  const displayPrice = car.priceLabel || (typeof car.price === "number"
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(car.price)
    : car.price);

  const message = encodeURIComponent(
    `Hello ${sellerName}, I am interested in your ${carName}. Is it still available?`
  );

  return (
    <div className="seller-modal-overlay" onClick={onClose}>
      <div
        className="seller-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="seller-modal-close"
          type="button"
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close contact window"
        >
          ×
        </button>

        <div className="seller-modal-icon">👤</div>

        <h2 id="seller-modal-title">Contact {sellerName}</h2>
        <p className="seller-modal-subtitle">
          Get in touch with the seller about this car.
        </p>

        <div className="seller-car-details">
          <h3>{carName}</h3>
          {displayPrice && <p>Price: {displayPrice}</p>}
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
                href={`https://wa.me/${whatsappPhone}?text=${message}`}
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

        <button className="seller-done-btn" type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
