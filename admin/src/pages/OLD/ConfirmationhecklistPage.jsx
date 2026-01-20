

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/Api.js";
import "./ConfirmationhecklistPage.css";

const ConfirmationhecklistPage = () => {
  const [masterItems, setMasterItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editShortName, setEditShortName] = useState("");

  const location = useLocation();
  const para = location.pathname.includes("salary-ddt-checklist") ? 2 : 1;

  useEffect(() => {
    fetchItemsDetails();
  }, [para]);

  const fetchItemsDetails = async () => {
    try {
      const res = await api.get(`/getMastadata/${para}`);
      setMasterItems(res.data?.data || []);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const handleStatusChange = async (id, value) => {
    try {
      await api.put("/items-status", { id, is_active: value });
      toast.success("Status updated");
      fetchItemsDetails();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditName(item.item_names);
    setEditShortName(item.short_name || "");
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await api.put("/items-edit", {
        id: editId,
        item_names: editName,
        short_name: para === 2 ? editShortName : null,
        para,
      });

      toast.success("Item updated");
      setEditId(null);
      setEditName("");
      setEditShortName("");
      fetchItemsDetails();
    } catch {
      toast.error("Failed to update item");
    }
  };

  return (
    <div>
         {/* HEADER */}
      <div className="page-header">
        <h2 className="page-title">
          {para === 1
            ? "Manage Vehicle Checklist Item Lists"
            : "Manage Salary Deduction Component List"}
        </h2>

        <div className="page-actions">
          <Link
            to={
              para === 1
                ? "/master/confirmation-checklist/add"
                : "/master/salary-ddt-checklist/add"
            }
            className="btn-admin btn-add"
          >
            + ADD
          </Link>

          {/* <Link
            to={
              para === 1
                ? "/master/confirmation-checklist"
                : "/master/salary-ddt-checklist"
            }
            className="btn-admin btn-manage"
          >
            Manage
          </Link> */}
        </div>
      </div>
      
          <div className="attendance-wrapper">
   

      {/* TABLE */}
      <div className="attendance-scroll">
        <table className="attendance-table">
          <thead>
            <tr>
              <th style={{ width: "6%" }}>Sl No</th>
              <th>
                {para === 1
                  ? "Vehicle Checklist Item Name"
                  : "Salary Deduction Component Name"}
              </th>
              {para === 2 && <th style={{ width: "20%" }}>Short Code</th>}
              <th style={{ width: "10%" }}>Action</th>
              <th style={{ width: "16%" }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {masterItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>
                  {editId === item.id ? (
                    <input
                      className="admin-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    item.item_names
                  )}
                </td>

                {para === 2 && (
                  <td>
                    {editId === item.id ? (
                      <input
                        className="admin-input"
                        value={editShortName}
                        onChange={(e) => setEditShortName(e.target.value)}
                      />
                    ) : (
                      item.short_name
                    )}
                  </td>
                )}
               
                <td>
                  {editId === item.id ? (
                    <button
                      className="btn-admin btn-add"
                      onClick={() => handleEditSave(item.id)}
                    >
                      Save
                    </button>
                  ) : (
                   <button
                      className="btn btn-sm"
                      onClick={() => {
                        setEditId(item.id);
                        setEditName(item.item_names);
                        setEditShortName(item.short_name || "");
                      }}
                    >
                      ✏️
                    </button>
                  )}
                </td>

                <td className="center">
                  <select
                    className="admin-select"
                    value={item.is_active}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value)
                    }
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default ConfirmationhecklistPage;



