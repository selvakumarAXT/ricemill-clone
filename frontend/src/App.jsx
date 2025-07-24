import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { getMe } from "./store/slices/authSlice";
import store from "./store";

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
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/production"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <Production />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin", "manager"]}>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/branch-management"
          element={
            <ProtectedRoute allowedRoles={["superadmin"]}>
              <Layout>
                <BranchManagement />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback for undefined routes */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

// ✅ Wrap everything in Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
