import React, { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import api from "../api/Api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./ConfirmSalaryPage.css";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PrepareSalaryPage = () => {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [saveAttendanceList, setSaveAttendanceList] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
 const [open, setOpen] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [selectedFile, setSelectedFile] = useState(null);
 const tableRef = useRef();
  /* ================= FETCH SALARY DATA ================= */
 const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setSelectedFile(file);
};



//submit area end//

  useEffect(() => {
    fetchPreparedSalary();
  }, [selectedMonth, selectedYear]);

  const fetchPreparedSalary = async () => {
    try {
      const resp = await api.get(
        `/getPreperSalayData/${selectedMonth + 1}/${selectedYear}`
      );
      setSaveAttendanceList(resp.data?.data || []);
    } catch (err) {
      toast.error("Failed to load salary data");
    }
  };

  /* ================= SALARY DATA EXTRACTION ================= */
  const salaryObj = saveAttendanceList?.[0]?.salary_data || {};

  const salaryStatus = saveAttendanceList?.[0]?.conf_sts;

  const salaryData = Array.isArray(salaryObj?.drivers)
    ? salaryObj.drivers
    : [];

  /* ================= YEAR LIST ================= */
  const years = [
    today.getFullYear() - 2,
    today.getFullYear() - 1,
    today.getFullYear(),
  ];

  /* ================= PREPARE SALARY ================= */
  const handlePrepareSalary = async () => {
    if (!selectedFile) {
        toast.error("Please upload signed abstract file");
        return;
      }
      
    try {

// 🔥 FORM DATA
      const salary_id=9;
    const formData = new FormData();
    
    formData.append("file", selectedFile);
    formData.append("salary_id", salary_id);

    await api.post("/confirm/salary/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Confirm Salary Submitted Successfully");
    fetchPreparedSalary();

    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Confirm Salary already prepared for this month"
      );
    }
  };


   /* ================= PDF DOWNLOAD ================= */
    const handlePrintPDF = async () => {
      const element = tableRef.current;
      if (!element) return;
  
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      });
  
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Confirm_salary_${selectedMonth + 1}_${selectedYear}.pdf`);
    };

  return (
    <div>
      {/* PAGE TITLE */}
      <div className="pageTitle1">
        <h2 className="title">
          Confirm Salary – {months[selectedMonth]} {selectedYear}
        </h2>
      </div>

      <div className="driverAttendance-wrapper">
        {/* Month & Year Filters */}
        <div className="controls">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {months.map((m, i) => (
              <option key={i} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* ALREADY PREPARED MESSAGE */}
        {salaryStatus === 2 && (
          <div className="alert alert-warning">
            Salary already prepared for this month
          </div>
        )}

        {/* DEBUG (OPTIONAL) */}
        {/* <pre>{JSON.stringify(salaryData, null, 2)}</pre> */}

        {/* Salary Table */}
        <div className="abstractAttendance-scroll">
          <table className="salary-table" style={{ width: "100%" }}  ref={tableRef}>
            <thead>
              <tr>
                <th rowSpan="2">Sl No.</th>
                <th rowSpan="2">Driver Name</th>
                <th rowSpan="2">Driver ID</th>
                <th rowSpan="2">Salary / Month</th>
                <th rowSpan="2">No of Leave</th>
                <th rowSpan="2">Leave Deduction</th>
                <th rowSpan="2">Extra Allowance</th>
                <th rowSpan="2">Gross Salary</th>
                <th colSpan="5">Other Deductions</th>
                <th rowSpan="2">Total Deduction</th>
                <th rowSpan="2">Net Salary</th>
                <th rowSpan="2">Comments</th>
              </tr>
              <tr>
                <th>Adv</th>
                <th>Loan</th>
                <th>LIC</th>
                <th>D1</th>
                <th>D2</th>
              </tr>
            </thead>

            <tbody>
              {salaryData.length === 0 && (
                <tr>
                  <td colSpan="16" style={{ textAlign: "center" }}>
                    No salary data found
                  </td>
                </tr>
              )}

              {salaryData.map((row, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{row.driver_name}</td>
                  <td>{row.driver_regno}</td>
                  <td>{row.gross_salary + row.leave_deduction}</td>
                  <td>{row.leave_days}</td>
                  <td>{row.leave_deduction}</td>
                  <td>{row.extra_allowance}</td>
                  <td>{row.gross_salary}</td>

                  <td>{row.deductions?.adv}</td>
                  <td>{row.deductions?.loan}</td>
                  <td>{row.deductions?.lic}</td>
                  <td>{row.deductions?.d1}</td>
                  <td>{row.deductions?.d2}</td>

                  <td>{row.deductions?.total}</td>
                  <td className="net-salary">{row.net_salary}</td>
                  <td>{row.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         <table className="table table-bordered ">
          <thead>
            <tr>
              <th style={{justifyContent:"space-between", display:"flex"}}><button
               disabled={salaryStatus === 2}
        className="btn btn-primary"
        onClick={() => setOpen(!open)}
      >
        Confirm Salary  
      </button>
    
        <button
         disabled={salaryStatus === 2}
        className="btn btn-warning" onClick={handlePrintPDF}>
        <i class="fa fa-print" aria-hidden="true"></i>
        </button>
     
      </th>
            </tr>
          </thead>
    </table>
    {open && (
      // {/* //submit area start// */}
<table className="table table-bordered">
  <thead>
    <tr>
      <th style={{ textAlign: "center" }}>
        <span style={{ fontSize: "13px" }}>
          Upload Ink Sign letter 
        </span>

        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            width: "40%",
            margin: "10px auto",
          }}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="form-control"
          />

          <button
            className="btn btn-success"
            disabled={submitting}
             onClick={() => setShowConfirm(true)}
          >
            {submitting ? "Submitting..." : "Confirm "}
          </button>
        </div>
      </th>
    </tr>
  </thead>
</table>

// {/* // submit area end// */}
        )}
        {/* PREPARE BUTTON */}
        

        {/* CONFIRM MODAL */}
        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-box">
              <h5 style={{ color: "green" }}>Confirm Salary</h5>
              <p>Are you sure you want to Confirm salary?</p>

              <div className="confirm-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>

                <button
                  className="btn btn-success"
                  onClick={() => {
                    setShowConfirm(false);
                    handlePrepareSalary();
                  }}
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrepareSalaryPage;
