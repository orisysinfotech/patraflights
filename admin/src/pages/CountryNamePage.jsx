import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import api from "../api/Api.js";
import { useNavigate } from "react-router-dom";


export default function ManageCountry() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);



 

  const recordsPerPage = 20;

  useEffect(() => {
    fetchCountry();
  }, []);
 const navigate = useNavigate();
  const fetchCountry = async () => {
    try {
      const res = await api.get("/getcountry");
      const records = res.data.data || [];
      setCountries(records);
    } catch (err) {
      console.error("Failed to load Country records.", err);
    }
  };

  // 🔍 Search filter
  const filtered = countries.filter(c =>
    c.country_name?.toLowerCase().includes(search.toLowerCase())
  );

  // 📌 Pagination calculations
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedData = filtered.slice(startIndex, endIndex);

  const deleteCountry = (cntry_id) => {
    if (window.confirm("Are you sure?")) {
      setCountries(countries.filter(c => c.cntry_id !== cntry_id));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <div style={{ padding: 25 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
          <h3>Manage Country</h3>
          <button
  style={{
    background: "#f97316",
    color: "#fff",
    padding: "8px 16px",
    border: 0,
    borderRadius: 5
  }}
  onClick={() => navigate("/add-country")}
>
  Add
</button>

        </div>

        <div style={{ background: "#fff", borderRadius: 10, padding: 15 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span>Show 20 entries</span>
            <input
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // reset page on search
              }}
              style={{ padding: 6, border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>

          <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead style={{ background: "#06b6d4", color: "#fff" }}>
              <tr>
                <th>Sl No</th>
                <th>Country Name</th>
                <th>Code</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="4" align="center">No data found</td>
                </tr>
              ) : (
                paginatedData.map((c, i) => (
                  <tr key={c.cntry_id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td>{startIndex + i + 1}</td>
                    <td>{c.country_name}</td>
                    <td>{c.country_code}</td>
                    <td>
                      <button style={{ marginRight: 8 }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => deleteCountry(c.cntry_id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 🔢 Pagination UI */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 15
            }}
          >
            <span>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filtered.length)} of {filtered.length} entries
            </span>

            <div>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    margin: "0 5px",
                    fontWeight: currentPage === i + 1 ? "bold" : "normal"
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
