import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import AppLayout from "../components/header.jsx";

// Pages
import AuthPage from "../pages/LoginPage.jsx";
// import DashboardPage from "../pages/DashboardPage.jsx";

import Dashboard from "../pages/Dashboard.jsx";
import CountryNamePage from "../pages/CountryNamePage.jsx";
import CountryAdd from "../pages/AddCountry.jsx";
// Components
import PrivateRoute from "../components/PrivateRoute.jsx";

const AppRoutes = () => {
  const handleLogout = () => {
    // localStorage.removeItem("driverToken");
    // localStorage.removeItem("driverRegNo");
    // window.location.href = "/login";
  };

  return (
    <Routes>
      {/* ---------- PUBLIC ROUTES ---------- */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        element={
          <PrivateRoute>
            <AppLayout handleLogout={handleLogout} />
          </PrivateRoute>
        }
      >
        {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/master/manage-country" element={<CountryNamePage />} />
        <Route path="/Add-country" element={<CountryAdd />} />
      </Route>

      {/* ---------- 404 ---------- */}
      <Route
        path="*"
        element={<h1 style={notFoundStyle}>404 - Page Not Found</h1>}
      />
    </Routes>
  );
};

const notFoundStyle = {
  textAlign: "center",
  marginTop: "50px",
  color: "white",
  fontFamily: "Inter, sans-serif",
};

export default AppRoutes;