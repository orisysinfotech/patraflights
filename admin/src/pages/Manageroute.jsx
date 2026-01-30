import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Pencil } from "lucide-react";
import api from "../api/Api";
import Swal from "sweetalert2";

const FlightDashboard = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await api.get("/getroute");
      if (res.data.success) setRoutes(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== STATUS TOGGLE WITH SWEET ALERT =====
  const toggleStatus = async (route_id, field, value) => {
    const newValue = value ? 0 : 1;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change this status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.put(`/route/status/${route_id}`, {
        field,
        value: newValue,
      });

      if (res.data.success) {
        setRoutes(
          routes.map((r) =>
            r.route_id === route_id ? { ...r, [field]: newValue } : r
          )
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Status updated successfully",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire("Failed", "Unable to update status", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Server error occurred", "error");
    }
  };

  return (
    <div className="container-fluid p-4 bg-light" style={{ fontSize: "13px" }}>
      <div className="mb-3">
        <button
          className="btn btn-primary"
          onClick={() => (window.location = "/add-route")}
        >
          + Add Route
        </button>
      </div>

      <div className="table-responsive border">
        <table className="table table-bordered table-hover bg-white mb-0">
          <thead style={{ background: "#26A69A", color: "#fff" }}>
            <tr>
              <th>Sl No.</th>
              <th>Route Type</th>
              <th>Route From</th>
              <th>Route To</th>
              <th>Route URL</th>
              <th>Show At Home</th>
              <th>Show At Page</th>
              <th>Publish</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : (
              routes.map((row, i) => (
                <tr key={row.route_id}>
                  <td>{i + 1}</td>

                  <td>
                    <span
                      className={`badge ${
                        row.route_type == 1
                          ? "bg-success"
                          : "bg-primary"
                      }`}
                    >
                      {row.route_type == 1
                        ? "Domestic"
                        : "International"}
                    </span>
                  </td>

                  <td>
                    {row.from_city} ({row.route_from})
                  </td>

                  <td>
                    {row.to_city} ({row.route_to})
                  </td>

                  <td style={{ maxWidth: 220, wordBreak: "break-all" }}>
                    {row.route_url}
                  </td>

                  {/* SHOW HOME */}
                  <td>
                    <span
                      style={{ cursor: "pointer" }}
                      className={
                        row.show_home
                          ? "text-success fw-bold"
                          : "text-danger"
                      }
                      onClick={() =>
                        toggleStatus(
                          row.route_id,
                          "show_home",
                          row.show_home
                        )
                      }
                    >
                      {row.show_home ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* SHOW PAGE */}
                  <td>
                    <span
                      style={{ cursor: "pointer" }}
                      className={
                        row.show_page
                          ? "text-success fw-bold"
                          : "text-danger"
                      }
                      onClick={() =>
                        toggleStatus(
                          row.route_id,
                          "show_page",
                          row.show_page
                        )
                      }
                    >
                      {row.show_page ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* PUBLISH */}
                  <td>
                    <span
                      style={{ cursor: "pointer" }}
                      className={
                        row.crawl
                          ? "text-success fw-bold"
                          : "text-danger"
                      }
                      onClick={() =>
                        toggleStatus(row.route_id, "crawl", row.crawl)
                      }
                    >
                      {row.crawl ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* ACTION */}
                  {/* <td>
                    <Pencil
                      size={16}
                      className="text-primary cursor-pointer"
                      onClick={() =>
                        (window.location = `/edit-route/${row.route_id}`)
                      }
                    />
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlightDashboard;
