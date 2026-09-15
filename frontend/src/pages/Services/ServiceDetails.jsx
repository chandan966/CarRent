import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import "./ServiceDetails.css";

const services = [
  {
    id: 1,
    title: "Car Service",
    description:
      "Complete vehicle servicing designed to maintain performance, reliability and comfort.",
    price: "Starting from ₹1,499",
    duration: "2–4 Hours",
    features: [
      "Engine inspection",
      "Oil and filter check",
      "Brake inspection",
      "Fluid level check",
      "General vehicle inspection",
    ],
  },
  {
    id: 2,
    title: "Car Detailing",
    description:
      "Professional interior and exterior detailing to restore the appearance of your vehicle.",
    price: "Starting from ₹2,499",
    duration: "3–5 Hours",
    features: [
      "Exterior cleaning",
      "Interior cleaning",
      "Dashboard cleaning",
      "Seat cleaning",
      "Final vehicle inspection",
    ],
  },
  {
    id: 3,
    title: "Car Inspection",
    description:
      "Detailed inspection to help you understand the condition of a vehicle before making a decision.",
    price: "Starting from ₹999",
    duration: "1–2 Hours",
    features: [
      "Engine inspection",
      "Body inspection",
      "Brake inspection",
      "Tyre inspection",
      "Document verification",
    ],
  },
  {
    id: 4,
    title: "Battery Service",
    description:
      "Battery testing and replacement support to keep your vehicle starting reliably.",
    price: "Starting from ₹499",
    duration: "30–60 Minutes",
    features: [
      "Battery health check",
      "Voltage testing",
      "Terminal inspection",
      "Battery replacement support",
      "Charging system check",
    ],
  },
  {
    id: 5,
    title: "Diagnostics",
    description:
      "Professional diagnostics to identify potential electronic and mechanical vehicle problems.",
    price: "Starting from ₹799",
    duration: "1–2 Hours",
    features: [
      "Computer diagnostics",
      "Error code scanning",
      "Engine diagnostics",
      "Electrical system check",
      "Diagnostic report",
    ],
  },
  {
    id: 6,
    title: "General Maintenance",
    description:
      "Regular maintenance to improve vehicle performance and extend the life of your car.",
    price: "Starting from ₹1,199",
    duration: "2–3 Hours",
    features: [
      "Vehicle inspection",
      "Fluid checks",
      "Tyre inspection",
      "Brake inspection",
      "General maintenance",
    ],
  },
];

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const service = services.find(
    (item) => item.id === Number(id)
  );

  if (!service) {
    return (
      <>
        <Navbar />

        <main className="service-details-page">
          <div className="service-details-not-found">
            <Wrench size={50} />

            <h1>Service Not Found</h1>

            <p>
              The service you are looking for is not available.
            </p>

            <button onClick={() => navigate("/services")}>
              Back to Services
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="service-details-page">
        <div className="service-details-container">

          <button
            className="service-details-back"
            onClick={() => navigate("/services")}
          >
            <ArrowLeft size={18} />
            Back to Services
          </button>

          <section className="service-details-card">

            <div className="service-details-icon">
              <Wrench size={55} />
            </div>

            <span className="service-details-eyebrow">
              AUTOMOTIVE SERVICE
            </span>

            <h1>{service.title}</h1>

            <p className="service-details-description">
              {service.description}
            </p>

            <div className="service-details-info">

              <div>
                <span>PRICE</span>
                <strong>{service.price}</strong>
              </div>

              <div>
                <span>ESTIMATED TIME</span>
                <strong>
                  <Clock size={17} />
                  {service.duration}
                </strong>
              </div>

            </div>

            <div className="service-details-content">

              <h2>What's included?</h2>

              <div className="service-details-features">
                {service.features.map((feature) => (
                  <div
                    className="service-detail-feature"
                    key={feature}
                  >
                    <CheckCircle size={19} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

            </div>

            <div className="service-details-trust">
              <ShieldCheck size={22} />

              <div>
                <strong>Professional Service</strong>

                <p>
                  Your vehicle is handled with care and attention.
                </p>
              </div>
            </div>

            <button
              className="service-details-book"
              onClick={() =>
                navigate(
                  `/booking?service=${service.id}&type=service`
                )
              }
            >
              Book This Service
            </button>

          </section>

        </div>
      </main>
    </>
  );
}

export default ServiceDetails;