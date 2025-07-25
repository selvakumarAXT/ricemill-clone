import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import userService from '../services/userService';
import branchService from '../services/branchService';
import FormInput from '../components/common/FormInput';
import DialogBox from '../components/common/DialogBox';
import Button from '../components/common/Button';
import UserTable from '../components/UserTable';
import FormSelect from '../components/common/FormSelect';

const ROLES = [
  { value: 'admin', label: 'Branch Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'qc', label: 'QC Officer' },
  { value: 'sales', label: 'Sales Staff' },
];

const UserManagement = ({ selectedBranchId }) => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'sales', branch_id: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Filters for UserTable
  const [userFilter, setUserFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userBranchFilter, setUserBranchFilter] = useState('');

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.isSuperAdmin) {
      fetchBranches();
      fetchUsers(selectedBranchId);
    } else if (user?.branch?.id) {
      // No need to fetch branches for non-superadmin, use user.branch
      fetchUsers(user.branch.id);
    }
    // eslint-disable-next-line
  }, [selectedBranchId, user]);

  const fetchUsers = async (branchId) => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers(branchId);
      setUsers(response.users);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch users');
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
      console.error('Failed to fetch branches:', err);
    }
  };

  // Filtering logic (same as BranchManagement)
  const filteredUsers = users
    .filter(u => u.role !== 'superadmin')
    .filter(u => u.id !== user?.id)
    .filter(u => {
      const q = userFilter.toLowerCase();
      const matchesText = (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        (u.branch_id && (
          u.branch_id.name?.toLowerCase().includes(q) ||
          u.branch_id.code?.toLowerCase().includes(q)
        ))
      );
      const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
      const matchesBranch = userBranchFilter ? (u.branch_id && u.branch_id._id === userBranchFilter) : true;
      return matchesText && matchesRole && matchesBranch;
    });

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id, userForm);
        setSuccess('User updated successfully');
      } else {
        await userService.createUser(userForm);
        setSuccess('User created successfully');
      }
      fetchUsers();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter(u => u._id !== userId));
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = (editUser = null) => {
    if (editUser) {
      setEditingUser(editUser);
      setUserForm({
        name: editUser.name,
        email: editUser.email,
        password: '',
        role: editUser.role,
        branch_id: editUser.branch_id || editUser.branch?.id || '',
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        password: '',
        role: 'sales',
        branch_id: user?.isSuperAdmin ? '' : (user?.branch?.id || ''),
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'sales', branch_id: '' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">
            Manage system users and their permissions
          </p>
        </div>
      </div>
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      <UserTable
        users={filteredUsers}
        branches={branches}
        roles={ROLES}
        userFilter={user?.isSuperAdmin ? userFilter : ''}
        userRoleFilter={user?.isSuperAdmin ? userRoleFilter : ''}
        userBranchFilter={user?.isSuperAdmin ? userBranchFilter : ''}
        setUserFilter={user?.isSuperAdmin ? setUserFilter : undefined}
        setUserRoleFilter={user?.isSuperAdmin ? setUserRoleFilter : undefined}
        setUserBranchFilter={user?.isSuperAdmin ? setUserBranchFilter : undefined}
        openUserModal={openUserModal}
        deleteUser={deleteUser}
      />
      {showModal && (
        <DialogBox
          isOpen={showModal}
          onClose={closeModal}
          onSubmit={saveUser}
          title={editingUser ? 'Edit User' : 'Create New User'}
          submitText={editingUser ? 'Update' : 'Create'}
          cancelText="Cancel"
          error={error}
          success={success}
        >
          <form onSubmit={saveUser} className="space-y-4">
            <FormInput label="Name" name="name" value={userForm.name} onChange={handleUserFormChange} required icon="user" />
            <FormInput label="Email" name="email" value={userForm.email} onChange={handleUserFormChange} required icon="user" />
            {!editingUser && (
              <FormInput label="Password" name="password" value={userForm.password} onChange={handleUserFormChange} required type="password" icon="lock" />
            )}
            <FormSelect label="Role" name="role" value={userForm.role} onChange={handleUserFormChange} required>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </FormSelect>
            {user?.isSuperAdmin ? (
              <FormSelect label="Branch" name="branch_id" value={userForm.branch_id} onChange={handleUserFormChange} required>
                <option value="">Select Branch</option>
                {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
              </FormSelect>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input
                  type="text"
                  value={user?.branch ? `${user.branch.name} (${user.branch.code})` : 'No Branch'}
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                />
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" icon="save">{editingUser ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogBox>
      )}
    </div>
  );
};

export default UserManagement; 