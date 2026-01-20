import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../api/Api.js";
import { Calendar, ChevronDown, CheckCircle, XCircle } from "lucide-react";

const AttendanceHistory = () => {
  /* ================= DATE ================= */
  const today = new Date();
  const todayDateStr = today.toISOString().split("T")[0];
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentYear = today.getFullYear();

  /* ================= STATE ================= */
  const [attendanceList, setAttendanceList] = useState([]);
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(String(currentYear));
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const driverId = localStorage.getItem("driverRegNo");

  /* ================= API ================= */
  const fetchAttendance = async (initial = false) => {
    initial ? setLoading(true) : setCalendarLoading(true);
    try {
      const res = await api.get(
        `/attendanceHistory/${driverId}/${month}/${year}`
      );
      setAttendanceList(res.data?.data || []);
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      initial ? setLoading(false) : setCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(true);
  }, []);

  useEffect(() => {
    fetchAttendance(false);
  }, [month, year]);

  /* ================= MAP ================= */
  const attendanceMap = useMemo(() => {
    return attendanceList.reduce((acc, item) => {
      if (!item.checkin_datetime) return acc;
      const [d, m, y] = item.checkin_datetime.split(",")[0].split("/");
      acc[`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`] = true;
      return acc;
    }, {});
  }, [attendanceList]);

  /* ================= CALENDAR CALCULATIONS ================= */
  const selectedYear = parseInt(year);
  const selectedMonth = parseInt(month) - 1;
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

  /* ================= SUMMARY LOGIC (PRESERVED) ================= */
  const totalPresent = Object.keys(attendanceMap).filter(
    (date) => date <= todayDateStr
  ).length;

  const totalDaysConsidered = Array.from(
    { length: daysInMonth },
    (_, i) => {
      const d = i + 1;
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(
        2,
        "0"
      )}-${String(d).padStart(2, "0")}`;

      if (dateStr < todayDateStr) return true;
      if (dateStr === todayDateStr && attendanceMap[dateStr]) return true;

      return false;
    }
  ).filter(Boolean).length;

  const totalAbsent = totalDaysConsidered - totalPresent;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    // Padding bottom ensures content isn't hidden by mobile nav
    <div className="container-fluid py-2 bg-light min-vh-100" style={{ paddingBottom: "100px" }}>
      <div className="mx-auto" style={{ maxWidth: "500px" }}>
        
        {/* HEADER CARD */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-2 rounded-3 text-primary">
                  <Calendar size={24} />
                </div>
                <h5 className="fw-bold mb-0 text-dark">Attendance History</h5>
              </div>
            </div>

            {/* FILTERS */}
            <div className="row g-2 mb-0">
              <div className="col-8">
                <div className="position-relative">
                  <select
                    className="form-select border-0 bg-light fw-bold text-dark py-2 ps-3"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    style={{ cursor: "pointer" }}
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map(
                      (m, i) => (
                        <option key={m} value={m}>
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][i]}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
              <div className="col-4">
                <select
                  className="form-select border-0 bg-light fw-bold text-dark py-2 text-center"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CALENDAR GRID CARD */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 position-relative overflow-hidden">
          <div className="card-body p-3">
            
            {/* Loading Overlay */}
            {calendarLoading && (
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 10 }}>
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
              </div>
            )}

            {/* Weekday Headers */}
            <div className="d-grid text-center mb-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div key={i} className="small fw-bold text-muted py-2">{day}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
              
              {/* Empty slots for start of month */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Render Days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                
                const isFuture = dateStr > todayDateStr;
                const isToday = dateStr === todayDateStr;
                
                let status = null; // null (future), 'P' (Present), 'A' (Absent)

                if (dateStr < todayDateStr) {
                  status = attendanceMap[dateStr] ? "P" : "A";
                }
                if (isToday) {
                  status = attendanceMap[dateStr] ? "P" : null; // Only show P if checked in today
                }

                return (
                  <div
                    key={day}
                    className={`d-flex flex-column align-items-center justify-content-center rounded-3 py-2 ${
                      isToday ? "border border-primary bg-primary bg-opacity-10" : "bg-light"
                    }`}
                    style={{ minHeight: "60px", opacity: isFuture ? 0.5 : 1 }}
                  >
                    <span className={`fw-bold small ${isToday ? "text-primary" : "text-dark"}`}>{day}</span>
                    
                    {/* Status Badge */}
                    <div style={{ height: "18px" }}>
                      {status === "P" && (
                        <span className="badge bg-success rounded-pill px-1" style={{ fontSize: "9px" }}>P</span>
                      )}
                      {status === "A" && (
                        <span className="badge bg-danger rounded-pill px-1" style={{ fontSize: "9px" }}>A</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div className="row g-3">
          <div className="col-6">
            <div className="card border-0 shadow-sm rounded-4 bg-success bg-opacity-10">
              <div className="card-body p-3 d-flex align-items-center justify-content-between">
                <div>
                  <div className="small fw-bold text-success text-uppercase opacity-75">Present</div>
                  <div className="h4 fw-bold text-success mb-0">{totalPresent}</div>
                </div>
                <div className="bg-white rounded-circle p-2 text-success shadow-sm">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-6">
            <div className="card border-0 shadow-sm rounded-4 bg-danger bg-opacity-10">
              <div className="card-body p-3 d-flex align-items-center justify-content-between">
                <div>
                  <div className="small fw-bold text-danger text-uppercase opacity-75">Absent</div>
                  <div className="h4 fw-bold text-danger mb-0">{totalAbsent}</div>
                </div>
                <div className="bg-white rounded-circle p-2 text-danger shadow-sm">
                  <XCircle size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttendanceHistory;