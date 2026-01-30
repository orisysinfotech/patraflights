import { useEffect, useState } from "react";
import { Pencil, Trash2, Save, X, Plus, Download } from "lucide-react";
import api from "../api/Api";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";



export default function ManageCity() {

  const DEFAULT_COUNTRY_ID = 105;

  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const urlCountryId = query.get("country");

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [countryId, setCountryId] = useState(DEFAULT_COUNTRY_ID);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({ city_name: "", city_code: "", country_id: "" });

  const recordsPerPage = 10;
  const maxButtons = 10;

  useEffect(() => {
    Swal.fire({
      title: "Loading Cities...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    loadCountries().then(() => {
      const cid = urlCountryId ? urlCountryId : DEFAULT_COUNTRY_ID;
      setCountryId(cid);
      return loadCities(cid);
    }).finally(() => {
      Swal.close();
    });
  }, [urlCountryId]);


  const loadCountries = async () => {
    const res = await api.get("/getcountry");
    setCountries(res.data.data || []);
  };

  const loadCities = async (cid) => {
    const res = await api.get(`/cities?country_id=${cid}`);
    setCities(res.data.data || []);
    setCurrentPage(1);
  };

  const handleCountryChange = (e) => {
    const id = e.target.value;
    setCountryId(id);
    loadCities(id);
  };

  const filtered = cities.filter(c =>
    c.city_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + recordsPerPage);

  const startPage = Math.floor((currentPage - 1) / maxButtons) * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  const startEdit = (row) => {
    setEditingId(row.city_id);
    setEditRow({
      city_name: row.city_name,
      city_code: row.city_code,
      country_id: row.country_id
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({ city_name: "", city_code: "", country_id: "" });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/updatecity/${id}`, editRow);
      await loadCities(countryId);
      cancelEdit();

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "City updated successfully",
        timer: 1200,
        showConfirmButton: false
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update city"
      });
    }
  };


  const deleteCity = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This city will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Deleting...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
          });

          await api.delete(`/deletecity/${id}`);
          await loadCities(countryId);

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "City removed successfully",
            timer: 1500,
            showConfirmButton: false
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Unable to delete city"
          });
        }
      }
    });
  };

   // ================= EXPORT TO EXCEL =================
  const exportToExcel = () => {
    const exportData = filtered.map((row, index) => ({
      "Sl No": index + 1,
      "City Name": row.city_name,
      "City Code": row.city_code,
      "Country Name": row.country_name,
      "No of Airports": row.airport_count
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cities");

    XLSX.writeFile(workbook, `City_List_${new Date().toISOString().slice(0,10)}.xlsx`);
  };


  return (
    <div className="container-fluid p-2" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <div className="card border-0 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center"
          style={{
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            color: "#fff",
            borderRadius: "8px"
          }}>
          <h4 className="mb-0 fw-bold">Manage City</h4>
          <div>
            <button className="btn btn-success btn-sm me-2 fw-semibold" onClick={exportToExcel}>
              <Download size={16} className="me-1" /> Export Excel
            </button>
            <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/master/add-city")}>
              <Plus size={16} className="me-1" /> Add City
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm">
        <div className="card-body py-2">
          <div className="row">
            <div className="col-md-3">
              {/* <label className="small fw-semibold">Country</label> */}
              <select className="form-select form-select-sm" value={countryId} onChange={handleCountryChange}>
                {countries.map(c => (
                  <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              {/* <label className="small fw-semibold">Search City</label> */}
              <input
                className="form-control form-control-sm"
                placeholder="Search city..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table table-success">
              <tr>
                <th >#</th>
                <th>City Name</th>
                <th>City Code</th>
                <th>Country Name</th>
                <th className="text-center">#No of Airports</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={row.city_id}>
                  <td className="fw-semibold">{startIndex + i + 1}</td>

                  <td>
                    {editingId === row.city_id ? (
                      <input className="form-control form-control-sm"
                        value={editRow.city_name}
                        onChange={(e) => setEditRow({ ...editRow, city_name: e.target.value })} />
                    ) : row.city_name}
                  </td>

                  <td>
                    {editingId === row.city_id ? (
                      <input className="form-control form-control-sm"
                        value={editRow.city_code}
                        onChange={(e) => setEditRow({ ...editRow, city_code: e.target.value })} />
                    ) : <span className="badge bg-secondary">{row.city_code}</span>}
                  </td>

                  <td>{row.country_name}</td>

                  <td className="text-center">
                    <span className="badge bg-success-subtle text-success fw-semibold">
                      {row.airport_count}
                    </span>
                  </td>

                  <td className="text-end">
                    {editingId === row.city_id ? (
                      <>
                        <button className="btn btn-success btn-sm me-1" onClick={() => saveEdit(row.city_id)}>
                          <Save size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-outline-primary btn-sm me-1" onClick={() => startEdit(row)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => deleteCity(row.city_id)}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-end p-3">
          <ul className="pagination pagination-sm mb-0 shadow-sm">

            {/* First */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(1)}>«</button>
            </li>

            {/* Prev */}
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>‹</button>
            </li>

            {/* Left Ellipsis */}
            {startPage > 1 && (
              <li className="page-item disabled">
                <span className="page-link">…</span>
              </li>
            )}

            {/* Page Numbers */}
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
              <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(p)}>
                  {p}
                </button>
              </li>
            ))}

            {/* Right Ellipsis */}
            {endPage < totalPages && (
              <li className="page-item disabled">
                <span className="page-link">…</span>
              </li>
            )}

            {/* Next */}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>›</button>
            </li>

            {/* Last */}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage(totalPages)}>»</button>
            </li>

          </ul>
        </div>

      </div>
    </div>
  );
}
