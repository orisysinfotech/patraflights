import React from "react";
import "./DashboardPage.css";
import banner from "../assets/flight2.jpg";

const DashboardPage = () => {
  return (
    <div className="dashboard">
      <div
        className="hero"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <h1>WELCOME TO PATRA FLIGHT BOOKING</h1>
      </div>
    </div>
  );
};

export default DashboardPage;
