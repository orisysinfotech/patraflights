import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/Api";

export default function AddCountry() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    country_name: "",
    country_code: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/addcountry", form);
      alert(res.data.message);
      navigate("/master/manage-country");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add country");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h3>Add Country</h3>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 400,
          background: "#fff",
          padding: 20,
          borderRadius: 8
        }}
      >
        <div style={{ marginBottom: 15 }}>
          <label>Country Name</label>
          <input
            type="text"
            name="country_name"
            value={form.country_name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>Country Code</label>
          <input
            type="text"
            name="country_code"
            value={form.country_code}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          type="submit"
          style={{
            background: "#06b6d4",
            color: "#fff",
            padding: "8px 16px",
            border: 0,
            borderRadius: 5
          }}
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => navigate("/country")}
          style={{ marginLeft: 10 }}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
