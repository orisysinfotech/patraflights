import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Car,
  Smartphone,
  ChevronRight,
  ClipboardList,
  PhoneCall,
  Mail,
  Loader2,
  Camera,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import toast from "react-hot-toast";
import api, { IMAGE_BASE_URL } from "../api/Api.js";
import { socket } from "../api/socket";

// --- IMAGE COMPRESSION UTILITY ---
const compressImage = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const scaleSize = MAX_WIDTH / img.width;
        const newWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const newHeight =
          img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        canvas.width = newWidth;
        canvas.height = newHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        ctx.canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression failed"));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.7
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem("driverToken"));

  // UI & Logic States
  const [gpsData, setGpsData] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [todayTrips, setTodayTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // Logic Variables
  const [attendanceList, setAttendanceList] = useState([]);

  // Derived States
  const hasAttendance = attendanceList.length > 0;
  const isOnline = hasAttendance && Number(attendanceList[0]?.ck_sts) === 1;
  const isCheckedOut = hasAttendance && Number(attendanceList[0]?.ck_sts) === 2;

  // Dates
  const today = new Date();
  const currentDate = today.toISOString().split("T")[0];
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
  const currentYear = today.getFullYear();

  const [secondImage, setSecondImage] = useState(null);
  const [secondPreview, setSecondPreview] = useState(null);
  const [showNextStep, setShowNextStep] = useState(false);
  const [notes, setNotes] = useState("");
  const [itemsName, setItemsName] = useState([]);

  const [date, setDate] = useState(String(currentDate));
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(String(currentYear));
  const [itemsResponse, setItemsResponse] = useState({});
  const formatted = date.split("-").reverse().join("-");

  // Accordion Toggles
  const [open, setOpen] = useState(false);
  const [openOut, setOpenOut] = useState(false);

  const [itemsResponseIn, setItemsResponseIn] = useState({});
  const [itemsResponseOut, setItemsResponseOut] = useState({});

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    driverId: "",
    email: "",
    driver_photo: null,
  });

  const driverId = localStorage.getItem("driverRegNo");

  // --- API CALLS ---
  const fetchAssignedTrip = async () => {
    try {
      setLoadingTrips(true);
      const regNo = localStorage.getItem("driverRegNo");
      if (!regNo) {
        setTodayTrips([]);
        return;
      }
      const res = await api.get(`/driver/assigned-trip?driver_regno=${regNo}`);
      const tripData = Array.isArray(res.data) ? res.data : [res.data];
      if (tripData.length > 0 && tripData[0].drv_tripid) {
        setTodayTrips(tripData);
      } else {
        setTodayTrips([]);
      }
    } catch (err) {
      setTodayTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    fetchProfileDetails();
    fetchAttendance();
    fetchItemsDetails();
    const regNo = localStorage.getItem("driverRegNo");
    if (regNo) {
      fetchAssignedTrip();
      socket.emit("join_app_session", regNo);
    } else {
      setTimeout(() => fetchAssignedTrip(), 500);
    }

    const handleNewTrip = (data) => {
      new Audio("/sounds/trip_alert.mp3").play().catch(() => {});
      toast.success(`NEW TRIP: ${data.message || "Check your dashboard"}`, {
        duration: 8000,
        position: "top-center",
      });
      fetchAssignedTrip();
    };
    socket.on("new_trip_alert", handleNewTrip);
    return () => socket.off("new_trip_alert", handleNewTrip);
  }, [token]);

  const fetchProfileDetails = async () => {
    try {
      const res = await api.get("/auth/profile");
      setProfile(res.data);
    } catch (err) {
      toast.error("Profile sync failed");
    }
  };

  /* ===================== ATTENDANCE LOGIC START ===================== */
  const [showCheckin, setShowCheckin] = useState(false);

  const startDuty = () => {
    setShowCheckin(true);
    if (!navigator.geolocation) return toast.error("GPS not supported.");
    setSubmitting(true);
    const loadingToast = toast.loading("📍 Pinpointing location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(loadingToast);
        setGpsData({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setSubmitting(false);
        toast.success("Location verified. Take a selfie.");
        setTimeout(() => document.getElementById("cameraInput").click(), 200);
      },
      () => {
        toast.dismiss(loadingToast);
        setSubmitting(false);
        toast.error("Location access required.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024)
        return toast.error("Image > 5MB. Too large.");

      const toastId = toast.loading("Compressing...");
      try {
        const compressedFile = await compressImage(file);
        toast.dismiss(toastId);

        if (!image) {
          setImage(compressedFile);
          setPreview(URL.createObjectURL(compressedFile));
          setShowNextStep(true);
        } else if (!secondImage) {
          setSecondImage(compressedFile);
          setSecondPreview(URL.createObjectURL(compressedFile));
        }
      } catch (err) {
        toast.dismiss(toastId);
        toast.error("Compression failed");
      }
    }
  };

  const handleItemChange = (id, value) => {
    setItemsResponse((prev) => ({ ...prev, [id]: value }));
  };

  const handleAttendanceSubmit = async () => {
    if (!image || !gpsData) return toast.error("Incomplete data.");
    if (!notes.trim()) return toast.error("Enter odometer reading");

    const formData = new FormData();
    formData.append("selfie", image);
    if (secondImage) formData.append("secondSelfie", secondImage);
    formData.append("latitude", gpsData.latitude);
    formData.append("longitude", gpsData.longitude);
    formData.append("accuracy", gpsData.accuracy);
    formData.append("notes", notes);
    formData.append("ci_itemchkstatus", JSON.stringify(itemsResponse));
    formData.append("btnParameter", buttonParameter);

    setSubmitting(true);
    try {
      const res = await api.post("/attendance", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message || "Success!");

      // Reset
      setGpsData(null);
      setImage(null);
      setSecondImage(null);
      setPreview(null);
      setSecondPreview(null);
      setNotes("");
      setItemsResponse({});
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================== ATTENDANCE LOGIC END ===================== */
  const fetchAttendance = async () => {
    try {
      const res = await api.get(
        `/attendanceCheckDate/${driverId}/${date}/${month}/${year}`
      );
      setAttendanceList(res.data?.data || []);
    } catch {
      toast.error("Failed to load attendance");
    }
  };

  // 1. PUNCH IN: Show only if no attendance record exists for today
  const buttonLabel =
    !hasAttendance 
      ? submitting
        ? "Locating..."
        : "PUNCH IN (To Submit Your Attendance)"
      : "";

  // 2. PUNCH OUT: Show only if currently Online (Checked In)
  const buttonLabelout = isOnline
    ? submitting
      ? "Locating..."
      : "PUNCH OUT (To Submit Your Attendance)"
    : "";

  const buttonParameter = !attendanceList?.length
    ? 0
    : Number(attendanceList[0]?.ck_sts) === 1
    ? attendanceList[0]?.drv_atid
    : 0;

  const buttonParameterout = !attendanceList?.length
    ? 0
    : Number(attendanceList[0]?.ck_sts) === 2
    ? 1
    : 0;

  const fetchItemsDetails = async () => {
    try {
      const res = await api.get("/sendItems");
      setItemsName(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load Items details");
    }
  };

  const getFullImageUrl = (path, filename) => {
     if (!filename) return null; // No file name, return null
     return `${IMAGE_BASE_URL}${path}/${filename}`; 
  };

  const imageUrl = getFullImageUrl("/uploads/selfies", attendanceList[0]?.checkin_selfie);
  const odomtr_url = getFullImageUrl("/uploads/odometer", attendanceList[0]?.ciodomtr_image);
  const imageUrlout = getFullImageUrl("/uploads/selfies", attendanceList[0]?.checkout_selfie);
  const odomtr_urlout = getFullImageUrl("/uploads/odometer", attendanceList[0]?.coodomtr_image);

  // Helper to handle broken images
  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/150?text=No+Image"; // Fallback image
  };

  useEffect(() => {
    if (!attendanceList || attendanceList.length === 0) return;
    const rawStatus = attendanceList[0]?.ci_itemchkstatus;
    if (rawStatus) {
      try {
        setItemsResponseIn(
          typeof rawStatus === "string" ? JSON.parse(rawStatus) : rawStatus
        );
      } catch (e) {
        setItemsResponseIn({});
      }
    }
  }, [attendanceList]);

  useEffect(() => {
    if (!attendanceList || attendanceList.length === 0) return;
    const rawStatus = attendanceList[0]?.co_itemchkstatus;
    if (rawStatus) {
      try {
        setItemsResponseOut(
          typeof rawStatus === "string" ? JSON.parse(rawStatus) : rawStatus
        );
      } catch (e) {
        setItemsResponseOut({});
      }
    }
  }, [attendanceList]);

  const styles = {
    mainWrapper: {
      minHeight: "100vh",
      background: "#ffffffff",
      display: "flex",
      justifyContent: "center",
    },
    appContainer: {
      width: "100%",
      maxWidth: "480px", // Standard mobile width
      background: "#ffffffff",
      minHeight: "100vh",
      position: "relative",
      paddingBottom: "120px", // Extra padding for fixed SOS/Nav
      boxShadow: "0 0 20px rgba(0,0,0,0.05)",
    },
    nativeCard: {
      border: "1px solid #f0f0f0",
      borderRadius: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      background: "#fff",
      marginBottom: "20px",
      overflow: "hidden",
    },
    profileInitial: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px",
      fontWeight: "700",
      boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)",
    },
    profileImg: {
      width: "64px",
      height: "64px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "3px solid #f8f9fa",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    },
    btnGradient: {
      background: "linear-gradient(135deg, #2563eb, #1e40af)",
      border: "none",
      color: "#fff",
      borderRadius: "16px",
      padding: "16px",
      fontWeight: "700",
      fontSize: "15px",
      letterSpacing: "0.5px",
      boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
      transition: "transform 0.2s",
    },
    btnDangerGradient: {
      background: "linear-gradient(135deg, #ef4444, #b91c1c)",
      border: "none",
      color: "#fff",
      borderRadius: "16px",
      padding: "16px",
      fontWeight: "700",
      fontSize: "15px",
      letterSpacing: "0.5px",
      boxShadow: "0 8px 16px rgba(239, 68, 68, 0.2)",
    },
    uploadBox: {
      background: "#f8fafc",
      border: "2px dashed #cbd5e1",
      borderRadius: "16px",
      height: "130px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      transition: "all 0.2s",
    },
    uploadBoxImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    tripLineContainer: {
      position: "relative",
      paddingLeft: "32px",
      paddingTop: "8px",
      paddingBottom: "8px",
    },
    tripLineBar: {
      position: "absolute",
      left: "9px",
      top: "12px",
      bottom: "24px",
      width: "2px",
      background: "#e2e8f0",
    },
    sosBtn: {
      position: "fixed",
      bottom: "90px",
      right: "20px",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 8px 25px rgba(220, 38, 38, 0.4)",
      zIndex: 9999,
      border: "3px solid rgba(255,255,255,0.2)",
    },
  };

  return (
    <div style={styles.mainWrapper}>
      <div style={styles.appContainer}>
        <div className="px-3 pt-2">
          {/* DATE BADGE */}
          <div className="text-center mb-4 ">
            <span
              className="badge bg-info-subtle text-dark border rounded-pill px-4 py-2 shadow-sm"
              style={{ fontSize: "13px", fontWeight: "600" }}
            >
              {formatted}
            </span>
          </div>

          {/* PROFILE CARD */}
          <div
            className="card border-0"
            style={styles.nativeCard}
            onClick={() => navigate("/profile")}
          >
            <div className="card-body  p-3" style={{ border: "1px solid #0059ffff" }}>
              <div className="d-flex align-items-center">
                <div className="me-3 flex-shrink-0 border rounded-circle">
                  {profile.driver_photo ? (
                    <img
                      src={`${IMAGE_BASE_URL}${profile.driver_photo}`}
                      alt="Driver"
                      style={styles.profileImg}
                    />
                  ) : (
                    <div style={styles.profileInitial}>
                      {profile.fullName
                        ? profile.fullName.charAt(0).toUpperCase()
                        : "D"}
                    </div>
                  )}
                </div>

                <div className="flex-grow-1 overflow-hidden">
                  <h5
                    className="mb-1 text-truncate fw-bolder text-dark"
                    style={{ fontSize: "17px" }}
                  >
                    {profile.fullName || "Driver Name"}
                  </h5>
                  <div
                    className="text-muted d-flex align-items-center mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    <Smartphone size={14} className="me-2 text-primary" />{" "}
                    {profile.phone || "---"}
                  </div>
                  <div
                    className="text-muted d-flex align-items-center mb-1"
                    style={{ fontSize: "13px" }}
                  >
                    <Mail size={14} className="me-2 text-primary" />{" "}
                    {profile.email || "---"}
                  </div>
                  <div
                    className="text-muted d-flex align-items-center"
                    style={{ fontSize: "13px" }}
                  >
                    <LayoutDashboard size={14} className="me-2 text-primary" />{" "}
                    ID: {profile.driverId || "---"}
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted" />
              </div>
            </div>
          </div>

          {/* ACTION AREA (Punch In) */}
          <div className="mb-4">
            {/* BUTTON: SHOW ONLY IF NOT CHECKED IN */}
            {buttonLabel && (
              <button
                className="w-100 d-flex justify-content-center align-items-center shadow-sm"
                style={styles.btnGradient}
                onClick={startDuty}
                disabled={submitting}
              >
                {/* {submitting ? <Loader2 className="animate-spin me-2" /> : <MapPin className="me-2" />} */}
                {buttonLabel}
              </button>
            )}

            {/* FORM: PUNCH IN FORM */}
            {showCheckin && !hasAttendance && (
              <div
                className="card mt-3 animate__animated animate__fadeIn"
                style={styles.nativeCard}
              >
                <div className="card-body p-4">
                  {!gpsData ? (
                    <div className="text-center py-4">
                      <Loader2
                        className="animate-spin text-primary mx-auto mb-3"
                        size={32}
                      />
                      <p className="small fw-bold text-muted mb-0">
                        Acquiring High-Accuracy GPS...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="alert alert-success py-2 px-3 small mb-4 d-flex align-items-center border-0 bg-success-subtle text-success fw-bold rounded-3">
                        <CheckCircle2 size={16} className="me-2" /> Location
                        Verified ({gpsData.accuracy.toFixed(0)}m)
                      </div>

                      <div className="row g-3 mb-4">
                        {/* Selfie */}
                        <div className="col-6">
                          <div
                            style={{
                              ...styles.uploadBox,
                              borderColor: image ? "#2563eb" : "#cbd5e1",
                            }}
                            onClick={() =>
                              document.getElementById("cameraInput").click()
                            }
                          >
                            {preview ? (
                              <>
                                <img
                                  src={preview}
                                  style={styles.uploadBoxImg}
                                  alt="selfie"
                                />
                                <span className="badge bg-dark position-absolute bottom-0 w-100 rounded-0 py-2">
                                  1. Selfie
                                </span>
                              </>
                            ) : (
                              <div className="text-center text-muted">
                                <div className="bg-light rounded-circle p-2 mb-2 d-inline-block">
                                  <Camera size={24} />
                                </div>
                                <span className="d-block small fw-bold">
                                  Take Selfie
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Odometer */}
                        {image && (
                          <div className="col-6">
                            <div
                              style={{
                                ...styles.uploadBox,
                                borderColor: secondImage
                                  ? "#2563eb"
                                  : "#cbd5e1",
                              }}
                              onClick={() =>
                                document.getElementById("cameraInput2").click()
                              }
                            >
                              {secondPreview ? (
                                <>
                                  <img
                                    src={secondPreview}
                                    style={styles.uploadBoxImg}
                                    alt="odo"
                                  />
                                  <span className="badge bg-dark position-absolute bottom-0 w-100 rounded-0 py-2">
                                    2. Odometer
                                  </span>
                                </>
                              ) : (
                                <div className="text-center text-muted">
                                  <div className="bg-light rounded-circle p-2 mb-2 d-inline-block">
                                    <Car size={24} />
                                  </div>
                                  <span className="d-block small fw-bold">
                                    Add ODO
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Form Inputs */}
                      {secondPreview && (
                        <div className="animate__animated animate__fadeIn">
                          <div className="form-floating mb-4">
                            <input
                              type="number"
                              className="form-control bg-light border-0"
                              id="odoInput"
                              placeholder="Reading"
                              style={{
                                borderRadius: "12px",
                                fontWeight: "bold",
                              }}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                            <label htmlFor="odoInput" className="text-muted">
                              Enter Odometer Reading (KM)
                            </label>
                          </div>

                          <div className="bg-light p-4 rounded-4 mb-4 border border-light">
                            <h6 className="fw-bold small text-secondary text-uppercase mb-3 tracking-wide">
                              Vehicle Checklist
                            </h6>
                            {itemsName.map((item) => (
                              <div
                                key={item.id}
                                className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-white"
                              >
                                <span className="small fw-bold text-dark">
                                  {item.item_names}
                                </span>
                                <div
                                  className="btn-group btn-group-sm"
                                  role="group"
                                >
                                  <button
                                    type="button"
                                    className={`btn fw-bold px-3 ${
                                      itemsResponse[item.id] === 1
                                        ? "btn-success"
                                        : "btn-outline-secondary border-0 bg-white"
                                    }`}
                                    onClick={() => handleItemChange(item.id, 1)}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn fw-bold px-3 ${
                                      itemsResponse[item.id] !== 1 &&
                                      itemsResponse[item.id] !== undefined
                                        ? "btn-danger"
                                        : "btn-outline-secondary border-0 bg-white"
                                    }`}
                                    onClick={() => handleItemChange(item.id, 0)}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            className="w-100"
                            style={styles.btnGradient}
                            onClick={handleAttendanceSubmit}
                          >
                            {submitting
                              ? "Processing..."
                              : "CONFIRM & START DUTY"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* DETAILS: PUNCH IN HISTORY (Shows only if Attendance exists) */}
            {hasAttendance && (
              <div className="mt-3" style={{  }}>
                <button
                  className="btn w-100 text-start border-0 shadow-sm d-flex justify-content-between align-items-center p-3 rounded-4 bg-primary-subtle"
                  onClick={() => setOpen(!open)}
                >
                  <span className="small fw-bold text-success d-flex align-items-center">
                    <CheckCircle2 size={16} className="me-2" /> Started:{" "}
                    {attendanceList[0]?.checkin_datetime}
                  </span>
                  <ChevronRight
                    size={16}
                    style={{
                      transform: open ? "rotate(90deg)" : "none",
                      transition: "0.3s",
                    }}
                  />
                </button>
                {open && (
                  <div className="card mt-2 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body bg-primary-subtle">
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <img
                            src={imageUrl || "https://via.placeholder.com/150?text=No+Selfie"}
                            className="img-fluid rounded-3 border bg-white"
                            alt="in-selfie"
                          />
                        </div>
                        <div className="col-6">
                          <img
                            src={odomtr_url || "https://via.placeholder.com/150?text=No+Selfie"}
                            className="img-fluid rounded-3 border bg-white"
                            alt="in-odo"
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between small border-bottom pb-2 mb-2">
                        <span className="text-muted fw-bold">Odometer:</span>
                        <span className="fw-bolder text-dark">
                          {attendanceList[0]?.odo_civalue} KM
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="d-block small fw-bold text-muted mb-2 text-uppercase">
                          Checklist Log:
                        </span>
                        {itemsName.map((item) => (
                          <div
                            key={item.id}
                            className="d-flex justify-content-between small mb-1"
                          >
                            <span>{item.item_names}</span>
                            <span
                              className={
                                Number(itemsResponseIn[item.id]) === 1
                                  ? "text-success fw-bold"
                                  : "text-danger fw-bold"
                              }
                            >
                              {Number(itemsResponseIn[item.id]) === 1
                                ? "Yes"
                                : "No"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TRIPS SECTION */}
          <div className="d-flex justify-content-between align-items-center mb-3 mt-4 px-1">
            <span
              className="small fw-bolder text-info text-uppercase"
              style={{ fontSize: "15px", letterSpacing: "1px" }}
            >
              Today's Trips Admin
            </span>
            {/* <button
              className="btn btn-link btn-sm text-decoration-none p-0 fw-bold d-flex align-items-center text-primary"
              onClick={() => navigate("/dmr")}
            >
              <ClipboardList size={14} className="me-1" /> DMR Log
            </button> */}
          </div>

          <div className="trip-list mb-5">
            {loadingTrips ? (
              <div className="text-center py-5 text-muted">
                <Loader2 className="animate-spin mb-2" size={24} />
                <br />
                Loading Trips...
              </div>
            ) : todayTrips.length > 0 ? (
              todayTrips.map((trip) => (
                <div
                  key={trip.drv_tripid}
                  className="card border-0"
                  style={styles.nativeCard}
                  onClick={() => navigate(`/my-trips/${trip.drv_tripid}`)}
                >
                  <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3 px-3">
                    <span className="small fw-bold text-muted">
                      TRIP #{trip.drv_tripid}
                    </span>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3">
                      {trip.tstart_datetime
                        ? new Date(trip.tstart_datetime).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )
                        : "00:00"}
                    </span>
                  </div>
                  <div className="card-body pt-0 pb-3 px-3">
                    <div style={styles.tripLineContainer}>
                      <div style={styles.tripLineBar}></div>

                      <div className="mb-4 position-relative">
                        <span
                          className="position-absolute start-0 top-0 translate-middle p-1 bg-white border border-2 border-primary rounded-circle shadow-sm"
                          style={{
                            left: "-25px",
                            width: "12px",
                            height: "12px",
                            zIndex: 2,
                          }}
                        ></span>
                        <div
                          className="fw-bold text-dark"
                          style={{ fontSize: "14px" }}
                        >
                          {trip.tsgps_locname || "Pickup Point"}
                        </div>
                        <div
                          className="text-muted small fw-medium"
                          style={{ fontSize: "11px" }}
                        >
                          Pickup Location
                        </div>
                      </div>

                      <div className="position-relative">
                        <span
                          className="position-absolute start-0 top-0 translate-middle p-1 bg-success border border-2 border-white shadow-sm rounded-circle"
                          style={{
                            left: "-23px",
                            width: "12px",
                            height: "12px",
                            zIndex: 2,
                          }}
                        ></span>
                        <div
                          className="fw-bold text-secondary fst-italic"
                          style={{ fontSize: "14px" }}
                        >
                          Tap to view destination
                        </div>
                        <div
                          className="text-muted small fw-medium"
                          style={{ fontSize: "11px" }}
                        >
                          Drop Location
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-5 text-muted opacity-50 bg-white rounded-4 border border-light">
                <Car size={40} className="mb-2" />
                <p className="small fw-bold mb-0">No trips assigned today</p>
              </div>
            )}
          </div>

          {/* ACTION AREA (Punch Out) */}
          <div className="pb-4">
            {/* BUTTON: SHOW ONLY IF ONLINE (CHECKED IN) */}
            {buttonLabelout && (
              <button
                className="w-100 d-flex justify-content-center align-items-center shadow"
                style={styles.btnDangerGradient}
                onClick={startDuty}
                disabled={submitting}
              >
                {/* {submitting ? <Loader2 className="animate-spin me-2" /> : <AlertCircle className="me-2" />} */}
                {buttonLabelout}
              </button>
            )}

            {/* FORM: PUNCH OUT FORM (Reusing checkin logic) */}
            {showCheckin && isOnline && (
              <div
                className="card mt-3 animate__animated animate__fadeIn"
                style={styles.nativeCard}
              >
                <div className="card-body p-4">
                  {!gpsData ? (
                    <div className="text-center py-4">
                      <Loader2
                        className="animate-spin text-danger mx-auto mb-3"
                        size={32}
                      />
                      <p className="small fw-bold text-muted mb-0">
                        Acquiring High-Accuracy GPS...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="alert alert-success py-2 px-3 small mb-4 d-flex align-items-center border-0 bg-success-subtle text-success fw-bold rounded-3">
                        <CheckCircle2 size={16} className="me-2" /> Location
                        Verified ({gpsData.accuracy.toFixed(0)}m)
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-6">
                          <div
                            style={{
                              ...styles.uploadBox,
                              borderColor: image ? "#ef4444" : "#cbd5e1",
                            }}
                            onClick={() =>
                              document.getElementById("cameraInput").click()
                            }
                          >
                            {preview ? (
                              <>
                                <img
                                  src={preview}
                                  style={styles.uploadBoxImg}
                                  alt="selfie"
                                />
                                <span className="badge bg-dark position-absolute bottom-0 w-100 rounded-0 py-2">
                                  1. Selfie
                                </span>
                              </>
                            ) : (
                              <div className="text-center text-muted">
                                <div className="bg-light rounded-circle p-2 mb-2 d-inline-block">
                                  <Camera size={24} />
                                </div>
                                <span className="d-block small fw-bold">
                                  Take Selfie
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {image && (
                          <div className="col-6">
                            <div
                              style={{
                                ...styles.uploadBox,
                                borderColor: secondImage
                                  ? "#ef4444"
                                  : "#cbd5e1",
                              }}
                              onClick={() =>
                                document.getElementById("cameraInput2").click()
                              }
                            >
                              {secondPreview ? (
                                <>
                                  <img
                                    src={secondPreview}
                                    style={styles.uploadBoxImg}
                                    alt="odo"
                                  />
                                  <span className="badge bg-dark position-absolute bottom-0 w-100 rounded-0 py-2">
                                    2. Odometer
                                  </span>
                                </>
                              ) : (
                                <div className="text-center text-muted">
                                  <div className="bg-light rounded-circle p-2 mb-2 d-inline-block">
                                    <Car size={24} />
                                  </div>
                                  <span className="d-block small fw-bold">
                                    Add ODO
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      {secondPreview && (
                        <div className="animate__animated animate__fadeIn">
                          <div className="form-floating mb-4">
                            <input
                              type="number"
                              className="form-control bg-light border-0"
                              id="odoInputOut"
                              placeholder="Reading"
                              style={{
                                borderRadius: "12px",
                                fontWeight: "bold",
                              }}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                            />
                            <label htmlFor="odoInputOut" className="text-muted">
                              Enter Odometer Reading (KM)
                            </label>
                          </div>
                          <div className="bg-light p-4 rounded-4 mb-4 border border-light">
                            <h6 className="fw-bold small text-secondary text-uppercase mb-3 tracking-wide">
                              Vehicle Checklist
                            </h6>
                            {itemsName.map((item) => (
                              <div
                                key={item.id}
                                className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-white"
                              >
                                <span className="small fw-bold text-dark">
                                  {item.item_names}
                                </span>
                                <div
                                  className="btn-group btn-group-sm"
                                  role="group"
                                >
                                  <button
                                    type="button"
                                    className={`btn fw-bold px-3 ${
                                      itemsResponse[item.id] === 1
                                        ? "btn-success"
                                        : "btn-outline-secondary border-0 bg-white"
                                    }`}
                                    onClick={() => handleItemChange(item.id, 1)}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    className={`btn fw-bold px-3 ${
                                      itemsResponse[item.id] !== 1 &&
                                      itemsResponse[item.id] !== undefined
                                        ? "btn-danger"
                                        : "btn-outline-secondary border-0 bg-white"
                                    }`}
                                    onClick={() => handleItemChange(item.id, 0)}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            className="w-100"
                            style={styles.btnDangerGradient}
                            onClick={handleAttendanceSubmit}
                          >
                            {submitting ? "Processing..." : "CONFIRM END DUTY"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* DETAILS: PUNCH OUT HISTORY (Shows only if Checked Out) */}
            {isCheckedOut && (
              <div className="mt-3" style={{ }}>
                <button
                  className="btn w-100 text-start border-0 shadow-sm d-flex justify-content-between align-items-center p-3 rounded-4 bg-primary-subtle"
                  onClick={() => setOpenOut(!openOut)}
                >
                  <span className="small fw-bold text-danger d-flex align-items-center">
                    <AlertCircle size={16} className="me-2" /> Ended:{" "}
                    {attendanceList[0]?.checkout_datetime}
                  </span>
                  <ChevronRight
                    size={16}
                    style={{
                      transform: openOut ? "rotate(90deg)" : "none",
                      transition: "0.3s",
                    }}
                  />
                </button>
                {openOut && (
                  <div className="card mt-2 border-0 shadow-sm rounded-4 overflow-hidden ">
                    <div className="card-body bg-primary-subtle">
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <img
                            src={imageUrlout || "https://via.placeholder.com/150?text=No+Selfie"}
                            className="img-fluid rounded-3 border bg-white"
                            alt="out-selfie"
                          />
                        </div>
                        <div className="col-6">
                          <img
                            src={odomtr_urlout || "https://via.placeholder.com/150?text=No+Selfie"}
                            className="img-fluid rounded-3 border bg-white"
                            alt="out-odo"
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between small border-bottom pb-2 mb-2">
                        <span className="text-muted fw-bold">Odometer:</span>
                        <span className="fw-bolder text-dark">
                          {attendanceList[0]?.odo_covalue} KM
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className="d-block small fw-bold text-muted mb-2 text-uppercase">
                          Checklist Log:
                        </span>
                        {itemsName.map((item) => (
                          <div
                            key={item.id}
                            className="d-flex justify-content-between small mb-1"
                          >
                            <span>{item.item_names}</span>
                            <span
                              className={
                                Number(itemsResponseOut[item.id]) === 1
                                  ? "text-success fw-bold"
                                  : "text-danger fw-bold"
                              }
                            >
                              {Number(itemsResponseOut[item.id]) === 1
                                ? "Yes"
                                : "No"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SOS BUTTON (Fixed) */}
          {/* <a
            href="#"
            style={styles.sosBtn}
            onClick={(e) => {
              e.preventDefault();
              toast.error("SOS ALERT SENT TO ADMIN!", {
                icon: "🚨",
                duration: 3000,
              });
            }}
          >
            <PhoneCall size={26} fill="white" />
          </a> */}
        </div>
      </div>

      {/* Hidden Camera Inputs */}
      <input
        type="file"
        accept="image/*"
        capture="user"
        id="cameraInput"
        hidden
        onChange={handleCapture}
      />
      <input
        type="file"
        accept="image/*"
        capture="user"
        id="cameraInput2"
        hidden
        onChange={handleCapture}
      />
    </div>
  );
};

export default DashboardPage;