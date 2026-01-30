import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import AppLayout from "../components/header.jsx";

// Pages
import AuthPage from "../pages/LoginPage.jsx";
// import DashboardPage from "../pages/DashboardPage.jsx";

import Dashboard from "../pages/Dashboard.jsx";
import CountryNamePage from "../pages/CountryNamePage.jsx";
import EditCountry from "../pages/EditCountry.jsx";
import CityNamePage from "../pages/CityNamePage.jsx";
import AddCity from "../pages/AddCity.jsx";
import CountryAdd from "../pages/AddCountry.jsx";
import ManageAirLinesDtls from "../pages/ManageAirLinesDtls.jsx";
import AddAirLinesDtls from "../pages/AddAirline.jsx";
import EditAirlineDtls from "../pages/EditAirline.jsx";
import ManageCabinTypes from "../pages/ManageCabin.jsx";
import AddCabinTypes from "../pages/AddCabin.jsx";
// Components
import PrivateRoute from "../components/PrivateRoute.jsx";

import Airport from "../pages/ManageAirport.jsx";
import AddAirport from "../pages/AddAirport.jsx";
import Manageroute from "../pages/Manageroute.jsx";
import Addroute from "../pages/Addroute.jsx";
import EditAirportDetails from "../pages/EditAirportDetails.jsx";

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
        <Route path="/edit-country/:id" element={<EditCountry />} />
        <Route path="/master/manage-city" element={<CityNamePage />} />
        <Route path="/master/add-city" element={<AddCity />} />
        <Route path="/master/manage-airline-details" element={<ManageAirLinesDtls />} />
        <Route path="/master/add-airline" element={<AddAirLinesDtls />} />
        <Route path="/edit-airline/:id" element={<EditAirlineDtls />} />
        <Route path="/master/manage-cabin" element={<ManageCabinTypes />} />
        <Route path="/master/add-cabin" element={<AddCabinTypes />} />
        <Route path="/master/Airportdetails" element={<Airport />} />
        <Route path="/add-airport" element={<AddAirport />} />
        <Route path="/manageroute" element={<Manageroute />} />
        <Route path="/add-route" element={<Addroute />} />
        <Route path="/edit-airport/:id" element={<EditAirportDetails />} />

        {/* <Route path="/edit-route" element={<EditRoute />} /> */}
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