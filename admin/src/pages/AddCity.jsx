import { useEffect, useState } from "react";
import { Save, RotateCcw, ArrowLeft } from "lucide-react";
import api from "../api/Api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


export default function AddCity() {

  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);

  const [form, setForm] = useState({
    country_id: "",
    city_name: "",
    city_code: ""
  });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    const res = await api.get("/getcountry");
    setCountries(res.data.data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.country_id || !form.city_name || !form.city_code) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "All fields are required"
      });
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await api.post("/addcity", form);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "City added successfully",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate("/master/manage-city");
      });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Failed to add city"
      });
    }
  };


  return (
    <div className="container-fluid p-1" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <div className="card border-0 shadow-sm mb-0">
        <div
          className="card-body d-flex justify-content-between align-items-center"
          style={{
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            color: "#fff",
            borderRadius: "12px"
          }}
        >
          <h4 className="mb-0 fw-bold">Add City</h4>
          <button
            className="btn btn-warning btn-sm fw-semibold"
            onClick={() => navigate("/master/manage-city")}
          >
            <ArrowLeft size={16} className="me-1" /> Back
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <form onSubmit={handleSubmit} autoComplete="off">

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">
                Country <span className="text-danger">*</span>
              </label>
              <div className="col-sm-5">
                <select
                  className="form-select"
                  name="country_id"
                  value={form.country_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Country --</option>
                  {countries.map(c => (
                    <option key={c.country_id} value={c.country_id}>
                      {c.country_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">
                City Name <span className="text-danger">*</span>
              </label>
              <div className="col-sm-5">
                <input
                  type="text"
                  className="form-control"
                  name="city_name"
                  maxLength="50"
                  value={form.city_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-4">
              <label className="col-sm-3 col-form-label fw-semibold">
                City Code <span className="text-danger">*</span>
              </label>
              <div className="col-sm-5">
                <input
                  type="text"
                  className="form-control text-uppercase"
                  name="city_code"
                  maxLength="3"
                  value={form.city_code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-8 offset-sm-3">
                <button type="submit" className="btn btn-success me-2">
                  <Save size={16} className="me-1" /> Submit
                </button>

                <button
                  type="reset"
                  className="btn btn-secondary"
                  onClick={() => setForm({ country_id: "", city_name: "", city_code: "" })}
                >
                  <RotateCcw size={16} className="me-1" /> Clear
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
