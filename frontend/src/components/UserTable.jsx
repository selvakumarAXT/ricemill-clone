import TableList from './common/TableList';
import Button from './common/Button';
import CommonSearchField from './common/CommonSearchField';
import FormSelect from './common/FormSelect';
import { useSelector } from 'react-redux';

const UserTable = ({
  users,
  branches,
  roles = [],
  userFilter,
  userRoleFilter,
  userBranchFilter,
  setUserFilter,
  setUserRoleFilter,
  setUserBranchFilter,
  openUserModal,
  deleteUser,
}) => {
  const { user } = useSelector((state) => state.auth);
  // Filtered users logic can be handled outside or inside this component
  const filteredUsers = users.filter(u => u.id !== user?.id);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center ">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button onClick={() => openUserModal()} variant="primary" icon="add">New User</Button>
      </div>
      <div className=" flex flex-wrap gap-2 items-center">
        <CommonSearchField
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          placeholder="Search users..."
        />
        <FormSelect
          value={userRoleFilter}
          onChange={e => setUserRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </FormSelect>
        {user?.isSuperAdmin && (
          <FormSelect
            value={userBranchFilter}
            onChange={e => setUserBranchFilter(e.target.value)}
          >
            <option value="">All Branches</option>
            {branches && branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
          </FormSelect>
        )}
      </div>
      <TableList
        columns={["Name", "Email", "Role", "Branch"]}
        data={filteredUsers}
        renderRow={u => [
          u.name,
          u.email,
          u.role,
          u.branch ? `${u.branch.name} (${u.branch.code})` : '',
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
            <p><strong>Branch:</strong> {u.branch ? `${u.branch.name} (${u.branch.code})` : 'N/A'}</p>
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