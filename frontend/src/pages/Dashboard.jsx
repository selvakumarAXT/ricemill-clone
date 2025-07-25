import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
// import dashboardService from '../services/dashboardService'; // Uncomment and implement as needed
import { getMe } from '../store/slices/authSlice';

const Dashboard = ({ selectedBranchId }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  // const [stats, setStats] = useState(null); // Uncomment if you have stats

  useEffect(() => {
    // Example: Fetch dashboard stats filtered by selectedBranchId
    // const fetchStats = async () => {
    //   const res = await dashboardService.getStats(selectedBranchId);
    //   setStats(res);
    // };
    // fetchStats();
    // For now, just ensure user is loaded
    if (!user) {
      dispatch(getMe());
    }
  }, [dispatch, user, selectedBranchId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {user?.name}! Here's what's happening with your rice mill today.
        </p>
      </div>
      {/* You can now use selectedBranchId to filter all dashboard data */}
      {/* ...rest of your dashboard UI... */}
    </div>
  );
};

export default Dashboard; 