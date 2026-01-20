
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/Api";
import toast from "react-hot-toast";


const FeedbackSubcategoryListPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const loadData = async () => {
    const res = await api.get("/feedback-subcategory-list");
    setItems(res.data.data || []);
  };

  const loadCategories = async () => {
    const res = await api.get("/feedback-category-dropdown");
    setCategories(res.data.data || []);
  };

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const filteredItems = selectedCategory
    ? items.filter((i) => i.category_id == selectedCategory)
    : items;

  const saveEdit = async (id) => {
    if (!editName || !editCategory) {
      toast.error("Category & Sub Category required");
      return;
    }

    await api.put("/feedback-subcategory-edit", {
      id,
      item_names: editName,
      category_id: editCategory,
    });

    toast.success("Updated");
    setEditId(null);
    loadData();
  };

  return (
    <div>
      
   <div className="page-header">
                <h5 className="page-title">Manage Feedback Sub Category 
                </h5>
                 {/* 🔽 CATEGORY FILTER */}
      <div style={{ maxWidth: "70%", marginBottom: "10px", float: "left" }}> 
        <select style={{ fontSize: "13px", float: "left", width: "100%", marginLeft: "20px" }}
          className="form-control"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">-- All Categories --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.item_names}
            </option>
          ))}
        </select>
      </div>
        
                <Link style={{ float: "right" }}
                    to="/master/feedback-subcategory-add"
                    className="btn-admin btn-add"
                  >
                    + ADD
                </Link>
              </div>
    <div className="attendance-scroll">
	 {/* <div style={{ maxWidth: "30%", marginBottom: "10px", float: "right" }}>
      <Link 
        to="/master/feedback-subcategory-add"
        className="btn-admin btn-add mb-2"
      >
        + ADD
      </Link>
  </div> */}

     

      <table className="attendance-table" style={{backgroundColor:"#fff"}}>
        <thead>
          <tr>
            <th style={{ width: "7%" }}>Sl No</th>
            <th style={{ width: "30%" }}>Feedback Category</th>
            <th style={{ width: "40%" }}>Feedback Sub Category</th>
            <th style={{ width: "8%" }}>Action</th>
            <th style={{ width: "15%" }}>Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredItems.map((i, idx) => (
            <tr key={i.id}>
              <td>{idx + 1}</td>

              {/* CATEGORY */}
              <td>
                {editId === i.id ? (
                  <select
                    className="form-control"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.item_names}
                      </option>
                    ))}
                  </select>
                ) : (
                  i.category_name
                )}
              </td>

              {/* SUB CATEGORY */}
              <td>
                {editId === i.id ? (
                  <input
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  i.item_names
                )}
              </td>

              {/* ACTION */}
              <td>
                {editId === i.id ? (
                  <button style={{ border: "none" }}
                    className="btn-admin btn-add "
                    onClick={() => saveEdit(i.id)}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="btn  btn-sm"
                    onClick={() => {
                      setEditId(i.id);
                      setEditName(i.item_names);
                      setEditCategory(i.category_id);
                    }}
                  >
                    ✏️
                  </button>
                )}
              </td>

              {/* STATUS */}
              <td>
                <select style={{ fontSize: "13px" }}
                  className="form-control"
                  value={i.is_active}
                  onChange={(e) =>
                    api
                      .put("/feedback-subcategory-status", {
                        id: i.id,
                        is_active: e.target.value,
                      })
                      .then(loadData)
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
  );
};

export default FeedbackSubcategoryListPage;
