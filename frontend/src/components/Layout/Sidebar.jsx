import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { setCurrentBranchId } from '../../store/slices/branchSlice';
import FormSelect from '../common/FormSelect';

const Sidebar = ({ isOpen, toggleSidebar, branches = [], selectedBranchId, onBranchChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [branchesOpen, setBranchesOpen] = useState(false);

  // Set currentBranchId to user's branch by default for non-superadmin
  useEffect(() => {
    // For non-superadmin, set to user's branch if not already set
    if (user && user.role !== 'superadmin' && user.branch && user.branch._id && currentBranchId !== user.branch._id) {
      dispatch(setCurrentBranchId(user.branch._id));
    }
    // eslint-disable-next-line
  }, [user, currentBranchId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/signin');
  };

  const handleBranchSelect = (branchId) => {
    dispatch(setCurrentBranchId(branchId));
    
    // Refresh the page after a short delay to ensure state is updated
    // setTimeout(() => {
    //   window.location.reload();
    // }, 100);
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      roles: ['admin', 'manager', ]
    },
    {
      name: 'User Management',
      path: '/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      roles: ['admin']
    },
    {
      name: 'Production',
      path: '/production',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      roles: ['admin', 'manager']
    },
    {
      name: 'Paddy Entry',
      path: '/paddy-entries',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      roles: ['admin', 'manager','superadmin']
    },
    {
      name: 'Gunny Management',
      path: '/gunny-management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ['admin', 'manager', 'superadmin']
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ['admin', 'manager',]
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      roles: ['admin', 'manager']
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      roles: ['admin', 'manager',]
    },

    // Branch Management (superadmin only)
    ...(user?.isSuperAdmin ? [
      {
        name: 'Branch Management',
        path: '/branch-management',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
          </svg>
        ),
        roles: ['superadmin']
      }
    ] : [])
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-3">
              <h1 className="text-white text-lg font-semibold hidden sm:block">Rice Mill</h1>
            </div>
          </div>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {/* Branches tree for superadmin */}
            {user?.isSuperAdmin && branches.length > 0 && (
              <div>
                <button
                  className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-150"
                  onClick={() => setBranchesOpen((open) => !open)}
                >
                  <span className="mr-2">🌳</span>
                  Branches
                  <span className="ml-auto">{branchesOpen ? '▼' : '▶'}</span>
                </button>
                {branchesOpen && (
                  <ul className="ml-6 mt-1 space-y-1">
                    <li key="all-branches">
                      <button
                        className={`w-full text-left px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${!currentBranchId ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                        onClick={() => handleBranchSelect('')}
                      >
                        All Branches
                      </button>
                    </li>
                    {branches.map(branch => (
                      <li key={branch._id}>
                        <button
                          className={`w-full text-left px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${currentBranchId === branch._id ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                          onClick={() => handleBranchSelect(branch._id)}
                        >
                          {branch.name} ({branch.millCode})
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {/* Show only the user's branch for non-superadmin */}
            {!user?.isSuperAdmin && user?.branch && (
              <div className="mb-2">
                <button
                  className={`w-full text-left px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 bg-indigo-600 text-white`}
                  disabled
                >
                  {user.branch.name} ({user.branch.millCode})
                </button>
              </div>
            )}
            {/* Only show other menu items if a branch is selected or not superadmin */}
            {(user?.isSuperAdmin || user?.branch) && filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                >
                  <span className="mr-3 flex-shrink-0">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* User info and logout */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="px-2 space-y-1">
              <div className="flex items-center px-2 py-2 text-sm text-gray-300">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                  {user?.branch_id && (
                    <p className="text-xs text-gray-500">{user.branch_id.name}</p>
                  )}
                  {/* Branch select for superadmin */}
                 
                </div>
                
              </div>
         
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150"
              >
                <svg className="mr-3 flex-shrink-0 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 