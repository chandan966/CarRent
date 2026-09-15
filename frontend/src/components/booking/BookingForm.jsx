import { useState } from "react";
import "./BookingForm.css";

const locationData = {
  Maharashtra: {
    Thane: [
      "Thane",
      "Kalyan",
      "Bhiwandi",
      "Ulhasnagar",
      "Ambernath",
      "Murbad",
      "Shahapur",
      "Dahanu",
      "Palghar",
      "Vasai",
      "Virar",
    ],
    Pune: [
      "Pune City",
      "Haveli",
      "Mulshi",
      "Maval",
      "Khed",
      "Junnar",
      "Shirur",
      "Baramati",
      "Daund",
      "Indapur",
      "Bhor",
      "Purandar",
      "Velhe",
    ],
    "Mumbai Suburban": [
      "Andheri",
      "Borivali",
      "Kurla",
    ],
    "Mumbai City": [
      "Mumbai City",
    ],
    Nashik: [
      "Nashik",
      "Dindori",
      "Igatpuri",
      "Kalwan",
      "Malegaon",
      "Nandgaon",
      "Niphad",
      "Peint",
      "Sinnar",
      "Yeola",
      "Baglan",
      "Chandwad",
      "Deola",
      "Trimbakeshwar",
    ],
    Nagpur: [
      "Nagpur Urban",
      "Nagpur Rural",
      "Kamptee",
      "Hingna",
      "Katol",
      "Narkhed",
      "Ramtek",
      "Saoner",
      "Umred",
    ],
    "Chhatrapati Sambhajinagar": [
      "Aurangabad",
      "Kannad",
      "Gangapur",
      "Paithan",
      "Sillod",
      "Vaijapur",
      "Khuldabad",
      "Soegaon",
      "Phulambri",
    ],
    Kolhapur: [
      "Karvir",
      "Panhala",
      "Hatkanangale",
      "Shirol",
      "Kagal",
      "Gadhinglaj",
      "Radhanagari",
      "Bhudargad",
      "Ajra",
      "Chandgad",
    ],
    Satara: [
      "Satara",
      "Karad",
      "Wai",
      "Mahabaleshwar",
      "Phaltan",
      "Khatav",
      "Man",
      "Koregaon",
      "Patan",
      "Jaoli",
    ],
    Solapur: [
      "Solapur North",
      "Solapur South",
      "Barshi",
      "Akkalkot",
      "Akkalkot",
      "Karmala",
      "Madha",
      "Malshiras",
      "Mangalvedhe",
      "Mohol",
      "Pandharpur",
    ],
  },

  Gujarat: {
    Ahmedabad: [
      "Ahmedabad City",
      "Daskroi",
      "Sanand",
      "Bavla",
      "Dholka",
      "Viramgam",
      "Detroj-Rampura",
      "Mandal",
    ],
    Surat: [
      "Choryasi",
      "Olpad",
      "Kamrej",
      "Bardoli",
      "Mahuva",
      "Mandvi",
      "Mangrol",
      "Umarpada",
    ],
    Vadodara: [
      "Vadodara",
      "Savli",
      "Padra",
      "Karjan",
      "Dabhoi",
      "Waghodia",
      "Sankheda",
    ],
    Rajkot: [
      "Rajkot",
      "Gondal",
      "Jasdan",
      "Jetpur",
      "Dhoraji",
      "Kotda Sangani",
      "Lodhika",
      "Paddhari",
    ],
  },

  Karnataka: {
    Bengaluru: [
      "Bengaluru North",
      "Bengaluru South",
      "Bengaluru East",
      "Anekal",
      "Devanahalli",
      "Doddaballapura",
      "Nelamangala",
    ],
    Mysuru: [
      "Mysuru",
      "Hunsur",
      "Nanjangud",
      "H.D. Kote",
      "Periyapatna",
      "T. Narasipura",
    ],
    Mangaluru: [
      "Mangaluru",
      "Bantwal",
      "Belthangady",
      "Moodbidri",
      "Puttur",
      "Sullia",
    ],
  },

  "Tamil Nadu": {
    Chennai: [
      "Chennai",
      "Ambattur",
      "Madhavaram",
      "Sholinganallur",
      "Alandur",
      "Perambur",
    ],
    Coimbatore: [
      "Coimbatore North",
      "Coimbatore South",
      "Pollachi",
      "Mettupalayam",
      "Sulur",
      "Annur",
    ],
    Madurai: [
      "Madurai North",
      "Madurai South",
      "Melur",
      "Thirumangalam",
      "Usilampatti",
      "Vadipatti",
    ],
  },

  Delhi: {
    "New Delhi": [
      "New Delhi",
    ],
    "North Delhi": [
      "Model Town",
      "Narela",
      "Civil Lines",
      "Alipur",
    ],
    "South Delhi": [
      "Saket",
      "Mehrauli",
      "Hauz Khas",
      "Defence Colony",
    ],
  },

  Rajasthan: {
    Jaipur: [
      "Jaipur",
      "Amber",
      "Chomu",
      "Phagi",
      "Sanganer",
      "Shahpura",
    ],
    Jodhpur: [
      "Jodhpur",
      "Bilara",
      "Bhopalgarh",
      "Osian",
      "Shergarh",
      "Luni",
    ],
    Udaipur: [
      "Girwa",
      "Gogunda",
      "Jhadol",
      "Kherwara",
      "Kotra",
      "Mavli",
      "Salumbar",
    ],
  },

  "Uttar Pradesh": {
    Lucknow: [
      "Lucknow",
      "Malihabad",
      "Mohan",
      "Bakshi Ka Talab",
      "Mohanlalganj",
      "Sarojini Nagar",
    ],
    Agra: [
      "Agra",
      "Etmadpur",
      "Kheragarh",
      "Fatehabad",
      "Bah",
      "Kiraoli",
    ],
    Varanasi: [
      "Varanasi",
      "Pindra",
      "Raja Talab",
      "Sevapuri",
    ],
  },

  WestBengal: {
    Kolkata: [
      "Kolkata",
      "Alipore",
      "Ballygunge",
      "Behala",
      "Jadavpur",
      "Salt Lake",
    ],
    "North 24 Parganas": [
      "Barasat",
      "Barrackpore",
      "Basirhat",
      "Bongaon",
      "Habra",
    ],
  },

  Telangana: {
    Hyderabad: [
      "Hyderabad",
      "Amberpet",
      "Bahadurpura",
      "Charminar",
      "Khairatabad",
      "Secunderabad",
      "Serilingampally",
    ],
    Warangal: [
      "Warangal",
      "Hanamkonda",
      "Parkal",
      "Narsampet",
      "Wardhannapet",
    ],
  },

  Kerala: {
    Ernakulam: [
      "Aluva",
      "Kanayannur",
      "Kochi",
      "Kothamangalam",
      "Kunnathunad",
      "Muvattupuzha",
      "Paravur",
    ],
    Thiruvananthapuram: [
      "Nedumangad",
      "Neyyattinkara",
      "Thiruvananthapuram",
      "Chirayinkeezhu",
    ],
  },

  "Madhya Pradesh": {
    Bhopal: [
      "Berasia",
      "Bhopal",
      "Phanda",
    ],
    Indore: [
      "Depalpur",
      "Indore",
      "Mhow",
      "Sanwer",
    ],
  },

  Bihar: {
    Patna: [
      "Patna",
      "Barh",
      "Bihta",
      "Danapur",
      "Masaurhi",
      "Paliganj",
      "Phulwari",
    ],
    Gaya: [
      "Gaya",
      "Belaganj",
      "Bodh Gaya",
      "Gurua",
      "Manpur",
      "Tekari",
    ],
  },

  Punjab: {
    Ludhiana: [
      "Ludhiana East",
      "Ludhiana West",
      "Jagraon",
      "Khanna",
      "Payal",
      "Raikot",
      "Samrala",
    ],
    Amritsar: [
      "Amritsar-I",
      "Amritsar-II",
      "Ajnala",
      "Baba Bakala",
    ],
  },

  Haryana: {
    Gurgaon: [
      "Gurgaon",
      "Pataudi",
      "Sohna",
      "Farrukhnagar",
    ],
    Faridabad: [
      "Faridabad",
      "Ballabgarh",
    ],
  },
};

const states = Object.keys(locationData);

function AddressFields({ prefix, values, onChange, disabled = false }) {
  const districts = values.state
    ? Object.keys(locationData[values.state] || {})
    : [];

  const talukas =
    values.state && values.district
      ? locationData[values.state]?.[values.district] || []
      : [];

  return (
    <div className="booking-grid">

      <label>
        State *
        <select
          name={`${prefix}State`}
          value={values.state}
          onChange={(event) => onChange("state", event.target.value)}
          disabled={disabled}
          required
        >
          <option value="">Select state</option>

          {states.map((state) => (
            <option key={state} value={state}>
              {state === "WestBengal" ? "West Bengal" : state}
            </option>
          ))}
        </select>
      </label>

      <label>
        District *
        <select
          name={`${prefix}District`}
          value={values.district}
          onChange={(event) => onChange("district", event.target.value)}
          disabled={disabled || !values.state}
          required
        >
          <option value="">
            {values.state ? "Select district" : "Select state first"}
          </option>

          {districts.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </label>

      <label>
        Taluka *
        <select
          name={`${prefix}Taluka`}
          value={values.taluka}
          onChange={(event) => onChange("taluka", event.target.value)}
          disabled={disabled || !values.district}
          required
        >
          <option value="">
            {values.district ? "Select taluka" : "Select district first"}
          </option>

          {talukas.map((taluka) => (
            <option key={taluka} value={taluka}>
              {taluka}
            </option>
          ))}
        </select>
      </label>

      <label>
        City / Village *
        <input
          type="text"
          name={`${prefix}City`}
          placeholder="Enter city or village"
          value={values.city}
          onChange={(event) => onChange("city", event.target.value)}
          disabled={disabled}
          required
        />
      </label>

      <label>
        Local Area *
        <input
          type="text"
          name={`${prefix}LocalArea`}
          placeholder="Enter local area"
          value={values.localArea}
          onChange={(event) => onChange("localArea", event.target.value)}
          disabled={disabled}
          required
        />
      </label>

      <label>
        PIN Code *
        <input
          type="text"
          name={`${prefix}Pincode`}
          placeholder="6-digit PIN code"
          value={values.pincode}
          onChange={(event) =>
            onChange("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          disabled={disabled}
          required
        />
      </label>

      <label className="full-width">
        Full Address *
        <textarea
          name={`${prefix}Address`}
          rows="4"
          placeholder="House / Flat No., Building, Street, Landmark..."
          value={values.address}
          onChange={(event) => onChange("address", event.target.value)}
          disabled={disabled}
          required
        />
      </label>
    </div>
  );
}

function BookingForm({ car, type }) {
  const emptyAddress = {
    state: "",
    district: "",
    taluka: "",
    city: "",
    localArea: "",
    pincode: "",
    address: "",
  };

  const [currentAddress, setCurrentAddress] = useState(emptyAddress);
  const [permanentAddress, setPermanentAddress] = useState(emptyAddress);
  const [sameAddress, setSameAddress] = useState(false);
  const [photoName, setPhotoName] = useState("");
  const [signatureName, setSignatureName] = useState("");

  const updateCurrentAddress = (field, value) => {
    setCurrentAddress((previous) => {
      const updated = { ...previous, [field]: value };

      if (field === "state") {
        updated.district = "";
        updated.taluka = "";
      }

      if (field === "district") {
        updated.taluka = "";
      }

      return updated;
    });
  };

  const updatePermanentAddress = (field, value) => {
    setPermanentAddress((previous) => {
      const updated = { ...previous, [field]: value };

      if (field === "state") {
        updated.district = "";
        updated.taluka = "";
      }

      if (field === "district") {
        updated.taluka = "";
      }

      return updated;
    });
  };

  const handleSameAddress = (event) => {
    const checked = event.target.checked;
    setSameAddress(checked);

    if (checked) {
      setPermanentAddress({ ...currentAddress });
    } else {
      setPermanentAddress({ ...emptyAddress });
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setPhotoName(file.name);
    }
  };

  const handleSignatureChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSignatureName(file.name);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const bookingData = {
      carId: car.id,
      carName: car.name,
      bookingType: type,
      fullName: formData.get("fullName"),
      dateOfBirth: formData.get("dateOfBirth"),
      email: formData.get("email"),
      mobile: formData.get("mobile"),
      alternateMobile: formData.get("alternateMobile"),
      governmentIdType: formData.get("governmentIdType"),
      governmentIdNumber: formData.get("governmentIdNumber"),
      currentAddress,
      permanentAddress: sameAddress ? currentAddress : permanentAddress,
      contactTime: formData.get("contactTime"),
      notes: formData.get("notes"),
      createdAt: new Date().toISOString(),
    };

    if (type === "rent") {
      bookingData.startDate = formData.get("startDate");
      bookingData.days = formData.get("days");
    }

    localStorage.setItem(
      "latestBooking",
      JSON.stringify(bookingData)
    );

    alert(`Booking request submitted for ${car.name}.`);
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>

      {/* PERSONAL DETAILS */}
      <section className="booking-section">
        <div className="booking-section-header">
          <span>01</span>
          <div>
            <h2>Personal Details</h2>
            <p>Enter your basic contact information.</p>
          </div>
        </div>

        <div className="booking-grid">
          <label>
            Full Name *
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              required
            />
          </label>

          <label>
            Date of Birth *
            <input
              type="date"
              name="dateOfBirth"
              required
            />
          </label>

          <label>
            Email Address *
            <input
              type="email"
              name="email"
              placeholder="example@email.com"
              required
            />
          </label>

          <label>
            Primary Mobile Number *
            <input
              type="tel"
              name="mobile"
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
            />
          </label>

          <label>
            Alternate Mobile Number
            <input
              type="tel"
              name="alternateMobile"
              placeholder="Optional alternate number"
              pattern="[0-9]{10}"
              maxLength="10"
            />
          </label>
        </div>
      </section>

      {/* IDENTITY */}
      <section className="booking-section">
        <div className="booking-section-header">
          <span>02</span>
          <div>
            <h2>Identity Verification</h2>
            <p>Provide your identity and verification documents.</p>
          </div>
        </div>

        <div className="booking-grid">
          <label>
            Government ID Type *
            <select name="governmentIdType" required>
              <option value="">Select ID type</option>
              <option value="aadhaar">Aadhaar Card</option>
              <option value="pan">PAN Card</option>
              <option value="driving-license">Driving Licence</option>
              <option value="passport">Passport</option>
              <option value="voter-id">Voter ID</option>
            </select>
          </label>

          <label>
            Government ID Number *
            <input
              type="text"
              name="governmentIdNumber"
              placeholder="Enter ID number"
              required
            />
          </label>

          <label>
            Profile Photo *
            <input
              type="file"
              name="profilePhoto"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              required
            />

            {photoName && (
              <small className="file-name">
                ✓ {photoName}
              </small>
            )}
          </label>

          <label>
            Signature Photo *
            <input
              type="file"
              name="signaturePhoto"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleSignatureChange}
              required
            />

            {signatureName && (
              <small className="file-name">
                ✓ {signatureName}
              </small>
            )}
          </label>
        </div>
      </section>

      {/* CURRENT ADDRESS */}
      <section className="booking-section">
        <div className="booking-section-header">
          <span>03</span>
          <div>
            <h2>Current Address</h2>
            <p>Select your location step-by-step.</p>
          </div>
        </div>

        <AddressFields
          prefix="current"
          values={currentAddress}
          onChange={updateCurrentAddress}
        />
      </section>

      {/* PERMANENT ADDRESS */}
      <section className="booking-section">
        <div className="booking-section-header">
          <span>04</span>
          <div>
            <h2>Permanent Address</h2>
            <p>Enter your permanent residential address.</p>
          </div>
        </div>

        <label className="same-address">
          <input
            type="checkbox"
            checked={sameAddress}
            onChange={handleSameAddress}
          />
          <span>
            My permanent address is the same as my current address
          </span>
        </label>

        {!sameAddress && (
          <AddressFields
            prefix="permanent"
            values={permanentAddress}
            onChange={updatePermanentAddress}
          />
        )}
      </section>

      {/* BOOKING DETAILS */}
      <section className="booking-section">
        <div className="booking-section-header">
          <span>05</span>
          <div>
            <h2>Booking Details</h2>
            <p>Provide your preferred booking information.</p>
          </div>
        </div>

        <div className="booking-grid">
          {type === "rent" && (
            <>
              <label>
                Rental Start Date *
                <input
                  type="date"
                  name="startDate"
                  required
                />
              </label>

              <label>
                Rental Duration (Days) *
                <input
                  type="number"
                  name="days"
                  min="1"
                  defaultValue="1"
                  required
                />
              </label>
            </>
          )}

          <label>
            Preferred Contact Time
            <select name="contactTime">
              <option value="">Select preferred time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </label>

          <label className="full-width">
            Additional Notes
            <textarea
              name="notes"
              rows="4"
              placeholder="Any additional requirements..."
            />
          </label>
        </div>
      </section>

      {/* CONFIRMATION */}
      <section className="booking-section booking-confirmation">
        <div className="booking-section-header">
          <span>06</span>
          <div>
            <h2>Confirmation</h2>
            <p>Confirm your information before continuing.</p>
          </div>
        </div>

        <label className="agreement">
          <input type="checkbox" required />
          <span>
            I confirm that the information provided is accurate.
          </span>
        </label>

        <label className="agreement">
          <input type="checkbox" required />
          <span>
            I agree to the booking terms and privacy policy.
          </span>
        </label>

        <button className="booking-submit" type="submit">
          Continue with {car.name}
        </button>
      </section>

    </form>
  );
}

export default BookingForm;