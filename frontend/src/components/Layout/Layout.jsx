import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import branchService from '../../services/branchService';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Branch switcher state
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');

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
          setBranches(res.data || []);
        } catch (err) {
          setBranches([]);
        }
      } else if (user?.branch) {
        setBranches([user.branch]);
      } else {
        setBranches([]);
      }
    };
    fetchBranches();
  }, [user]);

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
  };

  // Restore toggleSidebar function
  const toggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  if (!isAuthenticated) {
    return null; // or loading spinner
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} branches={branches} selectedBranchId={selectedBranchId} onBranchChange={handleBranchChange} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Navbar */}
        <Navbar
          toggleSidebar={toggleSidebar}
          branches={branches}
          selectedBranchId={selectedBranchId}
          onBranchChange={handleBranchChange}
        />

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto">
            {/* Pass selectedBranchId as context or prop if needed */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 