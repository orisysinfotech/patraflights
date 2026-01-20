import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/Loader";

function App() {
  const [appInitializing, setAppInitializing] = useState(() => {
    return !sessionStorage.getItem("appInitialized");
  });

  useEffect(() => {
    if (!appInitializing) return;

    const timer = setTimeout(() => {
      sessionStorage.setItem("appInitialized", "true");
      setAppInitializing(false);
    }, 2000); // splash loader time

    return () => clearTimeout(timer);
  }, [appInitializing]);

  // STARTUP LOADER (Loader)
  if (appInitializing) {
    return <Loader message="CONNECTING PATRA ELITE DRIVERS..." />;
  }

  return (
    <Router>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 1000,
          style: {
            background: "#ffffff",
            color: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid #f0f0f0",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "'Inter', sans-serif",
            padding: "16px 24px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            maxWidth: "90%",
          },
          success: {
            iconTheme: { primary: "#10B981", secondary: "#fff" },
            style: {
              borderLeft: "6px solid #10B981",
              background: "#F0FDF4",
            },
          },
          error: {
            iconTheme: { primary: "#EF4444", secondary: "#fff" },
            style: {
              borderLeft: "6px solid #EF4444",
              background: "#FEF2F2",
            },
          },
          loading: {
            iconTheme: { primary: "#0062cc", secondary: "#fff" },
            style: { borderLeft: "6px solid #0062cc" },
          },
        }}
      />

      <AppRoutes />
    </Router>
  );
}

export default App;