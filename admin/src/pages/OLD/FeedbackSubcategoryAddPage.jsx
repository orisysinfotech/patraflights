
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/Api";
import "./FeedbackSubcategoryAddPage.css";
const FeedbackSubcategoryAddPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [rows, setRows] = useState([{ subcategory_name: "" }]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/feedback-category-dropdown").then((res) => {
      setCategories(res.data.data || []);
    });
  }, []);

  const handleChange = (index, value) => {
    const updated = [...rows];
    updated[index].subcategory_name = value;
    setRows(updated);
  };

  const addMore = () => {
    if (rows.length >= 10) {
      toast.error("Maximum 10 subcategories allowed");
      return;
    }
    setRows([...rows, { subcategory_name: "" }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!categoryId) {
      toast.error("Please select category");
      return;
    }

    for (let row of rows) {
      if (!row.subcategory_name.trim()) {
        toast.error("Sub category name required");
        return;
      }
    }

    try {
      const res = await api.post("/feedback-subcategory-add", {
        category_id: categoryId,
        items: rows,
      });

      if (res.data.success) {
        toast.success("Sub categories added successfully");
        navigate("/master/feedback-subcategory");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div>
    <div className="page-header">
                    <h5 className="page-title" style={{marginTop:"5px;"}}>Add Feedback Sub Category
                    </h5>
            
                    <Link style={{ float: "right" }}
                        to="/master/feedback-subcategory"
                        className="btn-admin btn-add"
                      >
                        Manage
                    </Link>
                  </div>
    <div className="attendance-wrapper">
      {/* <Link style={{ float: "right" }}
        to="/master/feedback-subcategory"
        className="btn-admin btn-add"
      >
        Manage
      </Link> */}
     
      

      <table className="attendance-table1"  style={{ textAlign: "left" }} >
        <tbody>
          {/* CATEGORY (ONCE) */}
          <tr>
            <th style={{ width: "20%", textAlign: "left" }}>Feedback Category Name</th>
            <td style={{ width: "35%" }}>
              <select
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.item_names}
                  </option>
                ))}
              </select>
            </td>
          </tr>

          {/* SUB CATEGORY (ADD MORE) */}
          {rows.map((row, index) => (
            <tr key={index}>
              <th style={{ width: "20%", textAlign: "left" }}>Sub Category Name</th>
              <td>
                <input
                  className="form-control"
                  placeholder="Enter Sub Category Name"
                  value={row.subcategory_name}
                  onChange={(e) =>
                    handleChange(index, e.target.value)
                  }
                />
              </td>

              <td style={{ width: "60px", textAlign: "left", border: "none" }}>
			         <button style={{  border: "none" }}
					  className="plus btn-admin btn-add" onClick={addMore}>
          +
        </button>
                {rows.length > 1 && (
                  <button style={{ marginLeft: "10px" }}
                    className="mins btn btn-outline-danger btn-sm"
                    onClick={() => removeRow(index)}
                  >
                    ✕
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2">
 

        <button className="btn btn-success btn-sm" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
    </div>
  );
};

export default FeedbackSubcategoryAddPage;

