import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import api from "../api/Api";
import Swal from "sweetalert2";


export default function EditCountry() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    country_name: "",
    country_code: "",
    country_image: null
  });

  const [preview, setPreview] = useState(null); // for live image preview
  const [oldImage, setOldImage] = useState(null);

  useEffect(() => {
    loadCountry();
  }, []);

  const loadCountry = async () => {
    const res = await api.get(`/country/${id}`);
    const data = res.data.data;

    setForm({
      country_name: data.country_name,
      country_code: data.country_code,
      country_image: null
    });

    setOldImage(data.country_image);
    setPreview(`${process.env.REACT_APP_API_URL.replace("/api/v1", "")}/${data.country_image}`);
  };

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];
      setForm({ ...form, country_image: file });
      setPreview(URL.createObjectURL(file)); // instant preview
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("country_name", form.country_name);
    formData.append("country_code", form.country_code);

    if (form.country_image) {
      formData.append("country_image", form.country_image);
    }

    try {
      await api.put(`/updatecountry/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Country details updated successfully",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate("/master/manage-country");
      });

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Unable to update country"
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
          <h4 className="mb-0 fw-bold">Edit Country</h4>
          <button
            className="btn btn-warning btn-sm fw-semibold"
            onClick={() => navigate("/master/manage-country")}
          >
            <ArrowLeft size={16} className="me-1" /> Back to Manage Country
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
                  maxLength="3"
                  required
                />
              </div>
            </div>

            {/* Image Preview */}
            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">
                Country Image
              </label>
              <div className="col-sm-5">
                {preview && (
                  <div className="mb-2">
                    <img
                      src={preview}
                      alt="Preview"
                      height="50"
                      className="rounded border"
                    />
                  </div>
                )}
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleChange}
                />
                <small className="text-muted">Select new image to replace existing one</small>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-8 offset-sm-3">
                <button type="submit" className="btn btn-success me-2">
                  <Save size={16} className="me-1" /> Update
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => loadCountry()}
                >
                  <RotateCcw size={16} className="me-1" /> Reset
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
