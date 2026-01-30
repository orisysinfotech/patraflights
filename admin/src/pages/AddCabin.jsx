import { useState } from "react";
import { Save, RotateCcw, ArrowLeft } from "lucide-react";
import api from "../api/Api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AddCabin() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    cabin_name: "",
    cabin_code: "",
    flight_price_hike: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.cabin_name || !form.cabin_code || !form.flight_price_hike) {
      Swal.fire("Validation Error", "All fields are mandatory", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await api.post("/cabins", form);

      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Cabin Type added successfully",
        timer: 1500,
        showConfirmButton: false
      });

      navigate("/master/manage-cabin");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to save cabin", "error");
    }
  };

  return (
    <div className="container-fluid p-2" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

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
          <h4 className="mb-0 fw-bold">Add Cabin Type</h4>
          <button
            className="btn btn-warning btn-sm fw-semibold"
            onClick={() => navigate("/master/manage-cabin")}
          >
            <ArrowLeft size={16} className="me-1" /> Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">

          <form onSubmit={handleSubmit} autoComplete="off">

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">
                Cabin Type Name <span className="text-danger">*</span>
              </label>
              <div className="col-sm-5">
                <input
                  type="text"
                  name="cabin_name"
                  className="form-control"
                  maxLength="50"
                  value={form.cabin_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">
                Cabin Type Code <span className="text-danger">*</span>
              </label>
              <div className="col-sm-3">
                <input
                  type="text"
                  name="cabin_code"
                  className="form-control"
                  maxLength="10"
                  value={form.cabin_code}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row mb-4">
              <label className="col-sm-3 col-form-label fw-semibold">
                % Increase in Flight Price <span className="text-danger">*</span>
              </label>
              <div className="col-sm-2">
                <input
                  type="number"
                  name="flight_price_hike"
                  className="form-control"
                  maxLength="3"
                  value={form.flight_price_hike}
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
                  onClick={() => setForm({ cabin_name: "", cabin_code: "", flight_price_hike: "" })}
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
