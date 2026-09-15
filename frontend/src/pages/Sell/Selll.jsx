import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  CheckCircle,
  DollarSign,
  ShieldCheck,
  Users,
} from "lucide-react";

import Navbar from "../../components/navbar/Navbar";
import "./Sell.css";

function Sell() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <main className="sell-page">
        <div className="sell-container">

          {/* Back Button */}
          <button
            className="sell-back-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>

          {/* Hero Section */}
          <section className="sell-hero">
            <div className="sell-hero-content">
              <span className="sell-eyebrow">
                SELL YOUR CAR
              </span>

              <h1>
                Sell Your Car
                <span> With Confidence</span>
              </h1>

              <p>
                List your car, reach genuine buyers, and get the
                right value for your vehicle through our platform.
              </p>

              <button
                className="sell-primary-button"
                onClick={() => navigate("/sell/cars")}
              >
                <Car size={19} />
                Sell My Car
              </button>
            </div>

            <div className="sell-hero-card">
              <Car size={55} />

              <h2>Ready to sell?</h2>

              <p>
                Create your car listing and start connecting
                with potential buyers.
              </p>

              <CheckCircle size={24} />
            </div>
          </section>

          {/* Benefits */}
          <section className="sell-benefits">
            <div className="sell-section-heading">
              <span>WHY SELL WITH US</span>
              <h2>A simpler way to sell your car</h2>
            </div>

            <div className="sell-benefits-grid">

              <div className="sell-benefit-card">
                <div className="sell-benefit-icon">
                  <Users size={24} />
                </div>

                <h3>Reach More Buyers</h3>

                <p>
                  Showcase your vehicle to people actively
                  looking for cars.
                </p>
              </div>

              <div className="sell-benefit-card">
                <div className="sell-benefit-icon">
                  <DollarSign size={24} />
                </div>

                <h3>Better Value</h3>

                <p>
                  Present your vehicle professionally and get
                  competitive offers.
                </p>
              </div>

              <div className="sell-benefit-card">
                <div className="sell-benefit-icon">
                  <ShieldCheck size={24} />
                </div>

                <h3>Secure Process</h3>

                <p>
                  Manage your listing through a reliable and
                  transparent platform.
                </p>
              </div>

            </div>
          </section>

          {/* How It Works */}
          <section className="sell-how-it-works">
            <div className="sell-section-heading">
              <span>HOW IT WORKS</span>
              <h2>Sell your car in 3 simple steps</h2>
            </div>

            <div className="sell-steps">

              <div className="sell-step">
                <span>01</span>
                <h3>Create Listing</h3>
                <p>
                  Add your car details, photos, price and
                  location.
                </p>
              </div>

              <div className="sell-step">
                <span>02</span>
                <h3>Connect With Buyers</h3>
                <p>
                  Interested buyers can discover your vehicle.
                </p>
              </div>

              <div className="sell-step">
                <span>03</span>
                <h3>Complete the Sale</h3>
                <p>
                  Finalize the deal and hand over your vehicle.
                </p>
              </div>

            </div>
          </section>

          {/* CTA */}
          <section className="sell-bottom-cta">
            <h2>Ready to sell your car?</h2>

            <p>
              Start your listing today and put your car in front
              of potential buyers.
            </p>

            <button
              className="sell-primary-button"
              onClick={() => navigate("/sell/cars")}
            >
              Start Selling
            </button>
          </section>

        </div>
      </main>
    </>
  );
}

export default Sell;