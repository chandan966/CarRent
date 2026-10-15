import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CarFront, CheckCircle2, ImagePlus, X } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import { createSellerListing } from "../../Services/carservices";
import "./SellCar.css";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const emptyForm = {
  brand: "",
  model: "",
  year: "",
  price: "",
  location: "",
  mileage: "",
  fuel: "Petrol",
  transmission: "Automatic",
  phone: "",
};

function PhotoUploadGroup({ title, description, photos, inputId, onChange, onRemove }) {
  return (
    <section className="sell-car-photo-group">
      <div className="sell-car-photo-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span>{photos.length}/{MAX_PHOTOS}</span>
      </div>

      <label className="sell-car-upload-button" htmlFor={inputId}>
        <ImagePlus size={18} />
        Choose photos
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onChange}
        />
      </label>

      {photos.length > 0 ? (
        <div className="sell-car-photo-grid">
          {photos.map((photo) => (
            <div className="sell-car-photo-preview" key={photo.id}>
              <img src={photo.previewUrl} alt={photo.name} />
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                aria-label={"Remove " + photo.name}
                title="Remove photo"
              >
                <X size={16} />
              </button>
              <span title={photo.name}>{photo.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="sell-car-photo-empty">No photos selected yet.</p>
      )}
    </section>
  );
}

function SellCar() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [outsidePhotos, setOutsidePhotos] = useState([]);
  const [insidePhotos, setInsidePhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedListingId, setSubmittedListingId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const previewUrls = useRef(new Set());

  useEffect(() => {
    const urls = previewUrls.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSubmitted(false);
  };

  const handlePhotoChange = (category, event) => {
    const currentPhotos = category === "outside" ? outsidePhotos : insidePhotos;
    const setPhotos = category === "outside" ? setOutsidePhotos : setInsidePhotos;
    const selectedFiles = Array.from(event.target.files || []);
    const availableSlots = MAX_PHOTOS - currentPhotos.length;
    const validFiles = selectedFiles.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE
    );

    const newPhotos = validFiles.slice(0, availableSlots).map((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return {
        id: Date.now() + "-" + Math.random().toString(36).slice(2),
        file,
        name: file.name,
        previewUrl,
      };
    });

    setPhotos((current) => [...current, ...newPhotos]);

    const messages = [];
    if (validFiles.length !== selectedFiles.length) {
      messages.push("Choose JPG, PNG, or WebP image files up to 5 MB each.");
    }
    if (validFiles.length > availableSlots) {
      messages.push("You can upload up to 5 photos in this section.");
    }
    setPhotoError(messages.join(" "));
    event.target.value = "";
    setSubmitted(false);
  };

  const removePhoto = (category, photoId) => {
    const currentPhotos = category === "outside" ? outsidePhotos : insidePhotos;
    const setPhotos = category === "outside" ? setOutsidePhotos : setInsidePhotos;
    const photo = currentPhotos.find((item) => item.id === photoId);

    if (photo) {
      URL.revokeObjectURL(photo.previewUrl);
      previewUrls.current.delete(photo.previewUrl);
    }

    setPhotos((current) => current.filter((item) => item.id !== photoId));
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setPhotoError("");

    if (outsidePhotos.length === 0 || insidePhotos.length === 0) {
      setPhotoError("Upload at least one outside photo and one inside photo.");
      return;
    }

    setIsSaving(true);

    try {
      const upload = new FormData(event.currentTarget);
      outsidePhotos.forEach((photo) => upload.append("outsidePhotos", photo.file, photo.name));
      insidePhotos.forEach((photo) => upload.append("insidePhotos", photo.file, photo.name));
      const savedListing = await createSellerListing(upload);

      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
      setOutsidePhotos([]);
      setInsidePhotos([]);
      setForm(emptyForm);
      setSubmittedListingId(savedListing.id);
      setSubmitted(true);
    } catch {
      setError(
        "Could not save this listing and its photos. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="sell-car-page">
        <div className="sell-car-container">
          <button
            className="sell-car-back"
            type="button"
            onClick={() => navigate("/sell")}
          >
            <ArrowLeft size={18} />
            Back to Sell
          </button>

          <header className="sell-car-heading">
            <span>CREATE A LISTING</span>
            <h1>Sell your car</h1>
            <p>Add your car details, photos, and contact information.</p>
          </header>

          {submitted && (
            <div className="sell-car-success" role="status">
              <CheckCircle2 size={20} />
              <span>
                Your listing {submittedListingId} and photos were saved to the server. It is pending admin review and will appear publicly after approval.
              </span>
            </div>
          )}

          {error && (
            <p className="sell-car-error" role="alert">
              {error}
            </p>
          )}

          {photoError && (
            <p className="sell-car-error" role="alert">
              {photoError}
            </p>
          )}

          <form className="sell-car-form" onSubmit={handleSubmit}>
            <section className="sell-car-section">
              <h2><CarFront size={20} /> Car information</h2>

              <div className="sell-car-fields">
                <label>
                  Brand
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    placeholder="e.g. Toyota"
                    required
                  />
                </label>

                <label>
                  Model
                  <input
                    name="model"
                    value={form.model}
                    onChange={handleChange}
                    placeholder="e.g. Innova Crysta"
                    required
                  />
                </label>

                <label>
                  Year
                  <input
                    name="year"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    value={form.year}
                    onChange={handleChange}
                    placeholder="2022"
                    required
                  />
                </label>

                <label>
                  Asking price (₹)
                  <input
                    name="price"
                    type="number"
                    min="1"
                    step="1000"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="850000"
                    required
                  />
                </label>

                <label>
                  Location
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="City, State"
                    required
                  />
                </label>

                <label>
                  Mileage
                  <input
                    name="mileage"
                    value={form.mileage}
                    onChange={handleChange}
                    placeholder="e.g. 35,000 km"
                  />
                </label>

                <label>
                  Fuel
                  <select name="fuel" value={form.fuel} onChange={handleChange}>
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Electric</option>
                    <option>Hybrid</option>
                    <option>CNG</option>
                  </select>
                </label>

                <label>
                  Transmission
                  <select
                    name="transmission"
                    value={form.transmission}
                    onChange={handleChange}
                  >
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="sell-car-section">
              <h2>Car photos</h2>
              <p className="sell-car-photo-help">
                Upload up to 5 exterior photos and up to 5 interior photos.
                Accepted formats: JPG, PNG, or WebP. Maximum 5 MB per photo.
              </p>

              <div className="sell-car-photo-groups">
                <PhotoUploadGroup
                  title="Outside photos"
                  description="Show the front, rear, and both sides of the car."
                  photos={outsidePhotos}
                  inputId="outside-photos"
                  onChange={(event) => handlePhotoChange("outside", event)}
                  onRemove={(photoId) => removePhoto("outside", photoId)}
                />

                <PhotoUploadGroup
                  title="Inside photos"
                  description="Show the seats, dashboard, and cabin."
                  photos={insidePhotos}
                  inputId="inside-photos"
                  onChange={(event) => handlePhotoChange("inside", event)}
                  onRemove={(photoId) => removePhoto("inside", photoId)}
                />
              </div>
            </section>

            <section className="sell-car-section">
              <h2>Seller contact</h2>
              <label>
                Phone number
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                />
              </label>
            </section>

            <button className="sell-car-submit" type="submit" disabled={isSaving}>
              {isSaving ? "Saving listing..." : "Submit car listing"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default SellCar;

