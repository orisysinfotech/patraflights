

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/Api.js";
import "./ConfirmationhecklistAddPage.css";

const ConfirmationhecklistAddPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const para = location.pathname.includes("salary-ddt-checklist") ? 2 : 1;

  const [rows, setRows] = useState([{ item_name: "", short_name: "" }]);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addMore = () => {
    if (rows.length >= 10) {
      toast.error("Maximum 10 items allowed");
      return;
    }
    setRows([...rows, { item_name: "", short_name: "" }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    for (let row of rows) {
      if (!row.item_name.trim()) {
        toast.error("Item name is required");
        return;
      }
      if (para === 2 && !row.short_name.trim()) {
        toast.error("Short code is required");
        return;
      }
    }

    try {
      const res = await api.post("/items-add", { para, items: rows });

      if (res.data.success) {
        toast.success("Items added successfully");
        navigate(
          para === 1
            ? "/master/confirmation-checklist"
            : "/master/salary-ddt-checklist"
        );
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Server error");
    }
  };

  return (
    <div>
       {/* HEADER */}
      <div className="page-header">
        <h5 className="page-title">
          {para === 1
            ? "Add Vehicle Checklist Item"
            : "Add Salary Deduction Component"}
        </h5>

       <Link
          to={para === 1
            ? "/master/confirmation-checklist"
            : "/master/salary-ddt-checklist"}
          className="btn-admin btn-add"
        >
          Manage
        </Link>
      </div>
    <div className="attendance-wrapper">
   

      {/* FORM */}
      <div className="attendance-scroll">
        <table className="attendance-table-add ">
          <thead>
            <tr>
              {/* <th>Salary Deduction Component Name</th> */}
              <th>
  {para === 1
    ? "Vehicle Checklist Item Name"
    : "Salary Deduction Component Name"}
</th>
              {para === 2 && <th >Short Code</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td style={{ width: "40%" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      para === 1
                        ? "Vehicle Checklist Item Name"
                        : "Salary Deduction Component Name"
                    }
                    value={row.item_name}
                    onChange={(e) =>
                      handleChange(index, "item_name", e.target.value)
                    }
                  />
                </td>

                {para === 2 && (
                  <td >
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Short Code"
                      value={row.short_name}
                      onChange={(e) =>
                        handleChange(index, "short_name", e.target.value)
                      }
                    />
                  </td>
                )}
                

                <td className="action-cell" style={{width: "81%", float: "left", textAlign: "left"}} 
>
                  <div style={{justifyContent:"space-between",display:"block"}}>

                  
                  <button style={{marginRight:"10px", border: "none"}}
            className="plus btn-admin btn-add "
            onClick={addMore}
          >
            + 
          </button>
                  {rows.length > 1 && (
                    <button
                      className=" mins btn btn-outline-danger btn-sm"
                      title="Remove"
                      onClick={() => removeRow(index)}
                    >
                      ✕
                    </button>
                  )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ACTION BUTTONS */}
        <div className="action-bar">
          {/* <button
            className="btn btn-outline-secondary btn-sm"
            onClick={addMore}
          >
            + Add More
          </button> */}

          <button
            className="btn btn-success btn-sm"
            onClick={handleSubmit}
          >
             Submit
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ConfirmationhecklistAddPage;




