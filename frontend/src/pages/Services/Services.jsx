import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  Wrench,
  ShieldCheck,
  Sparkles,
  Battery,
  CircleGauge,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import "./Services.css";

const services = [
  {
    id: 1,
    title: "Car Service",
    description:
      "Complete vehicle servicing to keep your car running smoothly and reliably.",
    icon: Wrench,
  },
  {
    id: 2,
    title: "Car Detailing",
    description:
      "Professional interior and exterior detailing to keep your vehicle looking its best.",
    icon: Sparkles,
  },
  {
    id: 3,
    title: "Car Inspection",
    description:
      "Detailed vehicle inspection before buying or selling a car.",
    icon: ShieldCheck,
  },
  {
    id: 4,
    title: "Battery Service",
    description:
      "Battery inspection, replacement and support for your vehicle.",
    icon: Battery,
  },
  {
    id: 5,
    title: "Diagnostics",
    description:
      "Identify vehicle issues using professional diagnostic checks.",
    icon: CircleGauge,
  },
  {
    id: 6,
    title: "General Maintenance",
    description:
      "Regular maintenance services to improve vehicle performance and life.",
    icon: Car,
  },
];

function Services() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="services-page">
        <div className="services-container">

          <button
            className="services-back-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          <section className="services-hero">
            <div>
              <span className="services-eyebrow">
                AUTOMOTIVE SERVICES
              </span>

              <h1>
                Everything Your
                <span> Car Needs</span>
              </h1>

              <p>
                From routine maintenance to professional inspections,
                get reliable automotive services for your vehicle.
              </p>
            </div>

            <div className="services-hero-icon">
              <Wrench size={70} />
            </div>
          </section>

          <section className="services-list-section">
            <div className="services-section-heading">
              <span>OUR SERVICES</span>
              <h2>Choose a service</h2>
            </div>

            <div className="services-grid">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    className="service-card"
                    key={service.id}
                    onClick={() =>
                      navigate(`/services/${service.id}`)
                    }
                  >
                    <div className="service-card-icon">
                      <Icon size={27} />
                    </div>

                    <h3>{service.title}</h3>

                    <p>{service.description}</p>

                    <button
                      className="service-card-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/services/${service.id}`);
                      }}
                    >
                      View Details
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="services-cta">
            <div>
              <h2>Need help with your car?</h2>

              <p>
                Choose a service and get started with your vehicle
                care today.
              </p>
            </div>

            <button
              onClick={() => navigate("/services/1")}
            >
              Explore Services
            </button>
          </section>

        </div>
      </main>
    </>
  );
}

export default Services;    