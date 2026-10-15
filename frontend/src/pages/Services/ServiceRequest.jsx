import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, Wrench } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import { createServiceRequest } from "../../Services/adminServices";
import "./ServiceRequest.css";

const serviceOptions = [
  { id: 1, title: "Car Service", duration: "2–4 hours", price: "Starting from ₹1,499" },
  { id: 2, title: "Car Detailing", duration: "3–5 hours", price: "Starting from ₹2,499" },
  { id: 3, title: "Car Inspection", duration: "1–2 hours", price: "Starting from ₹999" },
  { id: 4, title: "Battery Service", duration: "30–60 minutes", price: "Starting from ₹499" },
  { id: 5, title: "Diagnostics", duration: "1–2 hours", price: "Starting from ₹799" },
  { id: 6, title: "General Maintenance", duration: "2–3 hours", price: "Starting from ₹1,199" },
];

function ServiceRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = serviceOptions.find((item) => item.id === Number(id));
  const [prepared, setPrepared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const now = new Date();
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  if (!service) {
    return (
      <>
        <Navbar />
        <main className="service-request-page">
          <section className="service-request-card service-request-not-found">
            <Wrench size={34} aria-hidden="true" />
            <h1>Service not found</h1>
            <p>Choose one of the available services to continue.</p>
            <Link to="/services">Browse services</Link>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="service-request-page">
        <div className="service-request-container">
          <button className="service-request-back" type="button" onClick={() => navigate(`/services/${service.id}`)}>
            <ArrowLeft size={17} aria-hidden="true" /> Back to service details
          </button>

          <div className="service-request-layout">
            <section className="service-request-card">
              {prepared ? (
                <div className="service-request-result" role="status">
                  <span className="service-request-success-icon"><CheckCircle2 size={30} aria-hidden="true" /></span>
                  <span className="service-request-eyebrow">REQUEST SAVED</span>
                  <h1>Your {service.title.toLowerCase()} request is submitted</h1>
                  <p>Request <strong>{requestId}</strong> is saved. The CarRent team can review it in the admin service requests API.</p>
                  <button type="button" onClick={() => navigate("/services")}>Browse other services</button>
                </div>
              ) : (
                <>
                  <span className="service-request-eyebrow">SERVICE APPOINTMENT</span>
                  <h1>Request {service.title}</h1>
                  <p className="service-request-intro">Choose a preferred date and add your contact details. Your request is stored securely for the CarRent team to review.</p>

                  <form className="service-request-form" onSubmit={async (event) => {
                    event.preventDefault();
                    setError("");
                    setIsSubmitting(true);
                    const data = new FormData(event.currentTarget);
                    try {
                      const result = await createServiceRequest({
                        serviceId: id,
                        fullName: data.get("fullName"),
                        email: data.get("email"),
                        phone: data.get("phone"),
                        date: data.get("date"),
                        notes: data.get("notes"),
                      });
                      setRequestId(result.request.id);
                      setPrepared(true);
                    } catch (requestError) {
                      setError(requestError.message);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}>
                    <label>
                      Full name
                      <input name="fullName" type="text" autoComplete="name" minLength={2} maxLength={100} required />
                    </label>
                    <label>
                      Email address
                      <input name="email" type="email" autoComplete="email" maxLength={254} required />
                    </label>
                    <label>
                      Phone number
                      <input name="phone" type="tel" autoComplete="tel" pattern="\+?[0-9 ()-]{7,20}" placeholder="+91 98765 43210" required />
                    </label>
                    <label>
                      Preferred date
                      <span className="service-request-date-input">
                        <CalendarDays size={17} aria-hidden="true" />
                        <input name="date" type="date" min={today} required />
                      </span>
                    </label>
                    <label className="service-request-notes">
                      Vehicle and service notes <span>(optional)</span>
                      <textarea name="notes" rows="4" maxLength={1000} placeholder="Car model, registration or anything we should know" />
                    </label>
                    <p className="service-request-preview-note">Submitting stores your service request. It does not take payment or confirm an appointment.</p>
                    {error && <p className="service-request-error" role="alert">{error}</p>}
                    <button className="service-request-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit service request"}</button>
                  </form>
                </>
              )}
            </section>

            <aside className="service-request-summary">
              <span className="service-request-summary-icon"><Wrench size={22} aria-hidden="true" /></span>
              <span className="service-request-eyebrow">SELECTED SERVICE</span>
              <h2>{service.title}</h2>
              <p>{service.price}</p>
              <div><Clock size={16} aria-hidden="true" /> Estimated time: {service.duration}</div>
              <Link to="/services">Compare services</Link>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default ServiceRequest;
