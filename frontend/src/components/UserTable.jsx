import TableList from './common/TableList';
import Button from './common/Button';
import TableFilters from './common/TableFilters';
import BranchFilter from './common/BranchFilter';
import ResponsiveFilters from './common/ResponsiveFilters';
import { useSelector } from 'react-redux';

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
  // Filtered users logic can be handled outside or inside this component
  const filteredUsers = users.filter(u => u.id !== user?.id);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-semibold">Users</h2>
        {showAddButton && (
          <Button onClick={() => openUserModal()} variant="primary" icon="add">New User</Button>
        )}
      </div>
      <ResponsiveFilters title="Filters & Search" className="mt-4">
        <TableFilters
          searchValue={userFilter}
          searchPlaceholder="Search users..."
          onSearchChange={e => setUserFilter(e.target.value)}
          selectValue={userRoleFilter}
          selectOptions={roles}
          onSelectChange={e => setUserRoleFilter(e.target.value)}
          selectPlaceholder="All Roles"
          showSelect={true}
        />
        <BranchFilter
          value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : userBranchFilter}
          onChange={e => setUserBranchFilter(e.target.value)}
        />
      </ResponsiveFilters>
      <TableList
        columns={["Name", "Email", "Role", "Branch"]}
        data={filteredUsers}
        renderRow={u => [
          u.name,
          u.email,
          u.role,
          u.branch ? `${u.branch.name} (${u.branch.millCode})` : '',
        ]}
        actions={u => [
          <Button key="edit" onClick={() => openUserModal(u)} variant="info" icon="edit">Edit</Button>,
          user?.id !== u.id && (
            <Button key="delete" onClick={() => deleteUser(u.id)} variant="danger" icon="delete">Delete</Button>
          )
        ].filter(Boolean)}
        renderDetail={u => (
          <div className="p-4">
            <p><strong>Email:</strong> {u.email}</p>
            <p><strong>Role:</strong> {u.role}</p>
            <p><strong>Branch:</strong> {u.branch ? `${u.branch.name} (${u.branch.millCode})` : 'N/A'}</p>
            <p><strong>Created At:</strong> {new Date(u.createdAt).toLocaleDateString()}</p>
            {user?.id !== u.id && (
              <Button key="delete-detail" onClick={() => deleteUser(u.id)} variant="danger" icon="delete">Delete</Button>
            )}
          </div>
        )}
        getDeleteWarning={user => `Are you sure you want to delete user "${user?.name}" (${user?.email})? This action cannot be undone.`}
      />
    </div>
  );
};

export default UserTable; 