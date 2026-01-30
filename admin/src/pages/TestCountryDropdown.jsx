import { useEffect, useState } from "react";
import api from "../api/Api";

export default function TestCountryDropdown() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    const res = await api.get("/countries");
    setCountries(res.data.data || []);
  };

  return (
    <div className="p-3">
      <h6>Country List</h6>
      <select className="form-select form-select-sm">
        <option value="0">-- All --</option>
        {countries.map(c => (
          <option key={c.country_id} value={c.country_id}>
            {c.country_name}
          </option>
        ))}
      </select>
    </div>
  );
}
