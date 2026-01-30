import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import api from "../api/Api";

export default function EditAirline() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    airlines_name: "",
    airlines_code2: "",
    airlines_fare_rule: "",
    airlines_popular: 0,
    airlines_url: "",
    airlines_sort: "",
    airlines_image: null
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadAirline();
  }, []);

  const loadAirline = async () => {
    const res = await api.get(`/airlines/${id}`);
    const d = res.data.data;

    setForm({
      airlines_name: d.airlines_name,
      airlines_code2: d.airlines_code2,
      airlines_fare_rule: d.airlines_fare_rule,
      airlines_popular: d.airlines_popular,
      airlines_url: d.airlines_url || "",
      airlines_sort: d.airlines_sort || "",
      airlines_image: null
    });

    if (d.airlines_image) {
      setPreview(`${process.env.REACT_APP_API_URL.replace("/api/v1","")}/template/img/flight/${d.airlines_image}`);
    }
  };

  const handleChange = (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];
      setForm({ ...form, airlines_image: file });
      setPreview(URL.createObjectURL(file));
    } else if (e.target.type === "checkbox") {
      setForm({ ...form, airlines_popular: e.target.checked ? 1 : 0 });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach(k => fd.append(k, form[k]));

    try {
      await api.put(`/update-airline/${id}`, fd);
      Swal.fire("Updated!", "Airline updated successfully", "success");
      navigate("/master/manage-airline-details");
    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <div className="container-fluid p-2" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center"
          style={{ background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", color: "#fff", borderRadius: "12px" }}>
          <h4 className="fw-bold mb-0">Edit Airline</h4>
          <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/master/manage-airline-details")}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div className="card shadow-sm mt-2">
        <div className="card-body">

          <form onSubmit={handleSubmit} encType="multipart/form-data">

            <div className="row mb-2">
              <label className="col-sm-3">Airline Name</label>
              <div className="col-sm-5">
                <input name="airlines_name" value={form.airlines_name} onChange={handleChange} className="form-control" />
              </div>
            </div>

            <div className="row mb-2">
              <label className="col-sm-3">Airline Code</label>
              <div className="col-sm-5">
                <input name="airlines_code2" value={form.airlines_code2} onChange={handleChange} className="form-control text-uppercase" />
              </div>
            </div>

            <div className="row mb-2">
              <label className="col-sm-3">Popular</label>
              <div className="col-sm-2">
                <input type="checkbox" checked={form.airlines_popular == 1} onChange={handleChange} />
              </div>
            </div>

            {form.airlines_popular == 1 && (
              <>
                <div className="row mb-2">
                  <label className="col-sm-3">Airline Website URL</label>
                  <div className="col-sm-5">
                    <input name="airlines_url" value={form.airlines_url} onChange={handleChange} className="form-control" />
                  </div>
                </div>

                <div className="row mb-2">
                  <label className="col-sm-3">Website Footer Display Order</label>
                  <div className="col-sm-2">
                    <input name="airlines_sort" value={form.airlines_sort} onChange={handleChange} className="form-control" />
                  </div>
                </div>
              </>
            )}

            <div className="row mb-2">
              <label className="col-sm-3">Logo</label>
              <div className="col-sm-5">
                {preview && <img src={preview} height="50" className="mb-2 border rounded" />}
                <input type="file" className="form-control" onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3">Fare Rule</label>
              <div className="col-sm-5">
                <textarea name="airlines_fare_rule" value={form.airlines_fare_rule} onChange={handleChange} className="form-control" rows="5" />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-8 offset-sm-3">
                <button className="btn btn-success">
                  <Save size={16} /> Update
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
