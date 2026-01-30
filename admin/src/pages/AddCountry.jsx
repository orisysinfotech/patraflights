import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import api from "../api/Api";
import Swal from "sweetalert2";


export default function AddCountry() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    country_name: "",
    country_code: "",
    country_image: null
  });

  const handleChange = (e) => {
    if (e.target.type === "file") {
      setForm({ ...form, country_image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.country_name || !form.country_code || !form.country_image) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "All fields including image are required"
    });
    return;
  }

  const formData = new FormData();
  formData.append("country_name", form.country_name);
  formData.append("country_code", form.country_code);
  formData.append("country_image", form.country_image);

  try {
    await api.post("/addcountry", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Country added successfully",
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      navigate("/master/manage-country");
    });

  } catch (err) {
    console.log(err.response?.data || err.message);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.message || "Failed to save country"
    });
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
          <h4 className="mb-0 fw-bold">Add Country</h4>
          <button
            className="btn btn-warning btn-sm fw-semibold"
            onClick={() => navigate("/master/manage-country")}
          >
            <ArrowLeft size={16} className="me-1" /> Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">

          <form onSubmit={handleSubmit} encType="multipart/form-data">

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">
                Country Name <span className="text-danger">*</span>
              </label>
              <div className="col-sm-5">
                <input
                  type="text"
                  name="country_name"
                  value={form.country_name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="India"
                  required
                />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">
                Country Code <span className="text-danger">*</span>
              </label>
              <div className="col-sm-5">
                <input
                  type="text"
                  name="country_code"
                  value={form.country_code}
                  onChange={handleChange}
                  className="form-control text-uppercase"
                  placeholder="IN"
                  maxLength="3"
                  required
                />
              </div>
            </div>

            {/* Country Image (New Field from PHP) */}
            <div className="row mb-4">
              <label className="col-sm-3 col-form-label fw-semibold">
                Country Image <span className="text-danger">*</span>
              </label>
              <div className="col-sm-5">
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />
                <small className="text-muted">Max size: 1MB, PNG/JPG/GIF</small>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-8 offset-sm-3">
                <button type="submit" className="btn btn-success me-2">
                  <Save size={16} className="me-1" /> Save
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setForm({ country_name: "", country_code: "", country_image: null })}
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
