import React, { useEffect, useState } from "react";
import api from "../api/Api.js"; // Ensure this path is correct
import { 
  MapPin, Phone, Mail, Clock, CheckCircle, AlertTriangle, 
  ChevronLeft, ChevronRight 
} from "lucide-react";

const SOSAdminPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Function to fetch data
  const fetchAlerts = async () => {
    try {
      const response = await api.get("/sos/all");
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and auto-refresh every 10 seconds
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); 
    return () => clearInterval(interval);
  }, []);

  // Handle Status Update
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Pending" ? "Resolved" : "Pending";
    try {
      await api.put(`/sos/update-status/${id}`, { status: newStatus });
      
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.sos_id === id ? { ...alert, status: newStatus } : alert
        )
      );
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const openMap = (lat, lng) => {
    window.open(`http://maps.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = alerts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(alerts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="pageTitle1">
        <div style={{display:"flex", justifyContent:"space-between"}}>
      <h2 className="title">
        <AlertTriangle className="text-red-600" size={20} /> 
       SOS Emergency Alerts 
            <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              Total: {alerts.length}
            </span>
      </h2>
        <button 
            onClick={fetchAlerts}
            className="btn btn-success btn-sm"
          >
            Refresh
          </button>
      </div>
    </div>
 
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="">
        
        

        {/* Table Container */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-500 text-sm">Loading alerts data...</div>
          ) : (
            <>
              <div className="attendance-scroll">
                <table className="attendance-table driverAttendance-table">
                  <thead >
                    <tr>
                      <th className="p-3 border-b w-1/4">Driver Details</th>
                      <th className="p-3 border-b w-1/4">Contact</th>
                      <th className="p-3 border-b w-1/3">Location & Time</th>
                      <th className="p-3 border-b text-center w-24">Map</th>
                      <th className="p-3 border-b text-center w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {currentAlerts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-500">No SOS alerts found.</td>
                      </tr>
                    ) : (
                      currentAlerts.map((alert) => (
                        <tr key={alert.sos_id} className={`group hover:bg-gray-50 transition ${alert.status === 'Pending' ? 'bg-red-50/50' : ''}`}>
                          
                          {/* Driver Info */}
                          <td className="p-3 align-top">
                            <div className="font-semibold text-gray-800">
                              {alert.driver_fstname} {alert.driver_lstname}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Reg: {alert.driver_regno}</div>
                          </td>

                          {/* Contact Info */}
                          <td className="p-3 align-top">
                            <div className="flex items-center gap-2 mb-1">
                              <Phone size={12} className="text-blue-500" /> 
                              <a href={`tel:${alert.driver_phno}`} className="text-gray-700 hover:text-blue-600 hover:underline">{alert.driver_phno}</a>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs truncate max-w-[180px]" title={alert.driver_email}>
                              <Mail size={12} /> {alert.driver_email || "N/A"}
                            </div>
                          </td>

                          {/* Location & Time */}
                          <td className="p-3 align-top">
                            <div className="text-gray-800 line-clamp-1 mb-1" title={alert.location_name}>
                              {alert.location_name || "Fetching location..."}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Clock size={12} /> {formatDate(alert.trigger_time)}
                            </div>
                          </td>

                          {/* Map Button */}
                          <td className="p-3 text-center align-middle">
                            <button
                              onClick={() => openMap(alert.latitude, alert.longitude)}
                              className="btn btn-default btn-sm"
                              title="View on Google Maps"
                            >
                              <MapPin style={{color:"red"}} size={16} />
                            </button>
                          </td>

                          {/* Status Toggle */}
                          <td className="p-3 text-center align-middle">
                            <button
                              onClick={() => toggleStatus(alert.sos_id, alert.status)}
                              className={`w-full py-1 px-2 rounded text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5
                                ${alert.status === "Pending" 
                                  ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200" 
                                  : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                }`}
                            >
                              {alert.status === "Pending" ? (
                                <>Active</>
                              ) : (
                                <><CheckCircle size={12} /> Done</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
         <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-full shadow-sm border border-gray-200">

  {/* PREV */}
  <button
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
    className="w-8 h-8 flex items-center justify-center rounded-full 
      text-gray-500 hover:bg-gray-100 transition
      disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <ChevronLeft size={16} />
  </button>

  {/* PAGE NUMBERS */}
  {Array.from({ length: totalPages }, (_, i) => {
    const page = i + 1;
    return (
      <button
        key={page}
        onClick={() => paginate(page)}
        className={`w-8 h-8 rounded-full text-xs font-semibold transition-all
          ${
            currentPage === page
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
      >
        {page}
      </button>
    );
  })}

  {/* NEXT */}
  <button
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === totalPages}
    className="w-8 h-8 flex items-center justify-center rounded-full 
      text-gray-500 hover:bg-gray-100 transition
      disabled:opacity-40 disabled:cursor-not-allowed"
  >
    <ChevronRight size={16} />
  </button>
</div>

              )}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default SOSAdminPanel;