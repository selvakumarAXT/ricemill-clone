import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { setCurrentBranchId } from "../../store/slices/branchSlice";
import { useBranchRefresh } from "../../hooks/useBranchRefresh";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentBranchId, refreshTrigger } = useSelector(
    (state) => state.branch
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use the custom hook for branch management
  const { refreshBranches, availableBranches, isLoading } = useBranchRefresh();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, navigate]);

  // Initial fetch of branches when user changes
  useEffect(() => {
    if (user) {
      refreshBranches();
    }
  }, [user, refreshBranches]);

  // Listen for refresh triggers (e.g., from branch management operations)
  useEffect(() => {
    if (refreshTrigger > 0 && user) {
      refreshBranches();
    }
  }, [refreshTrigger, user, refreshBranches]);

  const handleBranchChange = (branchId) => {
    dispatch(setCurrentBranchId(branchId));
  };

  // Restore toggleSidebar function
  const toggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  if (!isAuthenticated) {
    return null; // or loading spinner
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        branches={availableBranches}
        selectedBranchId={currentBranchId}
        onBranchChange={handleBranchChange}
        isLoading={isLoading}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container py-6">
            {/* Pass selectedBranchId as context or prop if needed */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
