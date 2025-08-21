import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "./store/slices/authSlice";

import SignIn from "./components/SignIn";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import Production from "./pages/Production";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import BranchManagement from "./pages/BranchManagement";
import Layout from "./components/Layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import PaddyManagement from "./pages/PaddyManagement";
import GunnyManagement from "./pages/GunnyManagement";
import RiceManagement from "./pages/RiceManagement";
import SalesDispatch from "./pages/SalesDispatch";
import QCDataEntry from "./pages/QCDataEntry";
import VendorManagement from "./pages/VendorManagement";
import FinancialLedger from "./pages/FinancialLedger";
import EBMeterCalculation from "./pages/EBMeterCalculation";
import DocumentUploads from "./pages/DocumentUploads";
import ByproductsSales from "./pages/ByproductsSales";


// ✅ Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading, token } = useSelector(
    (state) => state.auth
  );

  if (isLoading || (token && !user)) {
    return <LoadingSpinner fullPage />;
  }

  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "2rem",
          color: "red",
          fontWeight: "bold",
        }}
      >
        Not authorized to access this page.
      </div>
    );
  }

  return children;
};

// ✅ Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// ✅ App Content (wrapped in Provider)
function AppContent() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  // Layout wrapper - no longer needs to inject selectedBranchId since we use Redux
  const LayoutWrapper = ({ children }) => {
    return <Layout>{children}</Layout>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />

        <Route
          path="/signin"
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Dashboard />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/paddy-entries"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <PaddyManagement />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/gunny-management"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <GunnyManagement />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rice-management"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <RiceManagement />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />



        <Route
          path="/sales-dispatch"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <SalesDispatch />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/byproducts-sales"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <ByproductsSales />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/qc-data-entry"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <QCDataEntry />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/vendor-management"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <VendorManagement />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/financial-ledger"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <FinancialLedger />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/eb-meter-calculation"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <EBMeterCalculation />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/document-uploads"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <DocumentUploads />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
              <LayoutWrapper>
                <UserManagement />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/production"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <Production />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Inventory />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager", "superadmin"]}>
              <LayoutWrapper>
                <Reports />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Settings />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/branch-management"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <LayoutWrapper>
                <BranchManagement />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />

        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

// ✅ Main App Component
function App() {
  return <AppContent />;
}

export default App;
