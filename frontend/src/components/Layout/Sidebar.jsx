import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { setCurrentBranchId } from "../../store/slices/branchSlice";
import FormSelect from "../common/FormSelect";
import Icon from "../common/Icon";

const Sidebar = ({
  isOpen,
  toggleSidebar,
  branches = [],
  selectedBranchId,
  onBranchChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [branchesOpen, setBranchesOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Initialize collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    setCollapsed(stored === "1");
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      return next;
    });
  };

  // Set currentBranchId to user's branch by default for non-superadmin
  useEffect(() => {
    // For non-superadmin, set to user's branch if not already set
    if (
      user &&
      user.role !== "superadmin" &&
      user.branch &&
      user.branch._id &&
      currentBranchId !== user.branch._id
    ) {
      dispatch(setCurrentBranchId(user.branch._id));
    }
    // eslint-disable-next-line
  }, [user, currentBranchId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
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
      name: "Dashboard",
      path: "/dashboard",
      icon: <Icon name="dashboard" />,
      roles: ["admin", "manager", "superadmin"],
    },
    {
      name: "User Management",
      path: "/users",
      icon: <Icon name="users" />,
      roles: ["admin"],
    },
    {
      name: "Paddy Entry",
      path: "/paddy-entries",
      icon: <Icon name="paddy" />,
      roles: ["admin", "manager", "superadmin"],
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Icon name="inventory" />,
      roles: ["admin", "manager", "superadmin"],
    },


    {
      name: "Rice Management",
      path: "/rice-management",
      icon: <Icon name="rice" />,
      roles: ["admin", "manager", "superadmin"],
    },
    {
      name: "Gunny Management",
      path: "/gunny-management",
      icon: <Icon name="gunny" />,
      roles: ["admin", "manager", "superadmin"],
    },
    // {
    //   name: 'QC Data Entry',
    //   path: '/qc-data-entry',
    //   icon: <Icon name="qc" />,
    //   roles: ['admin', 'manager', 'superadmin']
    // },
    {
      name: "Vendor Management",
      path: "/vendor-management",
      icon: <Icon name="vendor" />,
      roles: ["admin", "manager", "superadmin"],
    },

    {
      name: "EB Meter Calculation",
      path: "/eb-meter-calculation",
      icon: <Icon name="ebMeter" />,
      roles: ["admin", "manager", "superadmin"],
    },
    {
      name: "Financial Ledger",
      path: "/financial-ledger",
      icon: <Icon name="financial" />,
      roles: ["admin", "manager", "superadmin"],
    },
    {
      name: "Sales & Dispatch",
      path: "/sales-dispatch",
      icon: <Icon name="sales" />,
      roles: ["admin", "manager", "superadmin"],
    },
    // Branch Management (superadmin only)
    ...(user?.role === "superadmin"
      ? [
          {
            name: "Branch Management",
            path: "/branch-management",
            icon: <Icon name="branch" />,
            roles: ["superadmin"],
          },
        ]
      : []),
    {
      name: "Document Uploads",
      path: "/document-uploads",
      icon: <Icon name="documents" />,
      roles: ["admin", "manager", "superadmin"],
    },

    {
      name: "Settings",
      path: "/settings",
      icon: <Icon name="settings" />,
      roles: ["admin", "manager", "superadmin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 transition-opacity lg:hidden z-20"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-72"} transition-[width]`}
      >
        {/* Sidebar Container with Flex Layout */}
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex items-center h-16 bg-muted px-3">
            <div className={`flex items-center ${collapsed ? "lg:justify-center w-full" : ""}`}>
              <div className="flex-shrink-0">
                <Icon name="rice" className="h-8 w-8 text-foreground" />
              </div>
              {!collapsed && (
                <div className="ml-3">
                  <h1 className="text-foreground text-lg font-semibold hidden sm:block">
                    Rice Mill
                  </h1>
                </div>
              )}
            </div>
            <button
              onClick={toggleCollapse}
              className="ml-auto hidden lg:inline-flex p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/40 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Icon
                name={collapsed ? "chevronDoubleRight" : "chevronDoubleLeft"}
                className="h-5 w-5"
              />
            </button>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="px-2 py-4">
              <div className="space-y-1">
                {/* Only show other menu items if a branch is selected or not superadmin */}
                {(user?.role === "superadmin" || user?.branch) &&
                  filteredMenuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`${
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        } group flex items-center ${collapsed ? "justify-center" : ""} px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150`}
                        onClick={() =>
                          window.innerWidth < 1024 && toggleSidebar()
                        }
                      >
                        <span className={`${collapsed ? "mr-0" : "mr-3"} flex-shrink-0 h-5 w-5`}>{item.icon}</span>
                        {!collapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </nav>

          {/* Branches Selection - Fixed above user info */}
          {(user?.role === "superadmin" || user?.branch) && (
            <div className="flex-shrink-0 border-t border-border">
              <div className="px-2 py-3">
                {/* Branches tree for superadmin */}
                {user?.role === "superadmin" && branches.length > 0 && (
                  <div>
                    <button
                      className={`flex items-center w-full px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors duration-150 ${collapsed ? "justify-center" : ""}`}
                      onClick={() => setBranchesOpen((open) => !open)}
                    >
                      <Icon name="branch" className={`h-4 w-4 ${collapsed ? "" : "mr-2"}`} />
                      {!collapsed && (
                        <>
                          Branches
                          <span className="ml-auto">{branchesOpen ? "▼" : "▶"}</span>
                        </>
                      )}
                    </button>
                    {branchesOpen && !collapsed && (
                      <ul className="ml-6 mt-1 space-y-1">
                        <li key="all-branches">
                          <button
                            className={`w-full text-left px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                              !currentBranchId
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                            onClick={() => handleBranchSelect("")}
                          >
                            All Branches
                          </button>
                        </li>
                        {branches
                          .slice()
                          .reverse()
                          .map((branch) => (
                            <li key={branch._id}>
                              <button
                                className={`w-full text-left px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                                  currentBranchId === branch._id
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
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
                {user?.role !== "superadmin" && user?.branch && !collapsed && (
                  <div>
                    <button
                      className={`w-full text-left px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 bg-primary text-primary-foreground`}
                      disabled
                    >
                      {user.branch.name} ({user.branch.millCode})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User info and logout - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-border">
            <div className="px-2 py-4 space-y-1">
              <div className="flex items-center px-2 py-2 text-sm text-muted-foreground">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-foreground text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                {!collapsed && (
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {user?.role}
                    </p>
                    {user?.branch_id && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.branch_id.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className={`text-muted-foreground hover:bg-muted hover:text-foreground group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${collapsed ? "justify-center" : ""}`}
              >
                <Icon name="logout" className={`${collapsed ? "" : "mr-3"} flex-shrink-0 h-5 w-5`} />
                {!collapsed && "Logout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
