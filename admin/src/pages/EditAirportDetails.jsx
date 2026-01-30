import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import api from "../api/Api";
import Swal from "sweetalert2";

export default function EditAirportDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [form, setForm] = useState({
    country_id: "",
    city_id: "",
    airport_name: "",
    airport_code: "",
    contactno: "",
    address: "",
    pincode: ""
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      Swal.fire({ title: "Loading...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const [airportRes, countryRes] = await Promise.all([
        api.get(`/getairport/${id}`),
        api.get("/getcountryname")
      ]);

      const airport = airportRes.data.data;
      setForm(airport);
      setCountries(countryRes.data.data);

      const cityRes = await api.get("/getcities", { params: { country_id: airport.country_id } });
      setCities(cityRes.data.data);

      Swal.close();
    } catch (err) {
      Swal.fire("Error", "Failed to load airport", "error");
    }
  };

  useEffect(() => {
    if (!form.country_id) return;

    api.get("/getcities", { params: { country_id: form.country_id } })
      .then(res => setCities(res.data.data));
  }, [form.country_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      Swal.fire({ title: "Updating...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      await api.put(`/updateairport/${id}`, form);

      Swal.fire({
        icon: "success",
        title: "Airport Detials Updated",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate("/master/Airportdetails");
      });

    } catch (err) {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <div className="container-fluid" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <div className="card border-0 shadow-sm mb-0">
        <div className="card-body d-flex justify-content-between align-items-center"
          style={{ background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)", color: "#fff", borderRadius: "12px" }}>
          <h4 className="mb-0 fw-bold">Edit Airport</h4>
          <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/master/Airportdetails")}>
            <ArrowLeft size={16} className="me-1" /> Back
          </button>
        </div>
      </div>

      {/* Form (Same UI as AddAirportDetails) */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Country *</label>
              <div className="col-sm-5">
                <select className="form-select" name="country_id"
                  value={form.country_id}
                  onChange={(e) => setForm({ ...form, country_id: e.target.value, city_id: "" })}>
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">City *</label>
              <div className="col-sm-5">
                <select className="form-select" name="city_id" value={form.city_id}
                  onChange={handleChange} disabled={!cities.length}>
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c.city_id} value={c.city_id}>{c.city_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Airport Name *</label>
              <div className="col-sm-5">
                <input type="text" name="airport_name" className="form-control"
                  value={form.airport_name} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Airport Code *</label>
              <div className="col-sm-5">
                <input type="text" name="airport_code" className="form-control text-uppercase"
                  value={form.airport_code} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Contact No</label>
              <div className="col-sm-5">
                <input type="text" name="contactno" className="form-control"
                  value={form.contactno} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-3">
              <label className="col-sm-3 col-form-label fw-semibold">Address</label>
              <div className="col-sm-5">
                <input type="text" name="address" className="form-control"
                  value={form.address} onChange={handleChange} />
              </div>
            </div>

            <div className="row mb-4">
              <label className="col-sm-3 col-form-label fw-semibold">Pincode</label>
              <div className="col-sm-5">
                <input type="text" name="pincode" className="form-control"
                  value={form.pincode} onChange={handleChange} />
              </div>
            </div>

            <div className="row">
              <div className="col-sm-8 offset-sm-3">
                <button type="submit" className="btn btn-success me-2">
                  <Save size={16} className="me-1" /> Update
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/master/Airportdetails")}>
                  <RotateCcw size={16} className="me-1" /> Cancel
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
