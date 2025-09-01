import TableList from "./common/TableList";
import Button from "./common/Button";
import TableFilters from "./common/TableFilters";
import BranchFilter from "./common/BranchFilter";

import { useSelector } from "react-redux";

const UserTable = ({
  users,
  roles = [],
  userFilter,
  userRoleFilter,
  userBranchFilter,
  setUserFilter,
  setUserRoleFilter,
  setUserBranchFilter,
  openUserModal,
  deleteUser,
  showAddButton = true,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);

  // Filter out current user and superadmins
  const filteredUsers = users.filter(
    (u) => u._id !== user?._id && u.id !== user?.id && u.role !== "superadmin"
  );

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Users</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredUsers.length} users
          </p>
        </div>
        {showAddButton && (
          <Button
            onClick={() => openUserModal()}
            variant="success"
            icon="add"
            className="px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            New User
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
          <h3 className="text-lg font-semibold text-gray-800">
            User Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Total: {filteredUsers.length} users
          </p>
          {/* Filters moved inside table header */}
          {(setUserFilter || setUserRoleFilter || setUserBranchFilter) && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {setUserFilter && (
                  <TableFilters
                    searchValue={userFilter}
                    searchPlaceholder="Search users..."
                    onSearchChange={(e) => setUserFilter(e.target.value)}
                    selectValue={userRoleFilter}
                    selectOptions={roles}
                    onSelectChange={(e) => setUserRoleFilter(e.target.value)}
                    selectPlaceholder="All Roles"
                    showSelect={true}
                  />
                )}
                {setUserBranchFilter && (
                  <BranchFilter
                    value={
                      currentBranchId && currentBranchId !== "all"
                        ? currentBranchId
                        : userBranchFilter
                    }
                    onChange={(e) => setUserBranchFilter(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
        <TableList
          columns={["Name", "Email", "Role", "Branch", "Status"]}
          data={filteredUsers}
          renderRow={(u) => [
            <div key="name" className="font-medium text-gray-900">
              {u.name}
            </div>,
            <div key="email" className="text-gray-600">
              {u.email}
            </div>,
            <div key="role" className="capitalize text-gray-700">
              {u.role}
            </div>,
            <div key="branch" className="text-gray-600">
              {u.branch_id?.name || u.branch?.name || "N/A"}
            </div>,
            <div key="status">
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  u.isActive !== false
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {u.isActive !== false ? "Active" : "Inactive"}
              </span>
            </div>,
          ]}
          actions={(u) =>
            [
              <Button
                key="edit"
                onClick={() => openUserModal(u)}
                variant="info"
                icon="edit"
                className="text-xs"
              >
                Edit
              </Button>,
              user?.id !== u.id && user?._id !== u._id && (
                <Button
                  key="delete"
                  onClick={() => deleteUser(u._id || u.id)}
                  variant="danger"
                  icon="delete"
                  className="text-xs"
                >
                  Delete
                </Button>
              ),
            ].filter(Boolean)
          }
          renderDetail={(u) => (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{u.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <p className="text-gray-900 capitalize">{u.role}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Branch:</span>
                  <p className="text-gray-900">
                    {u.branch_id?.name || u.branch?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-900">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        u.isActive !== false
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button
                  onClick={() => openUserModal(u)}
                  variant="info"
                  icon="edit"
                  className="text-xs"
                >
                  Edit User
                </Button>
                {user?.id !== u.id && user?._id !== u._id && (
                  <Button
                    onClick={() => deleteUser(u._id || u.id)}
                    variant="danger"
                    icon="delete"
                    className="text-xs"
                  >
                    Delete User
                  </Button>
                )}
              </div>
            </div>
          )}
          getDeleteWarning={(user) =>
            `Are you sure you want to delete user "${user?.name}" (${user?.email})? This action cannot be undone.`
          }
        />
      </div>
    </div>
  );
};

export default UserTable;
