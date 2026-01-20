import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/Api.js";
import "./DriverAttendancePageDaily.css";

const AttendanceTable = () => {
  const [driverData, setDriverData] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [observationMap, setObservationMap] = useState({});
  const [saveAttendanceList, setSaveAttendanceList] = useState([]);

  // DATE STATE
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split("T")[0]
  );

  // INITIAL LOAD
  useEffect(() => {
    fetchDriverData();
    fetchAttendance();
    fetchSaveAttendance();
  }, []);

  // RELOAD ATTENDANCE ON DATE CHANGE
  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

   // RELOAD SAVE ATTENDANCE ON DATE CHANGE
  useEffect(() => {
    fetchSaveAttendance();
  }, [selectedDate]);

  // FETCH DRIVER DATA
  const fetchDriverData = async () => {
    try {
      const res = await api.get("/getDriverData");
      setDriverData(res.data?.data || []);
    } catch {
      toast.error("Failed to load Driver details");
    }
  };

  // FETCH ATTENDANCE
  const fetchAttendance = async () => {
    const dateObj = new Date(selectedDate);
    const date = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear());

    try {
      const resp = await api.get(
        `/attendanceGetDateData/${date}/${month}/${year}`
      );
      setAttendanceList(resp.data?.data || []);
    } catch {
      toast.error("Failed to load attendance");
    }
  };



  // FIND ATTENDANCE
  const getAttendanceByDriver = (driverRegNo) => {
    return attendanceList.find(
      (att) => att.driver_regno === driverRegNo
    );
  };


    // FIND SAVE ATTENDANCE
const getSaveAttendanceByDriver = (driverRegNo) => {
  for (const rec of saveAttendanceList) {
    if (rec.attendance_json?.[driverRegNo]) {
      return rec.attendance_json[driverRegNo];
    }
  }
  return null;
};


  // HANDLE OBSERVATION CHANGE ✅
  const handleObservationChange = (driverRegNo, value) => {
    setObservationMap((prev) => ({
      ...prev,
      [driverRegNo]: value,
    }));
  };

  // LABEL HELPER
  const getLabel = (value) => {
    if (value === "Present") return "Present";
    if (value === "Absent") return "Absent";
    if (value === "Half Day") return "Half Day";
    return "";
  };


  /* ================= GET SAVE ATTENDACE RECORD START ========== */
    const fetchSaveAttendance = async () => {
    const dateObj = new Date(selectedDate);
    const date = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear());

    try {
      const resp = await api.get(
        `/saveAttendanceGetDateData/${date}/${month}/${year}`
      );
      setSaveAttendanceList(resp.data?.data || []);
    } catch {
      toast.error("Failed to load saveAttendance");
    }
  };
  /* ================= GET SAVE ATTENDACE RECORD END ========== */

  /* ================= CONFIRM ATTENDANCE ================= */
  const confirmAttendance = async () => {
    const payload = driverData.map((d) => ({
      driver_regno: d.driver_regno,
      attendance_status: observationMap[d.driver_regno] || null,
      attendance_date: selectedDate,
    }));

    try {
      await api.post("/attendance/confirm", { records: payload });
      toast.success("Attendance saved successfully");
      fetchAttendance();
       fetchSaveAttendance();
    } catch {
      toast.error("Failed to save attendance");
    }
  };

  return (
<div>
 <div className="pageTitle">
      <h2 className="title">
        Daily Attendance –{" "}
        {new Date(selectedDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </h2>
</div>
    <div className="attendance-wrapper">
     
      <div className="controls">
        <input
          type="date"
          className="date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
     {/* <pre>{JSON.stringify(driverData, null, 2)}</pre> */}
      <div className="attendance-scroll">
        <table className="attendance-table driverAttendance-table">
          <thead>
            <tr>
              
              <th style={{ width: "10%" }}>Sl No.</th>
              <th>Driver Name</th>
              <th>Driver ID</th>
              <th>Punch In Time</th>
              <th>Punch Out Time</th>
              <th style={{display:"none"}}>Actual Attendance</th>
              <th>Save Observation</th>
              <th>Observation</th>
            </tr>
          </thead>

          <tbody>
            {driverData.map((emp, index) => {
              const attendance = getAttendanceByDriver(emp.driver_regno);
              const saveAttendance = getSaveAttendanceByDriver(emp.driver_regno);
              const observation = observationMap[emp.driver_regno];
              const pIn = attendance?.checkin_datetime ? attendance.checkin_datetime.split(", ")[1]
  : "--";

      const pOut = attendance?.checkout_datetime ? attendance.checkout_datetime.split(", ")[1]
  : "--";
              return (
                <tr key={emp.driver_regno}>
                  <td>{index + 1}</td>
                  <td>
                    {emp.driver_fstname} {emp.driver_mdlname}{" "}
                    {emp.driver_lstname}
                  </td>
                  <td>{emp.driver_regno}</td>
                   <td>{pIn}</td>
                  <td> {pOut}</td>

                  <td style={{display:"none"}}>
                    {!attendance && !observation && (
                      <span className="altmsg">No Record</span>
                    )}

                    {attendance && !observation && (
                      <span className="present">Present</span>
                    )}

                    {observation && (
                      <span className="obser">
                        {getLabel(observation)}
                      </span>
                    )}
                  </td>

                  <td>
                    {!saveAttendance && <span className="altmsg">--</span>}

                    {saveAttendance && (
                      <span>{saveAttendance}</span>
                    )}
                  </td>

                  <td>
                    <select
                      className="attendance-select" required
                      value={observation || ""}
                      onChange={(e) =>
                        handleObservationChange(
                          emp.driver_regno,
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                    </select>
                  </td>
                </tr>
              );
            })}
             <tr>
            <td colSpan={7}>
              <button
                className="btn btn-success"
                onClick={confirmAttendance}
              >
                Confirm Attendance
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default AttendanceTable;
