import React from "react";
import toast from "react-hot-toast";
import api from "../api/Api"; // ✅ axios instance

const SosPage = () => {
  const sendSOS = async () => {
    try {
      const res = await api.get("/trigger"); // ✅ correct backend route

      toast.success(res.data.message || "SOS sent successfully");
    } catch (err) {
      console.error("SOS Error:", err.response || err);
      toast.error(
        err.response?.data?.message || "Failed to send SOS"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>SOS Alert</h2>
      <button
        onClick={sendSOS}
        style={{
          background: "red",
          color: "white",
          padding: "10px 20px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Send SOS
      </button>
    </div>
  );
};

export default SosPage;
