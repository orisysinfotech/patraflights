import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import api from "../api/Api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


export default function ManageAirline() {

  const [airlines, setAirlines] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;
  const maxButtons = 10;
  const navigate = useNavigate();

  useEffect(() => {
    loadAirlines();
  }, [search]);

  const loadAirlines = async () => {
    const res = await api.get(`/airlines?search=${search}`);
    setAirlines(res.data.data || []);
    setCurrentPage(1);
  };


  const deleteAirline = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This airline and its logo will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/delete_airlines/${id}`);

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Airline deleted successfully.",
        timer: 1500,
        showConfirmButton: false
      });

      loadAirlines();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete airline!"
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(airlines.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedData = airlines.slice(startIndex, startIndex + recordsPerPage);

  const startPage = Math.floor((currentPage - 1) / maxButtons) * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  return (
    <div className="container-fluid p-2" style={{ background: "#f5f7fb", minHeight: "100vh" }}>

      {/* Header */}
      <div className="card border-0 shadow-sm">
        <div
          className="card-body d-flex justify-content-between align-items-center"
          style={{
            background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
            color: "#fff",
            borderRadius: "8px"
          }}
        >
          <h4 className="mb-0 fw-bold">Manage Airline</h4>
          <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/master/add-airline")}>
            <Plus size={16} className="me-1" /> Add Airline
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm mb-0">
        <div className="card-body py-2">
          <div className="row">
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="Search airline..."
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
              <tr style={{
                background: "linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)",
                color: "#fff"
              }}>
                <th>#</th>
                <th>Airlines Name</th>
                <th>Airlines Code</th>
                <th>Airlines Icon</th>
                <th>Is Popular</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    No records available
                  </td>
                </tr>
              ) : paginatedData.map((a, i) => (
                <tr key={a.airlines_id}>
                  <td className="fw-semibold">{startIndex + i + 1}</td>
                  <td>{a.airlines_name}</td>
                  <td>
                    <span className="badge bg-secondary">{a.airlines_code2}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-link p-0"
                      style={{ textDecoration: "none",fontSize:"14px" }}
                      onClick={() =>
                        Swal.fire({
                          title: a.airlines_name,
                          imageUrl: `${process.env.REACT_APP_API_URL.replace("/api/v1", "")}/template/img/flight/${a.airlines_image}`,
                          imageWidth: 120,
                          imageHeight: 120,
                          imageAlt: a.airlines_name,
                          showCloseButton: true,
                          confirmButtonText: "Close"
                        })
                      }
                    >
                      View Icon
                    </button>
                  </td>

                  <td>
                    <span className={`badge ${a.airlines_popular ? "bg-success-subtle text-success" : "bg-secondary-subtle text-dark"}`}>
                      {a.airlines_popular ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-primary btn-sm me-1"
                      onClick={() => navigate(`/edit-airline/${a.airlines_id}`)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => deleteAirline(a.airlines_id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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

              {/* Pages */}
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
