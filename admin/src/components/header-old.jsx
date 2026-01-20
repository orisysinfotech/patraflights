import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  FileText,
  History,
  ClipboardList,
  Bell,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Menu,
} from "lucide-react";
import api from "../api/Api";
import toast from "react-hot-toast";
import "./AppLayout.css";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const driverRegNo = localStorage.getItem("driverRegNo");

  const [activeTripId, setActiveTripId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  /* ===== FETCH ACTIVE TRIP ===== */
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await api.get(
          `/driver/assigned-trip?driver_regno=${driverRegNo}`
        );
        setActiveTripId(res.data?.drv_tripid || null);
      } catch {
        setActiveTripId(null);
      }
    };
    fetchTrip();
  }, [driverRegNo]);

  const isActive = (path) =>
    location.pathname === path ||
    location.pathname.startsWith(path + "/");

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Driver Attendance",
      icon: History,
      children: [
        { label: "Daily Attendance", path: "/driverAttendance/daily" },
        { label: "Monthly Attendance", path: "/driverAttendance/monthly" },
      ],
    },
    // {
    //   label: "Documents",
    //   path: "/documents",
    //   icon: FileText,
    // },
    // {
    //   label: "Attendance",
    //   path: "/attendance-history",
    //   icon: User,
    // },
    {
      label: "Master",
      icon: History,
      children: [
        { label: "Confirmation checklist", path: "/master/confirmation-checklist" },
        // { label: "Monthly Attendance", path: "/driverAttendance/monthly" },
      ],
    },
     {
      label: "Salary Process",
      path: "/attendance-history",
      icon: User,
    },

     {
      label: "Sos",
      path: "/sos",
      icon: FileText,
    },
  ];

  const goToTrip = () => {
    if (!activeTripId) return toast.error("No active trip");
    navigate(`/my-trips/${activeTripId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        {/* LOGO */}
        <div className="sidebar-logo">
          <span className="logo-p">P</span>
          {!collapsed && (
            <>
              <span className="logo-atra">ATRA</span>
              <span className="logo-travels">TRAVELS</span>
            </>
          )}
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const opened = openMenu === item.label && !collapsed;

              return (
                <div key={item.label}>
                  <div
                    className={`sidebar-item ${opened ? "active" : ""}`}
                    onClick={() =>
                      collapsed
                        ? setCollapsed(false)
                        : setOpenMenu(opened ? null : item.label)
                    }
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={`arrow ${opened ? "rotate" : ""}`}
                      />
                    )}
                  </div>

                  {opened && (
                    <div className="submenu">
                      {item.children.map((sub) => (
                        <div
                          key={sub.path}
                          className={`submenu-item ${
                            isActive(sub.path) ? "active" : ""
                          }`}
                          onClick={() => navigate(sub.path)}
                        >
                          {sub.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={item.path}
                className={`sidebar-item ${
                  isActive(item.path) ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            );
          })}

          {/* <div
            className={`sidebar-item ${
              isActive("/my-trips") ? "active" : ""
            }`}
            onClick={goToTrip}
          >
            <ClipboardList size={18} />
            {!collapsed && <span>Active Trip</span>}
          </div> */}
        </nav>

        {/* LOGOUT */}
        <div className="sidebar-footer" onClick={handleLogout}>
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="main">
        {/* TOPBAR */}
        <header className="topbar">
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={22} />
          </button>

          <div className="top-actions">
            <button onClick={() => navigate("/reset-mpin")}>
              <ShieldCheck size={20} />
            </button>

            <button className="notify">
              <Bell size={20} />
              <span className="dot" />
            </button>

            <button onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
