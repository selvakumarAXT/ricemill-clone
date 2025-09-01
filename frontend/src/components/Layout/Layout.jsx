import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import branchService from '../../services/branchService';
import { setCurrentBranchId, setAvailableBranches } from '../../store/slices/branchSlice';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Branch switcher state
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Fetch all branches for superadmin
    const fetchBranches = async () => {
      if (user?.role === "superadmin") {
        try {
          const res = await branchService.getAllBranches();
          const branchesData = res.data || [];
          setBranches(branchesData);
          dispatch(setAvailableBranches(branchesData));
        } catch (err) {
          setBranches([]);
          dispatch(setAvailableBranches([]));
        }
      } else if (user?.branch) {
        const branchesData = [user.branch];
        setBranches(branchesData);
        dispatch(setAvailableBranches(branchesData));
      } else {
        setBranches([]);
        dispatch(setAvailableBranches([]));
      }
    };
    fetchBranches();
  }, [user, dispatch]);

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
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} branches={branches} selectedBranchId={currentBranchId} onBranchChange={handleBranchChange} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Navbar */}
        <Navbar
          toggleSidebar={toggleSidebar}
        />

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