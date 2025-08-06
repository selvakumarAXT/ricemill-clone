import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import userService from "../services/userService";
import branchService from "../services/branchService";
import FormInput from "../components/common/FormInput";
import DialogBox from "../components/common/DialogBox";
import Button from "../components/common/Button";
import UserTable from "../components/UserTable";
import FormSelect from "../components/common/FormSelect";

const ROLES = [
  { value: "manager", label: "Branch Manager" },
  { value: "admin", label: "Admin" }
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
    branch_id: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Filters for UserTable
  const [userFilter, setUserFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userBranchFilter, setUserBranchFilter] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);

  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);

  useEffect(() => {
    if (user?.isSuperAdmin) {
      fetchBranches();
      fetchUsers(currentBranchId);
    } else if (user?.branch?.id) {
      // No need to fetch branches for non-superadmin, use user.branch
      fetchUsers(user.branch.id);
    }
    // eslint-disable-next-line
  }, [currentBranchId, user]);

  const fetchUsers = async (branchId) => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(branchId);
      setUsers(response.users || response.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      if (user?.isSuperAdmin) {
        const response = await branchService.getAllBranches();
        setBranches(response.data);
      }
      // else: do not set branches for non-superadmin
    } catch (err) {
      console.error("Failed to fetch branches:", err);
    }
  };

  // Filtering logic (same as BranchManagement)
  const filteredUsers = users
    .filter((u) => u.role !== "superadmin")
    .filter((u) => u._id !== user?._id && u.id !== user?.id)
    .filter((u) => {
      const q = userFilter.toLowerCase();
      const matchesText =
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        (u.branch_id &&
          (u.branch_id.name?.toLowerCase().includes(q) ||
            u.branch_id.millCode?.toLowerCase().includes(q)));
      const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
      // Branch filter - use currentBranchId if set, otherwise use userBranchFilter
      const effectiveBranchFilter =
        currentBranchId && currentBranchId !== "all"
          ? currentBranchId
          : userBranchFilter;
      const matchesBranch = effectiveBranchFilter
        ? u.branch_id && (u.branch_id._id === effectiveBranchFilter || u.branch_id.id === effectiveBranchFilter)
        : true;
      return matchesText && matchesRole && matchesBranch;
    });

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id || editingUser.id, userForm);
        setSuccess("User updated successfully");
      } else {
        await userService.createUser(userForm);
        setSuccess("User created successfully");
      }
      // Refresh users list
      if (user?.isSuperAdmin) {
        fetchUsers(currentBranchId);
      } else if (user?.branch?.id) {
        fetchUsers(user.branch.id);
      }
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setSuccess("User deleted successfully");
      // Refresh users list
      if (user?.isSuperAdmin) {
        fetchUsers(currentBranchId);
      } else if (user?.branch?.id) {
        fetchUsers(user.branch.id);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (editUser = null) => {
    if (editUser) {
      setEditingUser(editUser);
      setUserForm({
        name: editUser.name || "",
        email: editUser.email || "",
        password: "",
        role: editUser.role || "manager",
        branch_id: editUser.branch_id?._id || editUser.branch_id?.id || editUser.branch?.id || "",
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: "",
        email: "",
        password: "",
        role: user?.isSuperAdmin ? "admin" : "manager",
        branch_id: user?.isSuperAdmin ? "" : user?.branch?.id || "",
      });
    }
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUserForm({
      name: "",
      email: "",
      password: "",
      role: "manager",
      branch_id: "",
    });
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage system users and their permissions
            </p>
          </div>
          
          {/* Add User Button */}
          {/* {((user?.isSuperAdmin && currentBranchId && currentBranchId !== 'all') || 
            (!user?.isSuperAdmin && user?.branch?.id)) && (
            <div className="flex justify-center sm:justify-start">
              <Button
                onClick={() => openUserModal()}
                variant="primary"
                icon="add"
                className="w-full sm:w-auto"
              >
                Add New User
              </Button>
            </div>
          )} */}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-1 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <div className="mt-1 text-sm text-green-700">{success}</div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              User Records
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Total: {filteredUsers.length} users
            </p>
          </div>

          <div className="p-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No users found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new user.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((userItem) => (
                  <div
                    key={userItem._id || userItem.id}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Mobile Table Row */}
                    <div
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setExpandedUser(
                          expandedUser === (userItem._id || userItem.id) ? null : (userItem._id || userItem.id)
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {userItem.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {userItem.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {userItem.role} • {userItem.branch_id?.name || userItem.branch?.name || "N/A"}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openUserModal(userItem);
                            }}
                            variant="info"
                            icon="edit"
                            className="text-xs px-2 py-1"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUser(userItem._id || userItem.id);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedUser === (userItem._id || userItem.id) ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail View */}
                    {expandedUser === (userItem._id || userItem.id) && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border-t border-gray-200">
                        {/* Details Grid */}
                        <div className="grid grid-cols-1 gap-3 text-sm mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Role:</span>
                            <span className="font-medium text-gray-900 capitalize">
                              {userItem.role}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Branch:</span>
                            <span className="font-medium text-gray-900">
                              {userItem.branch_id?.name || userItem.branch?.name || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Created:</span>
                            <span className="font-medium text-gray-900">
                              {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Status:
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                userItem.isActive !== false
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {userItem.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Table Component (for desktop) */}
        <div className="hidden lg:block">
          <UserTable
            users={filteredUsers}
            branches={branches}
            roles={ROLES}
            userFilter={user?.isSuperAdmin ? userFilter : ""}
            userRoleFilter={user?.isSuperAdmin ? userRoleFilter : ""}
            userBranchFilter={user?.isSuperAdmin ? userBranchFilter : ""}
            setUserFilter={user?.isSuperAdmin ? setUserFilter : undefined}
            setUserRoleFilter={
              user?.isSuperAdmin ? setUserRoleFilter : undefined
            }
            setUserBranchFilter={
              user?.isSuperAdmin ? setUserBranchFilter : undefined
            }
            openUserModal={openUserModal}
            deleteUser={deleteUser}
            showAddButton={((user?.isSuperAdmin && currentBranchId && currentBranchId !== 'all') || 
              (!user?.isSuperAdmin && user?.branch?.id))}
          />
        </div>
      </div>
      
      {/* User Modal */}
      {showModal && (
        <DialogBox
          show={showModal}
          onClose={closeModal}
          onSubmit={saveUser}
          title={editingUser ? "Edit User" : "Create New User"}
          submitText={editingUser ? "Update" : "Create"}
          cancelText="Cancel"
          error={error}
          success={success}
        >
          <form onSubmit={saveUser} className="space-y-4">
            <FormInput
              label="Name"
              name="name"
              value={userForm.name}
              onChange={handleUserFormChange}
              required
              icon="user"
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={userForm.email}
              onChange={handleUserFormChange}
              required
              icon="mail"
            />
            {!editingUser && (
              <FormInput
                label="Password"
                name="password"
                value={userForm.password}
                onChange={handleUserFormChange}
                required
                type="password"
                icon="lock"
                minLength={6}
              />
            )}
            <FormSelect
              label="Role"
              name="role"
              value={userForm.role}
              onChange={handleUserFormChange}
              required
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </FormSelect>
            {user?.isSuperAdmin ? (
              <FormSelect
                label="Branch"
                name="branch_id"
                value={userForm.branch_id}
                onChange={handleUserFormChange}
                required
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.millCode})
                  </option>
                ))}
              </FormSelect>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Branch
                </label>
                <input
                  type="text"
                  value={
                    user?.branch
                      ? `${user.branch.name} (${user.branch.millCode})`
                      : "No Branch"
                  }
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                />
              </div>
            )}
          </form>
        </DialogBox>
      )}
    </div>
  );
};

export default UserManagement;
