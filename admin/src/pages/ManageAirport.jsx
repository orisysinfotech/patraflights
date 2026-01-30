import { useEffect, useState } from "react";
import { Pencil, Trash2, Check, X, Plus, FileSpreadsheet } from "lucide-react";
import api from "../api/Api.js";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ManageAirportDetails() {

  const [airports, setAirports] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryId, setCountryId] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const recordsPerPage = 10;
  const maxButtons = 10;
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [airportRes, countryRes] = await Promise.all([
      api.get("/getairport"),
      api.get("/getcountry")
    ]);
    setAirports(airportRes.data.data || []);
    setCountries(countryRes.data.data || []);
  };

  const filtered = airports.filter(a =>
    a.airport_name.toLowerCase().includes(search.toLowerCase()) &&
    (countryId === "" || String(a.country_id) === String(countryId))
  );

  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + recordsPerPage);

  const startPage = Math.floor((currentPage - 1) / maxButtons) * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  // const startEdit = (row) => {
  //   setEditingId(row.airport_id);
  //   setEditData({ ...row });
  // };

  // const cancelEdit = () => {
  //   setEditingId(null);
  //   setEditData({});
  // };

  // const saveEdit = async () => {
  //   await api.put(`/updateairport/${editingId}`, editData);
  //   loadData();
  //   cancelEdit();
  //   Swal.fire("Updated!", "Airport updated successfully", "success");
  // };

  const deleteAirport = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This airport will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    await api.delete(`/deleteairport/${id}`);
    loadData();
    Swal.fire("Deleted!", "Airport removed successfully", "success");
  };

  const exportExcel = () => {
    const data = filtered.map((a, i) => ({
      "Sl No": i + 1,
      "Airport Name": a.airport_name,
      "Code": a.airport_code,
      "Country": a.country_name,
      "City": a.city_name,
      "Contact": a.contactno,
      "Address": a.address,
      "Pincode": a.pincode
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Airports");
    XLSX.writeFile(wb, "Airport_List.xlsx");
  };

  return (
    <div className="container-fluid p-2" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center"
          style={{
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            color: "#fff",
            borderRadius: "8px"
          }}>
          <h4 className="mb-0 fw-bold">Manage Airport</h4>
          <div className="d-flex gap-2">
            <button className="btn btn-success btn-sm fw-semibold" onClick={exportExcel}>
              <FileSpreadsheet size={16} className="me-1" /> Export Excel
            </button>
            <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/add-airport")}>
              <Plus size={16} /> Add Airport
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm">
        <div className="card-body py-2">
          <div className="row">
            <div className="col-md-3">
              <select className="form-select form-select-sm"
                value={countryId}
                onChange={(e) => {
                  setCountryId(e.target.value);
                  setCurrentPage(1);
                }}>
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <input
                className="form-control form-control-sm"
                placeholder="Search airport..."
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
      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table table-success">
              <tr>
                <th>#</th>
                <th>Airport Name</th>
                <th>Code</th>
                <th>Country</th>
                <th>City</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Pincode</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((a, i) => (
                <tr key={a.airport_id}>
                  <td>{startIndex + i + 1}</td>

                  <td>
                    {editingId === a.airport_id ? (
                      <input className="form-control form-control-sm"
                        value={editData.airport_name || ""}
                        onChange={(e) => setEditData({ ...editData, airport_name: e.target.value })}
                      />
                    ) : a.airport_name}
                  </td>

                  <td><span className="badge bg-secondary">{a.airport_code}</span></td>
                  <td>{a.country_name}</td>
                  <td>{a.city_name}</td>

                  <td>
                    {editingId === a.airport_id ? (
                      <input className="form-control form-control-sm"
                        value={editData.contactno || ""}
                        onChange={(e) => setEditData({ ...editData, contactno: e.target.value })}
                      />
                    ) : a.contactno}
                  </td>

                  <td>
                    {editingId === a.airport_id ? (
                      <input className="form-control form-control-sm"
                        value={editData.address || ""}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      />
                    ) : a.address}
                  </td>

                  <td>{a.pincode}</td>

                  <td className="text-end">
                    {editingId === a.airport_id ? (
                      <>
                        <button className="btn btn-success btn-sm me-1" onClick={saveEdit}>
                          <Check size={14} />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-outline-primary btn-sm me-1"
                          onClick={() => navigate(`/edit-airport/${a.airport_id}`)}>
                          <Pencil size={14} />
                        </button>

                        <button className="btn btn-outline-danger btn-sm" onClick={() => deleteAirport(a.airport_id)}>
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
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-end p-2">
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
        )}


      </div>
    </div>
  );
}
