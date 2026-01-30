import { useEffect, useState } from "react";
import { Pencil, Trash2, Save, X, Plus } from "lucide-react";
import api from "../api/Api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ManageCabin() {

  const [cabins, setCabins] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({
    cabin_name: "",
    cabin_code: "",
    flight_price_hike: ""
  });

  const recordsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    loadCabins();
  }, []);

  const loadCabins = async () => {
    const res = await api.get("/cabins");
    setCabins(res.data.data || []);
  };

  // 🔍 Search
  const filtered = cabins.filter(c =>
    c.cabin_name.toLowerCase().includes(search.toLowerCase()) ||
    c.cabin_code.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 Pagination
  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const pageData = filtered.slice(startIndex, startIndex + recordsPerPage);

  // ✏️ Start Inline Edit
  const startEdit = (row) => {
    setEditingId(row.cabin_id);
    setEditRow({
      cabin_name: row.cabin_name,
      cabin_code: row.cabin_code,
      flight_price_hike: row.flight_price_hike
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRow({ cabin_name: "", cabin_code: "", flight_price_hike: "" });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/cabins/${id}`, editRow);
      await loadCabins();
      cancelEdit();

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Cabin updated successfully",
        timer: 1200,
        showConfirmButton: false
      });
    } catch {
      Swal.fire("Error", "Update failed", "error");
    }
  };

  // 🗑 Delete
  const deleteCabin = async (id) => {
    const result = await Swal.fire({
      title: "Delete Cabin?",
      text: "This record will be permanently removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete"
    });

    if (!result.isConfirmed) return;

    await api.delete(`/cabins/${id}`);
    Swal.fire("Deleted!", "Cabin removed.", "success");
    loadCabins();
  };

  return (
    <div className="container-fluid p-2" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <div className="card shadow-sm">
        <div  className="card-body d-flex justify-content-between align-items-center"
          style={{
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            color: "#fff",
            borderRadius: "8px"
          }}>
          <h4 className="mb-0 fw-bold">Manage Cabin Type</h4>
          <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/master/add-cabin")}>
            <Plus size={16} /> Add CabinType
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card shadow-sm">
        <div className="card-body py-2">
          <div className="row">
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="Search by cabin name or code..."
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
        <table className="table table-hover align-middle mb-0">
          <thead className="table table-success">
            <tr>
              <th>#</th>
              <th>Cabin Type Name</th>
              <th>Cabin Type Code</th>
              <th>% Increase in Flight Price</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((c, i) => (
              <tr key={c.cabin_id}>
                <td>{startIndex + i + 1}</td>

                <td>
                  {editingId === c.cabin_id ? (
                    <input className="form-control form-control-sm"
                      value={editRow.cabin_name}
                      onChange={(e) => setEditRow({ ...editRow, cabin_name: e.target.value })}
                    />
                  ) : c.cabin_name}
                </td>

                <td>
                  {editingId === c.cabin_id ? (
                    <input className="form-control form-control-sm"
                      value={editRow.cabin_code}
                      onChange={(e) => setEditRow({ ...editRow, cabin_code: e.target.value })}
                    />
                  ) : <span className="badge bg-secondary">{c.cabin_code}</span>}
                </td>

                <td>
                  {editingId === c.cabin_id ? (
                    <input className="form-control form-control-sm"
                      value={editRow.flight_price_hike}
                      onChange={(e) => setEditRow({ ...editRow, flight_price_hike: e.target.value })}
                    />
                  ) : c.flight_price_hike}
                </td>

                <td className="text-end">
                  {editingId === c.cabin_id ? (
                    <>
                      <button className="btn btn-success btn-sm me-1" onClick={() => saveEdit(c.cabin_id)}>
                        <Save size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-outline-primary btn-sm me-1" onClick={() => startEdit(c)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => deleteCabin(c.cabin_id)}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modern Pagination */}
        <div className="d-flex justify-content-end p-2">
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 && "disabled"}`}>
              <button className="page-link" onClick={() => setCurrentPage(1)}>«</button>
            </li>
            <li className={`page-item ${currentPage === 1 && "disabled"}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>‹</button>
            </li>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <li key={p} className={`page-item ${currentPage === p && "active"}`}>
                <button className="page-link" onClick={() => setCurrentPage(p)}>{p}</button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>›</button>
            </li>
            <li className={`page-item ${currentPage === totalPages && "disabled"}`}>
              <button className="page-link" onClick={() => setCurrentPage(totalPages)}>»</button>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}
