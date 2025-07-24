import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import userService from '../services/userService';
import branchService from '../services/branchService';
import FormInput from '../components/common/FormInput';
import DialogBox from '../components/common/DialogBox';
import Button from '../components/common/Button';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    branch_id: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      setUsers(response.data.users);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      // Only super admins can see all branches
      if (user?.isSuperAdmin) {
        const response = await branchService.getAllBranches();
        setBranches(response.data);
      } else {
        // Regular admins can only see their own branch
        const response = await branchService.getMyBranch();
        if (response.data) {
          setBranches([response.data]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingUser) {
        // Update user
        await userService.updateUser(editingUser._id, formData);
        setSuccess('User updated successfully');
      } else {
        // Create new user
        await userService.createUser(formData);
        setSuccess('User created successfully');
      }
      
      fetchUsers();
      closeModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        setSuccess('User deleted successfully');
        fetchUsers();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userService.updateUser(userId, { isActive: !currentStatus });
      setSuccess('User status updated successfully');
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        branch_id: user.branch_id?._id || '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        branch_id: '',
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
    });
  };

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-gray-600">
              Manage system users and their permissions
            </p>
          </div>
          <Button onClick={() => openModal()} variant="primary">
            Add New User
          </Button>
        </div>

          {/* Alerts */}
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

          {/* Users Table */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.branch_id ? `${user.branch_id.name} (${user.branch_id.code})` : 'No Branch'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          variant={user.isActive ? 'success' : 'danger'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button onClick={() => openModal(user)} variant="primary">
                          Edit
                        </Button>
                        {user._id !== user?._id && (
                          <Button onClick={() => handleDelete(user._id)} variant="danger">
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* Modal */}
      {showModal && (
        <DialogBox
          isOpen={showModal}
          onClose={closeModal}
          onSubmit={handleSubmit}
          title={editingUser ? 'Edit User' : 'Create New User'}
          submitText={editingUser ? 'Update' : 'Create'}
          cancelText="Cancel"
          error={error}
          success={success}
        >
          <div className="space-y-4">
            <FormInput label="Name" name="name" value={formData.name} onChange={handleInputChange} required />

            <FormInput label="Email" name="email" value={formData.email} onChange={handleInputChange} required disabled={editingUser} />

            <FormInput
              label={editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Branch selection - only show for super admin */}
            {user?.isSuperAdmin && branches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name} ({branch.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Show current branch for non-super admin */}
            {!user?.isSuperAdmin && branches.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Branch</label>
                <input
                  type="text"
                  value={branches[0] ? `${branches[0].name} (${branches[0].code})` : 'No Branch'}
                  disabled
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm"
                />
              </div>
            )}
          </div>
        </DialogBox>
      )}
    </>
  );
};

export default UserManagement; 