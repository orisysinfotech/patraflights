import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import api from "../api/Api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


export default function ManageCountry() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;
  const maxButtons = 10;
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      title: "Loading Countries...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    loadCountries().then(() => {
      Swal.close();
    });
  }, []);


  const loadCountries = async () => {
    const res = await api.get("/countries-full");
    setCountries(res.data.data || []);
  };

  const filtered = countries.filter(c =>
    c.country_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedData = filtered.slice(startIndex, startIndex + recordsPerPage);

  const startPage = Math.floor((currentPage - 1) / maxButtons) * maxButtons + 1;
  const endPage = Math.min(startPage + maxButtons - 1, totalPages);

  const deleteCountry = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This country and its image will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: "Deleting...",
            text: "Please wait",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          await api.delete(`/deletecountry/${id}`);
          await loadCountries();

          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Country has been deleted successfully.",
            timer: 1500,
            showConfirmButton: false
          });

        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Unable to delete country"
          });
        }
      }
    });
  };


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
          <h4 className="mb-1 fw-bold">Manage Country</h4>
          <button className="btn btn-warning btn-sm fw-semibold" onClick={() => navigate("/add-country")}>
            <Plus size={16} className="me-1" /> Add Country
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm">
        <div className="card-body py-2">
          <div className="row">
            <div className="col-md-4">
              <input
                className="form-control form-control-sm"
                placeholder="Search country..."
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
                <th>#</th>
                <th>Country Name</th>
                <th>Country Code</th>
                <th className="text-center">#No of City</th>
                <th className="text-center">#No of Airports</th>
                <th>Country Logo</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={row.country_id}>
                  <td className="fw-semibold">{startIndex + i + 1}</td>
                  <td>{row.country_name}</td>
                  <td><span className="badge bg-secondary">{row.country_code}</span></td>

                  <td className="text-center">
                    <span
                      className="badge bg-primary-subtle text-primary fw-semibold"
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/master/manage-city?country=${row.country_id}`)}
                    >
                      {row.city_count}
                    </span>
                  </td>

                  <td className="text-center">
                    <span className="badge bg-success-subtle text-success fw-semibold">
                      {row.airport_count}
                    </span>
                  </td>

                  <td>
                    {row.country_image && (
                      <img
                        src={`${process.env.REACT_APP_API_URL.replace("/api/v1", "")}/${row.country_image}`}
                        alt={row.country_name}
                        height="30"
                        width="30"
                        className="rounded border"
                      />
                    )}
                  </td>

                  <td className="text-end">
                    <button
                      className="btn btn-outline-primary btn-sm me-1"
                      onClick={() => navigate(`/edit-country/${row.country_id}`)}
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => deleteCountry(row.country_id)}
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
