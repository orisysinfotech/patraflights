import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import api from "../api/Api";
import Swal from "sweetalert2";

export default function AddAirline() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    airlines_name: "",
    airlines_code2: "",
    airlines_popular: false,
    airlines_url: "",
    airlines_sort: "",
    airlines_image: null,
    airlines_fare_rule: ""
  });

  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } 
    else if (type === "file") {
      setForm({ ...form, airlines_image: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } 
    else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.airlines_name || !form.airlines_code2 || !form.airlines_image || !form.airlines_fare_rule) {
      Swal.fire("Validation Error", "All mandatory fields are required", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("airlines_name", form.airlines_name);
    formData.append("airlines_code2", form.airlines_code2);
    formData.append("airlines_popular", form.airlines_popular ? 1 : 0);
    formData.append("airlines_url", form.airlines_url);
    formData.append("airlines_sort", form.airlines_sort);
    formData.append("airlines_fare_rule", form.airlines_fare_rule);
    formData.append("airlines_image", form.airlines_image);

    try {
      Swal.fire({ title: "Saving...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      await api.post("/add-airline", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire({
        icon: "success",
        title: "Airline Added",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate("/master/manage-airline-details");
      });

    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to save airline", "error");
    }
  };

  return (
    <div className="container-fluid" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <div className="card border-0 shadow-sm mb-0">
        <div className="card-body d-flex justify-content-between align-items-center"
          style={{ background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)", color: "#fff", borderRadius: "12px" }}>
          <h4 className="mb-0 fw-bold">Add Airline</h4>
          <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/master/manage-airline-details")}>
            <ArrowLeft size={16} className="me-1" /> Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} encType="multipart/form-data">

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Airline Name *</label>
              <div className="col-sm-5">
                <input type="text" name="airlines_name" className="form-control" onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Airline Code *</label>
              <div className="col-sm-5">
                <input type="text" name="airlines_code2" className="form-control text-uppercase" onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Popular Airline</label>
              <div className="col-sm-3">
                <input type="checkbox" name="airlines_popular" onChange={handleChange} /> Yes
              </div>
            </div>

            {form.airlines_popular && (
              <>
                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label fw-semibold">Airline Website URL</label>
                  <div className="col-sm-5">
                    <input type="text" name="airlines_url" className="form-control" onChange={handleChange} />
                  </div>
                </div>

                <div className="row mb-3">
                  <label className="col-sm-3 col-form-label fw-semibold">Footer Display Order</label>
                  <div className="col-sm-3">
                    <input type="text" name="airlines_sort" className="form-control" onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Airline Logo *</label>
              <div className="col-sm-5">
                <input type="file" className="form-control" accept="image/*" onChange={handleChange} />
                {preview && <img src={preview} alt="preview" height="50" className="mt-2 border rounded" />}
              </div>
            </div>

            <div className="row mb-4">
              <label className="col-sm-3 col-form-label fw-semibold">Fare Rule *</label>
              <div className="col-sm-5">
                <textarea name="airlines_fare_rule" className="form-control" rows="5" onChange={handleChange}></textarea>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-8 offset-sm-3">
                <button type="submit" className="btn btn-success me-2">
                  <Save size={16} className="me-1" /> Submit
                </button>
                <button type="reset" className="btn btn-secondary" onClick={() => window.location.reload()}>
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
