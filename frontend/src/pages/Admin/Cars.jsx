import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CarFront,
  CheckCircle,
  Clock3,
  CircleDollarSign,
} from "lucide-react";
import "./Cars.css";

const initialCars = [
  {
    id: 1,
    name: "BMW 3 Series",
    year: 2023,
    price: "₹52,00,000",
    type: "Buy",
    status: "Available",
  },
  {
    id: 2,
    name: "Mercedes-Benz C-Class",
    year: 2022,
    price: "₹58,00,000",
    type: "Buy",
    status: "Sold",
  },
  {
    id: 3,
    name: "Toyota Fortuner",
    year: 2024,
    price: "₹3,500/day",
    type: "Rent",
    status: "Rented",
  },
  {
    id: 4,
    name: "Hyundai Creta",
    year: 2023,
    price: "₹2,200/day",
    type: "Rent",
    status: "Available",
  },
  {
    id: 5,
    name: "Tata Harrier",
    year: 2022,
    price: "₹24,00,000",
    type: "Buy",
    status: "Available",
  },
];

function Cars() {
  const [cars, setCars] = useState(initialCars);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesSearch = car.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || car.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [cars, search, statusFilter]);

  const availableCars = cars.filter(
    (car) => car.status === "Available"
  ).length;

  const rentedCars = cars.filter(
    (car) => car.status === "Rented"
  ).length;

  const soldCars = cars.filter(
    (car) => car.status === "Sold"
  ).length;

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this car?"
    );

    if (!confirmed) return;

    setCars((currentCars) =>
      currentCars.filter((car) => car.id !== id)
    );
  };

  const handleEdit = (car) => {
    window.alert(`Edit functionality for ${car.name} will be connected later.`);
  };

  const handleAddCar = () => {
    window.alert("Add Car form will be connected next.");
  };

  return (
    <div className="admin-cars-page">

      {/* HEADER */}

      <div className="admin-cars-header">
        <div>
          <span className="admin-cars-label">ADMIN PANEL</span>

          <h1>Car Management</h1>

          <p>
            Manage all cars listed for buying and renting.
          </p>
        </div>

        <button
          className="admin-add-car-btn"
          onClick={handleAddCar}
        >
          <Plus size={19} />
          Add Car
        </button>
      </div>


      {/* STATISTICS */}

      <div className="admin-cars-stats">

        <div className="admin-car-stat-card">
          <div className="admin-stat-icon">
            <CarFront size={22} />
          </div>

          <div>
            <span>Total Cars</span>
            <strong>{cars.length}</strong>
          </div>
        </div>


        <div className="admin-car-stat-card">
          <div className="admin-stat-icon">
            <CheckCircle size={22} />
          </div>

          <div>
            <span>Available</span>
            <strong>{availableCars}</strong>
          </div>
        </div>


        <div className="admin-car-stat-card">
          <div className="admin-stat-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <span>Rented</span>
            <strong>{rentedCars}</strong>
          </div>
        </div>


        <div className="admin-car-stat-card">
          <div className="admin-stat-icon">
            <CircleDollarSign size={22} />
          </div>

          <div>
            <span>Sold</span>
            <strong>{soldCars}</strong>
          </div>
        </div>

      </div>


      {/* FILTER BAR */}

      <div className="admin-cars-toolbar">

        <div className="admin-car-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search cars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>


        <select
          className="admin-car-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Rented">Rented</option>
          <option value="Sold">Sold</option>
        </select>

      </div>


      {/* CAR TABLE */}

      <div className="admin-cars-table-card">

        <div className="admin-table-heading">
          <div>
            <h2>All Cars</h2>
            <p>{filteredCars.length} cars found</p>
          </div>
        </div>


        <div className="admin-cars-table-wrapper">

          <table className="admin-cars-table">

            <thead>
              <tr>
                <th>Car</th>
                <th>Year</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>


            <tbody>

              {filteredCars.length > 0 ? (
                filteredCars.map((car) => (

                  <tr key={car.id}>

                    <td>
                      <div className="admin-car-name">
                        <div className="admin-car-image-placeholder">
                          <CarFront size={22} />
                        </div>

                        <div>
                          <strong>{car.name}</strong>
                          <span>ID #{car.id}</span>
                        </div>
                      </div>
                    </td>


                    <td>{car.year}</td>


                    <td>
                      <span className="admin-car-type">
                        {car.type}
                      </span>
                    </td>


                    <td>
                      <strong className="admin-car-price">
                        {car.price}
                      </strong>
                    </td>


                    <td>
                      <span
                        className={`admin-car-status ${car.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {car.status}
                      </span>
                    </td>


                    <td>

                      <div className="admin-car-actions">

                        <button
                          className="admin-action-edit"
                          onClick={() => handleEdit(car)}
                          title="Edit car"
                        >
                          <Pencil size={17} />
                        </button>


                        <button
                          className="admin-action-delete"
                          onClick={() => handleDelete(car.id)}
                          title="Delete car"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (

                <tr>
                  <td
                    colSpan="6"
                    className="admin-no-cars"
                  >
                    No cars found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Cars;