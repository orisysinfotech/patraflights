
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/Api";
import "./ConfirmationhecklistAddPage.css";

const FeedbackCategoryAddPage = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([
    { item_name: "" },
  ]);

  const handleChange = (index, value) => {
    const updated = [...rows];
    updated[index].item_name = value;
    setRows(updated);
  };

  const addMore = () => {
    if (rows.length >= 10) {
      toast.error("Maximum 10 categories allowed");
      return;
    }
    setRows([...rows, { item_name: "" }]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    for (let row of rows) {
      if (!row.item_name.trim()) {
        toast.error("Category name is required");
        return;
      }
    }

    try {
      const res = await api.post("/feedback-category-add", {
        items: rows,
      });

      if (res.data.success) {
        toast.success("Feedback categories added");
        navigate("/master/feedback-categorylist");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div>
      {/* HEADER */}
            <div className="page-header">
              <h5 className="page-title">Add Feedback Category
              </h5>
      
              <Link style={{ float: "right" }}
                  to="/master/feedback-categorylist"
                  className="btn-admin btn-add"
                >
                  Manage
              </Link>
          
    </div>
    <div className="attendance-wrapper">

      
	{/* <div  style={{ width: "100%" }}>
      <Link style={{ float: "right" }}
        to="/master/feedback-categorylist"
        className="btn-admin btn-add"
      >
        Manage
      </Link>
	  
	   
</div> */}
      <div className="attendance-scroll">
        <table className="attendance-table">
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input style={{ width: "31%", float: "left", marginRight: "10px" }}  
                    type="text"
                    className="form-control"
                    placeholder="Enter feedback category name"
                    value={row.item_name}
                    onChange={(e) =>
                      handleChange(index, e.target.value)
                    }
                  />
				    <button style={{  float: "left", border: "none" }}
            className="plus btn-admin btn-add"
            onClick={addMore}
          >
            + 
          </button>
		  
		    {rows.length > 1 && (
                    <button style={{  float: "left", marginTop: "-1px", marginLeft: "10px" }}
                      className="mins  btn btn-danger btn-sm"
                      onClick={() => removeRow(index)}
                    >
                      ✕
                    </button>
                  )}
                </td>

                <td style={{ width: "60px" }}>
                
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2">
       

          <button  style={{ border:"none" }} 
            className="btn-admin btn-add"
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

export default FeedbackCategoryAddPage;

