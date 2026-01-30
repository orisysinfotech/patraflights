import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, User, FileText, History, ClipboardList, Bell, LogOut, ShieldCheck, Menu, ChevronDown } from "lucide-react";
import "./AppLayout.css";

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const navItems = [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
        {
        label: "Flight Master Module",
        icon: History,
       children: [
           { label: "Country Name", path: "/master/manage-country" },
            // { label: "Monthly Attendance", path: "/driverAttendance/monthly" },
            { label: "City Name", path: "/master/manage-city" },
            { label: "Airline Details", path: "/master/manage-airline-details" },
            { label: "Cabin Types", path: "/master/manage-cabin" },
            { label: "Airport Details", path: "/master/Airportdetails" },
        ],
      },
       {
        label: "Flight Module",
        icon: History,
        children: [
          { label: "Manage Route", path: "/manageroute" },
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
        label: "Hotel Module",
             icon: User,
             children: [
               { label: "Prepare Salary", path: "/salary/prepare" },
               { label: "Confirm Salary", path: "/salary/confirm-salary" },
               { label: "Salary Slip", path: "/salary/salary-slip" },
             ],
      },
  
       {
        label: "CMS",
        path: "/sos",
        icon: FileText,
      },
    ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleLogout = () => {
    localStorage.clear();
    // navigate("/login", { replace: true });
     window.location.href = "http://orisys12/patratravels/admin/home.php";
  };

  return (
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-p">P</span>
          {!collapsed && (
            <>
              <span className="logo-atra">ATRA</span>
              <span className="logo-travels">TOURS AND TRAVELS</span>
            </>
          )}
        </div>

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
                      <ChevronDown size={16} className={`arrow ${opened ? "rotate" : ""}`} />
                    )}
                  </div>
                  {opened && (
                    <div className="submenu">
                      {item.children.map((sub) => (
                        <div
                          key={sub.path}
                          className={`submenu-item ${isActive(sub.path) ? "active" : ""}`}
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
                className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer" onClick={handleLogout}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <header className="topbar">
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            <Menu size={22} />
          </button>

          

          <div className="top-actions">
            {/* <button onClick={() => navigate("/reset-mpin")}>
              <ShieldCheck size={20} />
            </button> */}
            {/* <button className="notify">
              <Bell size={20} />
              <span className="dot" />
            </button> */}
            <button onClick={handleLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="content">
          {/* <div className="dashboard-welcome">
            <h2>Welcome To <span className="italic-text">Admin Interface</span></h2>
         
            <h3 className="brand-text">PATRA TOURS AND TRAVELS</h3>
          </div> */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
