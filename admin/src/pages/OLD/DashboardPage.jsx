import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Car,
  Smartphone,
  ChevronRight,
  Navigation,
  ClipboardList,
  PhoneCall,
  Mail,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api, { IMAGE_BASE_URL } from "../api/Api.js";
import { socket } from "../api/socket";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem("driverToken"));

  // UI & Logic States
  const [dutyStatus, setDutyStatus] = useState("OFFLINE");
  const [gpsData, setGpsData] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [todayTrips, setTodayTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const driverRegNo = localStorage.getItem("driverRegNo");

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
    driverId: "",
    email: "",
    driver_photo: null,
  });
  const fetchAssignedTrip = async () => {
    try {
      setLoadingTrips(true);
      const regNo = localStorage.getItem("driverRegNo");
      //console.log("DEBUG: Attempting to fetch trips for RegNo:", regNo);
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
      // console.error("DEBUG: Dashboard fetch error:", err);
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
  const startPunchProcess = (type) => {
    if (!navigator.geolocation) return toast.error("GPS Required");
    setSubmitting(true);
    const loadId = toast.loading("📍 Pinpointing Location...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss(loadId);
        setGpsData({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          type: type,
        });
        setSubmitting(false);
        document.getElementById("cameraInput").click();
      },
      () => {
        toast.dismiss(loadId);
        setSubmitting(false);
        toast.error("GPS Access Denied");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setShowPunchModal(true);
    }
  };

  const handleAttendanceSubmit = async () => {
    if (!image || !gpsData) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("selfie", image);
    formData.append("latitude", gpsData.latitude);
    formData.append("longitude", gpsData.longitude);
    formData.append("accuracy", gpsData.accuracy);
    formData.append("type", gpsData.type);

    try {
      const res = await api.post("/attendance", formData);
      toast.success(res.data.message || "Attendance synced!");
      setDutyStatus(gpsData.type === "in" ? "ONLINE" : "OFFLINE");
      setShowPunchModal(false);
      setPreview(null);
      setImage(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submit Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // const handleLogout = () => {
  //   if (socket) socket.disconnect();
  //   localStorage.removeItem("driverToken");
  //   localStorage.removeItem("driverMobile");

  //   toast.success("You have been logged out");
  //   navigate("/login");
  // };

 return (
    <div className="driver-dashboard">
      <style>{`
        /* --- THEME VARIABLES (Light Mode) --- */
        :root {
          --primary: #0062cc;       /* Patra Blue */
          --primary-soft: rgba(0, 98, 204, 0.1);
          --bg-body: #f8f9fa;       /* Light Grey Body */
          --card-bg: #ffffff;       /* White Card */
          --card-border: #e2e8f0;   /* Light Border */
          --text-main: #1a1a1a;     /* Dark Text */
          --text-muted: #64748b;    /* Slate Grey */
          --success: #10b981;       /* Green */
          --danger: #ef4444;        /* Red */
        }

        .driver-dashboard { 
          min-height: 100vh; 
          background: var(--bg-body);
          color: var(--text-main); 
          font-family: 'Inter', sans-serif;
          padding: 20px 0 100px 0; 
        }

        /* --- Profile Card (Clean White) --- */
        .profile-section {
          padding: 0 10px;
          margin-bottom: 24px;
        }

        .premium-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 24px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05); /* Soft Shadow */
          cursor: pointer;
          transition: transform 0.2s;
        }
        .premium-card:active { transform: scale(0.98); }

        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          border: 3px solid #eef2f6; /* Soft border ring */
          padding: 3px;
          background: #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .profile-avatar img {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          object-fit: cover;
        }

        .profile-info h2 {
          margin: 0 0 6px 0;
          font-size: 19px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: -0.5px;
        }

        .profile-info p {
          margin: 4px 0 0 0;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* --- Status & Actions --- */
        .action-container {
          padding: 0 16px;
          margin-bottom: 30px;
        }

        .duty-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 20px;
          letter-spacing: 0.5px;
        }
        /* Updated Colors for Light Theme */
        .duty-badge.ONLINE { 
            background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; 
        }
        .duty-badge.OFFLINE { 
            background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; 
        }

        .control-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .btn-action {
          height: 64px;
          border-radius: 18px;
          border: none;
          font-weight: 800;
          font-size: 14px;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .btn-action:active { transform: scale(0.96); }
        .btn-action:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

        /* Modern Colors */
        .btn-in { 
            background: var(--success); 
            box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25); 
        }
        .btn-out { 
            background: var(--danger); 
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.25); 
        }

        /* --- Trip Section --- */
        .section-label {
          padding: 0 24px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .section-label span {
          font-size: 13px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: 1px;
        }
        
        .dmr-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #f0f7ff;          
          color: var(--primary);                
          border: 1px solid #cce4ff;     
          padding: 6px 14px;
          border-radius: 10px;           
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .dmr-btn:hover {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        .trip-item {
          background: var(--card-bg);
          margin: 0 16px 12px 16px;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid var(--card-border);
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          cursor: pointer;
          transition: 0.2s;
        }
        .trip-item:active { background: #f9fafb; }

        .trip-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f5f9;
        }

        .time-box {
          color: var(--primary);
          font-weight: 800;
          font-size: 15px;
          background: #eff6ff;
          padding: 4px 10px;
          border-radius: 8px;
        }

        .route-path {
          position: relative;
          padding-left: 28px;
        }
        .route-path::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 8px;
          bottom: 16px;
          width: 2px;
          background: #e2e8f0; /* Light line color */
        }

        .path-point {
          position: relative;
          font-size: 15px;
          font-weight: 700;
          color: #333;
          margin-bottom: 20px;
        }
        .path-point::after {
          content: '';
          position: absolute;
          left: -27px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--primary);
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px var(--primary);
        }
        .path-point.destination::after { 
            background: var(--success); 
            box-shadow: 0 0 0 2px var(--success); 
        }

        /* SOS BUTTON */
        .sos-fab { 
          position: fixed; 
          bottom: 100px; 
          right: 20px; 
          width: 56px; 
          height: 56px; 
          background: linear-gradient(135deg, #ef4444, #dc2626); 
          border-radius: 20px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: #fff; 
          box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
          z-index: 1000;
          text-decoration: none;
          transition: all 0.2s ease;
          animation: sos-pulse 2s infinite;
        }
        .sos-fab:active { transform: scale(0.9); }

        @keyframes sos-pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        /* --- Compact Modal (White) --- */
        .punch-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          backdrop-filter: blur(5px); z-index: 9999;
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .modal-box {
          background: #ffffff; 
          width: 100%; max-width: 320px;
          border-radius: 28px; 
          padding: 30px; 
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .preview-circle {
          width: 160px; height: 160px; border-radius: 50%;
          margin: 25px auto; 
          border: 5px solid var(--primary);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 98, 204, 0.2);
        }
      `}</style>

      <main>
        {/* PROFILE CARD */}
        <section className="profile-section">
          <div className="premium-card" onClick={() => navigate("/profile")}>
            <div className="profile-avatar">
              {profile.driver_photo ? (
                <img
                  src={`${IMAGE_BASE_URL}${profile.driver_photo}`}
                  alt="Driver"
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    color: "#0062cc",
                    fontSize: "24px"
                  }}
                >
                  {profile.fullName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2>{profile.fullName || "Driver Name"}</h2>
              <p>
                <Smartphone size={14} /> {profile.phone || "---"}
              </p>
              <p>
                <Mail size={14} /> {profile.email || "---"}
              </p>
              <p>
                <LayoutDashboard size={14} /> ID: {profile.driverId || "---"}
              </p>
            </div>
            <ChevronRight
              size={20}
              color="#ccc"
              style={{ marginLeft: "auto" }}
            />
          </div>
        </section>

        {/* CONTROLS */}
        <section className="action-container">
          <div className={`duty-badge ${dutyStatus}`}>
            <span style={{ fontSize: "10px" }}>●</span> {dutyStatus}
          </div>
          <div className="control-grid">
            <button
              className="btn-action btn-in"
              onClick={() => startPunchProcess("in")}
              disabled={dutyStatus === "ONLINE" || submitting}
            >
              <MapPin size={22} /> CHECK IN
            </button>
            <button
              className="btn-action btn-out"
              onClick={() => startPunchProcess("out")}
              disabled={dutyStatus === "OFFLINE" || submitting}
            >
              <Navigation size={22} /> CHECK OUT
            </button>
          </div>
        </section>

        {/* TRIPS */}
        <div className="section-label">
          <span>TODAY'S TRIPS</span>
          <button className="dmr-btn" onClick={() => navigate("/dmr")}>
            <ClipboardList size={16} /> DMR
          </button>
        </div>

        {todayTrips.length > 0 ? (
          todayTrips.map((trip) => (
            <div
              key={trip.drv_tripid}
              className="trip-item"
              onClick={() => navigate(`/my-trips/${trip.drv_tripid}`)}
            >
              <div className="trip-header">
                <span
                  style={{ fontSize: "12px", fontWeight: 800, color: "#999", letterSpacing:"1px" }}
                >
                  TRIP #{trip.drv_tripid}
                </span>
                <span className="time-box">
                  {trip.tstart_datetime
                    ? new Date(trip.tstart_datetime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "00:00"}
                </span>
              </div>
              <div className="route-path">
                <div className="path-point">
                  {trip.tsgps_locname || "Pickup Point"}
                </div>
                <div
                  className="path-point destination"
                  style={{ color: "#666", marginBottom: 0, fontWeight: 500 }}
                >
                  Click to view destination
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.5 }}>
            <Car size={48} color="#cbd5e1" style={{marginBottom:'10px'}} />
            <p style={{color:'#64748b', fontWeight:'600'}}>No trips assigned for today</p>
          </div>
        )}
      </main>

      {/* COMPACT PUNCH MODAL */}
      {showPunchModal && (
        <div className="punch-modal-overlay">
          <div className="modal-box">
            <h3 style={{ margin: 0, fontSize: "20px", color:"#1a1a1a", fontWeight:"800" }}>Verify Identity</h3>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
              Requirement: Driver Selfie
            </p>
            <div className="preview-circle">
              <img
                src={preview}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                alt="Selfie"
              />
            </div>
            <button
              className="btn-action btn-in"
              style={{ width: "100%" }}
              onClick={handleAttendanceSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                "CONFIRM SUBMISSION"
              )}
            </button>
            <button
              onClick={() => {
                setShowPunchModal(false);
                setPreview(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                marginTop: "16px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                padding: "8px"
              }}
            >
              Cancel & Retake
            </button>
          </div>
        </div>
      )}

      {/* SOS BUTTON */}
      <a
        href="#"
        className="sos-fab"
        onClick={(e) => {
          e.preventDefault();

          // Trigger a confirmation toast
          toast(
            (t) => (
              <div style={{ textAlign: "center", padding: "8px" }}>
                <div
                  style={{ fontWeight: 800, marginBottom: 8, color: "#ef4444", fontSize:"16px" }}
                >
                  🚨 EMERGENCY SOS
                </div>
                <div
                  style={{ fontSize: 13, marginBottom: 16, color: "#555" }}
                >
                  This will alert the admin immediately. Are you sure?
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => {
                      toast.dismiss(t.id);
                      // Here you would normally call your API: api.post('/admin/sos', { driverId: profile.driverId });
                      toast.error("🚨 SOS SENT TO ADMIN!", {
                        duration: 5000,
                        style: {
                          background: "#ffffff",
                          color: "#1a1a1a",
                          border: "2px solid #ef4444",
                          fontWeight: "700"
                        },
                      });
                    }}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 10,
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    YES, SEND
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                      background: "#f3f4f6",
                      color: "#4b5563",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ),
            { duration: 8000, position: "top-center" }
          );
        }}
      >
        <PhoneCall size={28} strokeWidth={2.5} />
      </a>

      <input
        type="file"
        accept="image/*"
        capture="user"
        id="cameraInput"
        hidden
        onChange={handleCapture}
      />
    </div>
  );
};

export default DashboardPage;