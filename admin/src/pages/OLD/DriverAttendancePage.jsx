// import React, { useState, useMemo, useEffect } from "react";
import React, { useState, useMemo, useEffect, useRef } from "react";
import toast from "react-hot-toast";
// import api from "../api/Api";
import api, { IMAGE_BASE_URL } from "../api/Api.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./DriverAttendancePage.css";

const AttendanceTable = () => {
  const [driverData, setDriverData] = useState([]);
  const [saveAttendanceList, setSaveAttendanceList] = useState([]);
    const [saveAttendanceListReport, setSaveAttendanceListReport] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
const [submitting, setSubmitting] = useState(false);
 const [open, setOpen] = useState(false);
 const [activeTab, setActiveTab] = useState("profile");
// submit arae start//
 const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setSelectedFile(file);
};


const handleSubmitAbstract = async () => {
  if (!selectedFile) {
    toast.error("Please upload signed abstract file");
    return;
  }

  try {
    setSubmitting(true);

    // 🔥 CREATE JSON DATA
    const driverSummary = driverData.map((driver) => {
      const summary = getAttendanceSummary(driver.driver_regno);

      return {
        driver_regno: driver.driver_regno,
        driver_name: `${driver.driver_fstname} ${driver.driver_mdlname || ""} ${driver.driver_lstname || ""}`,
        present: summary.present,
        absent: summary.absent,
        half_day: summary.halfDay,
        full_day: summary.fullDay,
        total_salary: summary.TotalSalay || 0,
      };
    });

    // 🔥 FORM DATA
    const formData = new FormData();
    formData.append("month", month + 1);
    formData.append("year", year);
    formData.append("file", selectedFile);
    formData.append("driver_summary", JSON.stringify(driverSummary));

    await api.post("/attendance/abstract/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Abstract submitted successfully");
    setSelectedFile(null);
  } catch (err) {
    console.error(err);
    toast.error("Submission failed");
  } finally {
    setSubmitting(false);
  }
};
//submit area end//
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth()); // 0–11
  const [year, setYear] = useState(today.getFullYear());
const tableRef = useRef();
  /* ================= MONTH DAYS + FIRST/LAST DATE ================= */
  const { daysArray, firstDate, lastDate, fullDates } = useMemo(() => {
  const totalDays = new Date(year, month + 1, 0).getDate();

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const days = Array.from({ length: totalDays }, (_, i) => {
    const dateObj = new Date(year, month, i + 1);
    return {
      date: i + 1,
      day: dateObj.toLocaleString("default", { weekday: "short" }),
      isHoliday: dateObj.getDay() === 0,
    };
  });

  const allDates = Array.from({ length: totalDays }, (_, i) =>
    formatDate(new Date(year, month, i + 1))
  );

  return {
    daysArray: days,
    firstDate: formatDate(new Date(year, month, 1)),       // 2026-01-01
    lastDate: formatDate(new Date(year, month + 1, 0)),    // 2026-01-31
    fullDates: allDates,                                   // 👈 FULL MONTH DATES
  };
}, [month, year]);


  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchDriverData();
  }, []);

  /* ================= RELOAD MONTHLY ATTENDANCE ================= */
  useEffect(() => {
    fetchSaveAttendance();
    fetchSaveAttendanceReport();
  }, [firstDate, lastDate]); // 🔥 IMPORTANT FIX

  /* ================= FETCH DRIVERS ================= */
  const fetchDriverData = async () => {
    try {
      const res = await api.get("/getDriverData");
      setDriverData(res.data?.data || []);
    } catch {
      toast.error("Failed to load driver details");
    }
  };

  /* ================= FETCH MONTHLY ATTENDANCE ================= */
  const fetchSaveAttendance = async () => {
    try {
      const resp = await api.get(
        `/saveAttendanceGetDateDataMonthly/${firstDate}/${lastDate}`
      );
      setSaveAttendanceList(resp.data?.data || []);
    } catch {
      toast.error("Failed to load saved attendance");
    }
  }; 

   const fetchSaveAttendanceReport = async () => {
    try {
      const resp = await api.get(
        `/getForSalaryProcess/${month + 1}/${year}`
        
      );
  
      setSaveAttendanceListReport(resp.data?.data || []);
    } catch (err) {
      toast.error("Failed to load saved attendance");
    }
  };

const getDoc = saveAttendanceListReport[0]?.file_path;
const imageUrl = `${IMAGE_BASE_URL}/${getDoc}`;
  /* ================= FIND ATTENDANCE FROM JSON ================= */
const formatToYMD = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};



const getSaveAttendanceByDriver = (driverRegNo, day) => {
  for (const rec of saveAttendanceList) {
    if (!rec.checkin_datetime) continue;

    const dbDate = rec.checkin_datetime; // "7/1/2026, 12:00:00 am"

let formattedDate = "";

if (dbDate) {
  const [datePart] = dbDate.split(","); // "7/1/2026"
  const [month, day, year] = datePart.split("/");

  formattedDate = `${year}-${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}`;

  // formattedDate = `${year}-${month}-${day}`;
}

// console.log("DB == " + formattedDate);

    // console.log("UI == " + day);

    // 🔥 DATE MATCH
    if (formattedDate === day) {
      return rec.attendance_json?.[driverRegNo] || "NA";
    }
  }
  return "NA";
};

const getAttendanceSummary = (driverRegNo) => {
  let present = 0;
  let absent = 0;
  let halfDay = 0;
  let fullDay = 0;
  let TotalSalay =0;

  for (const rec of saveAttendanceList) {
    const status = rec.attendance_json?.[driverRegNo];
    if (!status) continue;

    const s = String(status).toLowerCase();

    if (s === "present" || s === "p") {
      present++;
      TotalSalay += 1;
       
    } 
    else if (s === "absent" || s === "a") {
      absent++;
      // fullDay += 0
    } 
    else if (s === "half day" || s === "half_day" || s === "hd") {
      halfDay++;
      TotalSalay += 0.5;
      fullDay += 0.5;
    }
    // holiday ignored
  }

  return { present, absent, halfDay, fullDay,TotalSalay };
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
    pdf.save(`Attendance_${month + 1}_${year}.pdf`);
  };


  return (
   <div>
       <div className="pageTitle1">
      <h2 className="title">
        Attendance Sheet –{" "}
        {new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
        {year}
      </h2>
    </div>
   
     <div className="driverAttendance-wrapper">
     {/* tab arae start */}
     <div className="tab-pills">
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Monthly Attendance Report
        </button>

        <button
          className={activeTab === "salary" ? "active" : ""}
          onClick={() => setActiveTab("salary")}
        >
          Abstract Report 
        </button>

        <button
          className={activeTab === "attendance" ? "active" : ""}
          onClick={() => setActiveTab("attendance")}
        >
           View ink sign letter
        </button>
      </div>
      <div className="tab-content">
          {/* ================= ATTENDENCE REPORT START ================= */}
        {activeTab === "profile" && <div>
          {/* ================= CONTROLS START ================= */}
          <div className="controls">
        <select value={month} onChange={(e) => setMonth(+e.target.value)}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(+e.target.value)}>
          {Array.from({ length: 10 }, (_, i) => 2021 + i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
          {/* ================= CONTROLS END ================= */}
           {/* ================= ATTENDANCE END ================= */}
             <div className="driverAttendance-scroll">
        <table className="driverAttendance-table " ref={tableRef} style={{width:"100%"}}>
          <thead>
            <tr>
               
              <th className="sticky-col driver-head">
                <span>Driver</span>
                <span>Name</span>
              </th>

              {daysArray.map((d, i) => (
                <th
                  key={i}
                  className={`date-head ${d.isHoliday ? "holiday-head" : ""}`}
                >
                  <div>{d.date}</div>
                  <small>{d.day}</small>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {driverData.map((driver , index) => (
              <tr key={driver.driver_regno}>
              
                <td className="sticky-col driver-name">
                  {driver.driver_fstname} {driver.driver_mdlname} {driver.driver_lstname}
                </td>

  {fullDates.map((dateStr, i) => (
  <td key={i} className="day-cell">
    {/* <span>{dateStr}</span> */}
    <small style={{ color: "#333", fontWeight: 500 }}>
      {getSaveAttendanceByDriver(driver.driver_regno, dateStr) || "-"}
    </small>
  </td>
))}
              </tr>
            ))}

            {driverData.length === 0 && (
              <tr>
                <td colSpan={daysArray.length + 1} align="center">
                  No drivers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
            {/* ================= ATTENDANCE END ================= */}
       </div> }
          {/* ================= ATTENDENCE REPORT END ================= */}
          {/* ================= ABSTRACT REPORT START ================= */}
        {activeTab === "salary" && <div style={{ marginTop: "-16px" }}>
             <table className="table table-bordered " >
          <thead>
            <tr>
              <th style={{justifyContent:"space-between", display:"flex"}}><button
        className="btn"
        onClick={() => setOpen(!open)}
        style={{backgroundColor:"#00bcd4",color:"#fff", fontSize:"13px"}}
      >
        View Abstract Report of  {new Date(year, month).toLocaleString("default", { month: "long" })}{" "}
        {year}
      </button>
    
        <button className="btn btn-warning" onClick={handlePrintPDF}>
        <i class="fa fa-print" aria-hidden="true"></i>
        </button>
     
      </th>
            </tr>
          </thead>
    </table>
    {open && (
  <div class="abstTable">
        <table className="table table-bordered driverAttendance-table">
          <thead>
            <tr>
              <th className="abstTblTh" style={{backgroundColor:"#ff9c07",color:"#fff",}} >Sl. No</th>
              <th className="abstTblTh" style={{backgroundColor:"#ff9c07",color:"#fff",}} >Driver Name</th>
              <th className="abstTblTh" style={{backgroundColor:"#ff9c07",color:"#fff",}}>Driver ID</th>
              <th className="abstTblTh" style={{backgroundColor:"#ff9c07",color:"#fff",}}>Total Present</th>
              <th className="abstTblTh" style={{backgroundColor:"#ff9c07",color:"#fff",}}>Total Absent</th>
              <th className="abstTblTh" style={{backgroundColor:"#ff9c07",color:"#fff",}}>Total Half Day</th>
               <th className="abstTblTh" style={{backgroundColor:"#ff9c07",color:"#fff",}}>Salary Days</th>
            </tr>
          </thead>
          <tbody>
              {/* <pre>{JSON.stringify(getDoc, null, 2)}</pre> */}
      {/* {driverData.map((driver) => { */}
        {driverData.map((driver, index) => {
  const summary = getAttendanceSummary(driver.driver_regno);

  return (
    <tr key={driver.driver_regno}>
      <td className="abstTblTd">{index + 1}</td>
      <td className="abstTblTd">
        {driver.driver_fstname} {driver.driver_mdlname} {driver.driver_lstname}
      </td>
      <td className="abstTblTd">{driver.driver_regno}</td>
      <td className="abstTblTd">{summary.present}</td>
      <td className="abstTblTd">{summary.absent}</td>
      <td className="abstTblTd">{summary.halfDay} == {summary.fullDay}</td>
      <td className="abstTblTd">{summary.TotalSalay}</td>
    </tr>
  );
})}
          </tbody>
        </table>
{/* //submit area start// */}
<table className="table table-bordered">
  <thead>
    <tr>
      <th style={{ textAlign: "center" }}>
        <span style={{ fontSize: "13px" }}>
          Upload Ink Sign Copy of Abstract of Attendance
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
            onClick={handleSubmitAbstract}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Confirm "}
          </button>
        </div>
      </th>
    </tr>
  </thead>
</table>

{/* // submit area end// */}
          </div>
      )}
     
          </div>}
           {/* ================= ABSTRACT REPORT START ================= */}
              {/* ================= ATTENDENCE DOCUMENT START ================= */}
        {activeTab === "attendance" && <div style={{display:"none"}}>
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-3">Document Preview</h2>
      {imageUrl ? (
        <iframe
          src={imageUrl}
          title="Document Viewer"
          className="w-full h-[600px] border rounded"
        />
      ) : (
        <p className="text-gray-500 text-sm">No document available</p>
      )}
    </div>
          </div>}
           {/* ================= ATTENDENCE DOCUMENT START ================= */}
      </div>

    </div>
    </div>
  );
};

export default AttendanceTable;
