import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // <-- import SweetAlert2
import api from "../api/Api";

const emptyRow = {
  route_type: "",
  route_from: "",
  route_to: "",
  deal_price: "",
  template_id: "",
};

const AddRouteForm = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([emptyRow]);
  const [templates, setTemplates] = useState([]);
  const [fromSug, setFromSug] = useState([]);
  const [toSug, setToSug] = useState([]);
  const [activeRow, setActiveRow] = useState(null);

  useEffect(() => {
    api.get("/templates").then((res) => {
      if (res.data.success) setTemplates(res.data.data);
    });
  }, []);

  const handleChange = (index, e) => {
    const newRows = [...rows];
    newRows[index][e.target.name] = e.target.value;
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, { ...emptyRow }]);
  };

  const removeRow = (index) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const searchAirport = async (keyword, type, index) => {
    if (!keyword) return;
    setActiveRow(index);
    try {
      const res = await api.post("/airports/search", { keyword });
      type === "from" ? setFromSug(res.data) : setToSug(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectAirport = (code, field) => {
    const newRows = [...rows];
    newRows[activeRow][field] = code;
    setRows(newRows);
    setFromSug([]);
    setToSug([]);
    setActiveRow(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let r of rows) {
      if (!r.route_type || !r.route_from || !r.route_to || !r.template_id) {
        return Swal.fire({
          icon: "warning",
          title: "Missing Fields",
          text: "Please fill all mandatory fields!",
        });
      }
    }

    try {
      const res = await api.post("/add", { routes: rows });
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Routes Added Successfully",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/manageroute"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Please try again later",
      });
    }
  };

  return (
    <div className="container-fluid p-3" style={{ fontSize: "13px" }}>
      <div className="border p-3 bg-white shadow-sm">

        <div className="d-flex justify-content-between mb-2">
          <div className="bg-dark text-white p-2">Add Route</div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/manageroute")}
          >
            Manage Route
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {rows.map((row, index) => (
            <div className="row g-2 align-items-end mb-2 border-bottom pb-2" key={index}>

              <div className="col-md-2">
                <label>Route Type</label>
                <select
                  name="route_type"
                  className="form-select form-select-sm"
                  value={row.route_type}
                  onChange={(e) => handleChange(index, e)}
                >
                  <option value="">Select</option>
                  <option value="1">Domestic</option>
                  <option value="2">International</option>
                </select>
              </div>

              <div className="col-md-3 position-relative">
                <label>Route From</label>
                <input
                  type="text"
                  name="route_from"
                  className="form-control form-control-sm"
                  value={row.route_from}
                  onChange={(e) => {
                    handleChange(index, e);
                    searchAirport(e.target.value, "from", index);
                  }}
                />
                {activeRow === index && fromSug.length > 0 && (
                  <ul className="list-group position-absolute w-100 z-3">
                    {fromSug.map((a, i) => (
                      <li
                        key={i}
                        className="list-group-item list-group-item-action"
                        onClick={() =>
                          selectAirport(a.airport_code, "route_from")
                        }
                      >
                        {a.city_name} ({a.airport_code}), {a.country_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-md-3 position-relative">
                <label>Route To</label>
                <input
                  type="text"
                  name="route_to"
                  className="form-control form-control-sm"
                  value={row.route_to}
                  onChange={(e) => {
                    handleChange(index, e);
                    searchAirport(e.target.value, "to", index);
                  }}
                />
                {activeRow === index && toSug.length > 0 && (
                  <ul className="list-group position-absolute w-100 z-3">
                    {toSug.map((a, i) => (
                      <li
                        key={i}
                        className="list-group-item list-group-item-action"
                        onClick={() =>
                          selectAirport(a.airport_code, "route_to")
                        }
                      >
                        {a.city_name} ({a.airport_code}), {a.country_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="col-md-2">
                <label>Deal Price</label>
                <input
                  type="number"
                  name="deal_price"
                  className="form-control form-control-sm"
                  value={row.deal_price}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

              <div className="col-md-2">
                <label>Template</label>
                <select
                  name="template_id"
                  className="form-select form-select-sm"
                  value={row.template_id}
                  onChange={(e) => handleChange(index, e)}
                >
                  <option value="">Select</option>
                  {templates.map((t) => (
                    <option key={t.temp_id} value={t.temp_id}>
                      {t.temp_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-12 d-flex gap-2 mt-1">
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={addRow}
                >
                  + Add Row
                </button>
                {rows.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeRow(index)}
                  >
                    Remove
                  </button>
                )}
              </div>

            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-sm px-4 mt-3">
            Submit All
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRouteForm;
