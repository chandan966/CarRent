import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CarFront, CheckCircle2, ImagePlus, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import Navbar from "../../components/Navbar/Navbar";
import "./SellCar.css";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PHOTO_DB_NAME = "carRentalPhotoStorage";
const PHOTO_STORE_NAME = "photos";

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

function openPhotoDatabase() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(PHOTO_DB_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(PHOTO_STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePhotoFiles(listingId, outsidePhotos, insidePhotos) {
  const database = await openPhotoDatabase();
  const transaction = database.transaction(PHOTO_STORE_NAME, "readwrite");
  const store = transaction.objectStore(PHOTO_STORE_NAME);
  const photoRefs = { outside: [], inside: [] };

  outsidePhotos.forEach((photo, index) => {
    const id = listingId + ":outside:" + index;
    store.put({
      id,
      listingId,
      category: "outside",
      name: photo.name,
      type: photo.file.type,
      file: photo.file,
    });
    photoRefs.outside.push(id);
  });

  insidePhotos.forEach((photo, index) => {
    const id = listingId + ":inside:" + index;
    store.put({
      id,
      listingId,
      category: "inside",
      name: photo.name,
      type: photo.file.type,
      file: photo.file,
    });
    photoRefs.inside.push(id);
  });

  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

  database.close();
  return photoRefs;
}

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
  const { user } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [outsidePhotos, setOutsidePhotos] = useState([]);
  const [insidePhotos, setInsidePhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const previewUrls = useRef(new Set());

  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
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
      const listingId = String(Date.now());
      const photoRefs = await savePhotoFiles(
        listingId,
        outsidePhotos,
        insidePhotos
      );
      const savedListings = JSON.parse(
        localStorage.getItem("carRentalSellerListings") || "[]"
      );

      const listing = {
        id: listingId,
        name: form.brand.trim() + " " + form.model.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        price: Number(form.price),
        priceLabel: "₹" + Number(form.price).toLocaleString("en-IN"),
        location: form.location.trim(),
        mileage: form.mileage.trim(),
        fuel: form.fuel,
        transmission: form.transmission,
        photos: photoRefs,
        sellerName: user?.fullName || "Car seller",
        sellerPhone: form.phone.trim(),
        sellerEmail: user?.email || "",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const listings = Array.isArray(savedListings) ? savedListings : [];
      localStorage.setItem(
        "carRentalSellerListings",
        JSON.stringify([listing, ...listings])
      );

      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
      setOutsidePhotos([]);
      setInsidePhotos([]);
      setForm(emptyForm);
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
                Your listing and photos were saved in this browser. They are not
                published to the public car list because this project has no
                connected backend yet.
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

