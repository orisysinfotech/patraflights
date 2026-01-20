import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/Api";
import "./ConfirmationhecklistPage.css";

const FeedbackCategoryListPage = () => {
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");

  const fetchItems = async () => {
    try {
      const res = await api.get("/feedback-category-list");
      setItems(res.data?.data || []);
    } catch {
      toast.error("Failed to load data");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleStatusChange = async (id, value) => {
    try {
      await api.put("/feedback-category-status", {
        id,
        is_active: value,
      });
      toast.success("Status updated");
      fetchItems();
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleEditSave = async (id) => {
    try {
      await api.put("/feedback-category-edit", {
        id,
        item_names: editName,
      });
      toast.success("Category updated");
      setEditId(null);
      fetchItems();
    } catch {
      toast.error("Update failed");
    }
  };

  return (
    <div>
      {/* HEADER */}
            <div className="page-header">
              <h5 className="page-title">Manage Feedback Category 
              </h5>
      
              <Link style={{ float: "right" }}
                  to="/master/feedback-category-add"
                  className="btn-admin btn-add"
                >
                  + ADD
              </Link>
            </div>
    <div className="attendance-wrapper">

 


      {/* <div style={{ marginBottom: "10px", float: "right" }}>
        <Link
          to="/master/feedback-category-add"
          className="btn-admin btn-add"
        >
          + ADD
        </Link>
      </div> */}

      <div className="attendance-scroll">
        <table className="attendance-table">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Sl No.</th>
              <th style={{ width: "60%" }}>Feedback Category Name</th>
              <th style={{ width: "15%" }}>Action</th>
              <th style={{ width: "15%" }}>Status</th>             
            </tr>
          </thead>

          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>
                  {editId === item.id ? (
                    <input
                      className="form-control"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    item.item_names
                  )}
                </td>

                <td>
                  {editId === item.id ? (
                    <button
                      className="btn-admin btn-add "
                      onClick={() => handleEditSave(item.id)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="btn  btn-sm"
                      onClick={() => {
                        setEditId(item.id);
                        setEditName(item.item_names);
                      }}
                    >
                      ✏️
                    </button>
                  )}
                </td>

                <td>
                  <select style={{ fontSize: "13px" }}
                    className="form-control"
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

export default FeedbackCategoryListPage;
