import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import api from "../api/Api";
import "./PrepareSalaryPage.css";

const salaryData = [
  {
    id: 1,
    name: "ABC (D1)",
    salary: 15000,
    leave: 3,
    leaveDeduction: 1500,
    extraAllowance: 100,
    adv: 500,
    loan: 300,
    lic: 150,
    d1: 50,
    d2: 0,
  },
  {
    id: 2,
    name: "XYZ (D2)",
    salary: 18000,
    leave: 2,
    leaveDeduction: 1200,
    extraAllowance: 0,
    adv: 0,
    loan: 0,
    lic: 0,
    d1: 0,
    d2: 0,
  },
];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const PrepareSalaryPage = () => {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [saveAttendanceList, setSaveAttendanceList] = useState([]);
const [extraAllowance, setExtraAllowance] = useState({});
 const [deductions, setDeductions] = useState({});
 const [showConfirm, setShowConfirm] = useState(false);
const [comments, setComments] = useState([]);
  /* ================= MONTH DATE RANGE ================= */
  const { firstDate, lastDate } = useMemo(() => {
    const first = new Date(selectedYear, selectedMonth, 1);
    const last = new Date(selectedYear, selectedMonth + 1, 0);

    return {
      firstDate: first.toISOString().split("T")[0],
      lastDate: last.toISOString().split("T")[0],
    };
  }, [selectedMonth, selectedYear]);

  /* ================= FETCH MONTHLY ATTENDANCE ================= */
useEffect(() => {
  fetchSaveAttendance();
}, [selectedMonth, selectedYear]);


 const fetchSaveAttendance = async () => {
  try {
    const resp = await api.get(
      `/getForSalaryProcess/${selectedMonth + 1}/${selectedYear}`
      
    );

    setSaveAttendanceList(resp.data?.data || []);
  } catch (err) {
    toast.error("Failed to load saved attendance");
  }
};


  /* ================= YEAR LIST ================= */
  const years = [
    today.getFullYear() - 2,
    today.getFullYear() - 1,
    today.getFullYear(),
  ];
  /* 🔥 YAHI PE LIKHNA HAI 🔥 */
  const salaryData =
    saveAttendanceList?.[0]?.driver_summary || [];


  const handleDeductionChange = (idx, field, value) => {
    setDeductions((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: value === "" ? "" : Number(value),
      },
    }));
  };

  

  const getTotalDeduction = (idx) => {
    const d = deductions[idx] || {};
    return (
      (Number(d.adv) || 0) +
      (Number(d.loan) || 0) +
      (Number(d.lic) || 0) +
      (Number(d.d1) || 0) +
      (Number(d.d2) || 0)
    );
  }



//CHECK  SALARY SUBMIT ARE NOT AREA START//
const handlePrepareClick = async () => {
  try {
    const month = selectedMonth + 1;
    const year = selectedYear;

    // 🔹 Step 1: Check already prepared or not
    const res = await api.get("/salary/check", {
      params: { month, year },
    });

    if (res.data.exists) {
      alert("Already prepared salary for this month ❌");
      return;
    }

    // 🔹 Step 2: Show confirmation popup
    setShowConfirm(true);
  } catch (err) {
    console.error(err);
    alert("Error checking salary status");
  }
};

//CHECK SALARY SUBMIT ARE NOT AREA END//

  // save data area start//
  const handlePrepareSalary = async () => {
  try {
    const payload = salaryData.map((row, idx) => {
      const totalDays = 30;
      const perDay = 500;

      const salaryMonth = totalDays * perDay;
      const workedDays = row.total_salary;
      const leaveDays = totalDays - workedDays;
      const leaveDeduction = leaveDays * perDay;

      const extra = Number(extraAllowance[idx] || 0);
      const grossSalary = salaryMonth - leaveDeduction + extra;

      const totalDeduction = getTotalDeduction(idx);
      const netSalary = grossSalary - totalDeduction;

      return {
        driver_regno: row.driver_regno,
        driver_name: row.driver_name,
        month: selectedMonth + 1,
        year: selectedYear,

        salary_month: salaryMonth,
        leave_days: leaveDays,
        leave_deduction: leaveDeduction,
        extra_allowance: extra,

        adv: deductions[idx]?.adv || 0,
        loan: deductions[idx]?.loan || 0,
        lic: deductions[idx]?.lic || 0,
        d1: deductions[idx]?.d1 || 0,
        d2: deductions[idx]?.d2 || 0,

        total_deduction: totalDeduction,
        gross_salary: grossSalary,
        net_salary: netSalary,

        status: "PREPARED",
        comments: comments[idx] || "",
      };
    });

    await api.post("/salary", { records: payload });

    toast.success("Salary prepared successfully ✅");
  } catch (err) {
    console.error(err);
    toast.error("Failed to prepare salary ❌");
  }
};



  // save data area end//

  return (
    <div>
      {/* PAGE TITLE */}
      <div className="pageTitle1">
        <h2 className="title">
          Prepare Salary – {months[selectedMonth]} {selectedYear}
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

        {/* DEBUG */}
        {/* <pre>{JSON.stringify(salaryData, null, 2)}</pre> */}

        {/* Salary Table */}
        <div className="abstractAttendance-scroll">
        <table className="salary-table" style={{width:"100%"}}>
          <thead>
            <tr>
              <th  className="sticky-col" rowSpan="2">Sl No.</th>
              <th  className="sticky-col" rowSpan="2">Driver Name</th>
              <th  className="sticky-col" rowSpan="2">Driver ID</th>
              <th  className="sticky-col" rowSpan="2">Salary / Month</th>
              <th  className="sticky-col" rowSpan="2">No of Leave</th>
              <th  className="sticky-col" rowSpan="2">Leave Deduction</th>
              <th  className="sticky-col" rowSpan="2">Extra Allowance</th>
              <th  className="sticky-col" rowSpan="2">Gross Salary</th>
              <th  className="sticky-col" colSpan="5">Other Deductions</th>
              <th  className="sticky-col" rowSpan="2">Total Deduction</th>
              <th  className="sticky-col" rowSpan="2">Net Salary</th>
              <th  className="sticky-col" rowSpan="2">Comments</th>
            </tr>
            <tr>
              <th  className="sticky-col">Adv</th>
              <th  className="sticky-col">Loan</th>
              <th  className="sticky-col">LIC</th>
              <th  className="sticky-col">D1</th>
              <th  className="sticky-col">D2</th>
            </tr>
          </thead>

          <tbody>
            {salaryData.map((row, idx) => {
              // const gross =
              //   row.salary - row.leaveDeduction + row.extraAllowance;

              // const totalDeduction =
              //   row.adv + row.loan + row.lic + row.d1 + row.d2;

              // const netSalary = gross - totalDeduction;
              // RULE FOR DRIVER START//
                 const totalday=30;//TOTAL DAY
                 const perDaySalay=500;// PER DAY AMOU8NT
                 const salaryMonth=(totalday*perDaySalay);// SALARY AMOUNT IN MONTH
                const totalSday=row.total_salary;// TOTAL SALARY DAY
                const NoofLeave=(totalday-totalSday);//NUMBER OF LEAVE
                const leaveDeduction=(NoofLeave*perDaySalay);// TOTAL DEDUCTION
                // const grossSalary=(salaryMonth-leaveDeduction);
                //  const extra = extraAllowance[idx] || 0;
                 const extra = extraAllowance[idx] ?? 0;
              const grossSalary = salaryMonth - leaveDeduction + Number(extra);// GROSH SALARY

              
              const totalDeduction = getTotalDeduction(idx);
              const netSalary = grossSalary - totalDeduction;
              // RULE FOR DRIVER END//

              return (
                <tr key={row.id}>
                  <td>{idx + 1}</td>
                  <td>{row.driver_name}</td>
                  <td>{row.driver_regno}</td>
                  <td><input type="text" className="inputBodySize" value={salaryMonth} readOnly/></td>
                  <td><input type="text" className="inputBodySize" value={NoofLeave} readOnly/></td>
                  <td><input type="text" className="inputBodySize" value={leaveDeduction} readOnly /></td>
                     <td>
                    <input
                      type="number"
                      className="inputBodySize"
                      value={extra}
                      onChange={(e) =>
                        setExtraAllowance({
                          ...extraAllowance,
                          [idx]: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td><input className="inputBodySize" value={grossSalary} readOnly /></td>
                  <td>
  <input
    type="number"
    className="inputBodySize"
    value={deductions[idx]?.adv ?? ""}
    onChange={(e) =>
      handleDeductionChange(idx, "adv", e.target.value)
    }
  />
</td>

<td>
  <input
    type="number"
    className="inputBodySize"
    value={deductions[idx]?.loan ?? ""}
    onChange={(e) =>
      handleDeductionChange(idx, "loan", e.target.value)
    }
  />
</td>

<td>
  <input
    type="number"
    className="inputBodySize"
    value={deductions[idx]?.lic ?? ""}
    onChange={(e) =>
      handleDeductionChange(idx, "lic", e.target.value)
    }
  />
</td>

<td>
  <input
    type="number"
    className="inputBodySize"
    value={deductions[idx]?.d1 ?? ""}
    onChange={(e) =>
      handleDeductionChange(idx, "d1", e.target.value)
    }
  />
</td>

<td>
  <input
    type="number"
    className="inputBodySize"
    value={deductions[idx]?.d2 ?? ""}
    onChange={(e) =>
      handleDeductionChange(idx, "d2", e.target.value)
    }
  />
</td>

  <td>
  <input
    type="number"
    className="inputBodySize"
    value={getTotalDeduction(idx)}
    readOnly
  />
</td>

                  <td className="net-salary"><input type="text" className="inputBodySize" value={netSalary} readOnly /></td>
  <td>
 <input
  type="text"
  value={comments[idx] || ""}
  onChange={(e) => {
    const updated = [...comments];
    updated[idx] = e.target.value;
    setComments(updated);
  }}
/>

</td>

                </tr>
              );
            })}
          </tbody>
         
        </table>
        </div>
        <div className="controls">
           <button
            type="button"
            className="btn btn-success"
            onClick={handlePrepareClick}
          >
             PREPARE SALARY
          </button>

              {/* <button type="button" className="btn btn-success"  onClick={() => setShowConfirm(true)}> PREPARE SALARY</button> */}
    {showConfirm && (
  <div className="confirm-overlay">
    <div className="confirm-box">
      <h5 style={{ color: "green" }}>Confirm Salary Preparation</h5>
      <p>Are you sure you want to prepare salary?</p>

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
          Yes, Prepare
        </button>
      </div>
    </div>
  </div>
)}


          </div>
      </div>
       
    </div>
  );
};

export default PrepareSalaryPage;
