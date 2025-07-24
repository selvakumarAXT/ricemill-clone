import { useEffect, useState } from 'react';
import branchManagementService from '../services/branchManagementService';
import branchService from '../services/branchService';
import userService from '../services/userService';
import { useSelector } from 'react-redux';
import FormInput from '../components/common/FormInput';
import FormSelect from '../components/common/FormSelect';
import DialogBox from '../components/common/DialogBox';
import Button from '../components/common/Button';
import WarningBox from '../components/common/WarningBox';
import TableList from '../components/common/TableList';

const ROLES = [
  { value: 'admin', label: 'Branch Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'qc', label: 'QC Officer' },
  { value: 'sales', label: 'Sales Staff' },
];

const TABS = [
  { key: 'branches', label: 'Branches' },
  { key: 'users', label: 'Users' },
];

const BranchManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState('branches');
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({ name: '', code: '', address: { city: '' }, contactInfo: { email: '' } });
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'sales', branch_id: '' });
  const [branchFilter, setBranchFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userBranchFilter, setUserBranchFilter] = useState('');
  const [showDeleteBranchDialog, setShowDeleteBranchDialog] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  // Fetch all branches and users
  useEffect(() => {
    if (user?.role === 'superadmin') {
      setLoading(true);
      Promise.all([
        branchService.getAllBranches(),
        branchManagementService.getAllUsers(),
      ]).then(([branchesRes, usersRes]) => {
        setBranches(branchesRes.data || []);
        setUsers(usersRes.users || usersRes.data || []);
      }).finally(() => setLoading(false));
    }
  }, [user]);

  // Branch CRUD
  const openBranchModal = (branch = null) => {
    setEditingBranch(branch);
    setBranchForm(branch ? { ...branch } : { name: '', code: '', address: { city: '' }, contactInfo: { email: '' } });
    setShowBranchModal(true);
  };
  const closeBranchModal = () => { setShowBranchModal(false); setEditingBranch(null); };
  const handleBranchFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      setBranchForm({ ...branchForm, address: { ...branchForm.address, [name.split('.')[1]]: value } });
    } else if (name.startsWith('contactInfo.')) {
      setBranchForm({ ...branchForm, contactInfo: { ...branchForm.contactInfo, [name.split('.')[1]]: value } });
    } else {
      setBranchForm({ ...branchForm, [name]: value });
    }
  };
  const saveBranch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch._id, branchForm);
      } else {
        await branchService.createBranch(branchForm);
      }
      const branchesRes = await branchService.getAllBranches();
      setBranches(branchesRes.data || []);
      closeBranchModal();
    } finally { setLoading(false); }
  };
  const confirmDeleteBranch = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteBranchDialog(true);
  };
  const handleDeleteBranch = async () => {
    setLoading(true);
    try {
      await branchService.deleteBranch(branchToDelete._id);
      setBranches((prev) => prev.filter(b => b._id !== branchToDelete._id));
      setShowDeleteBranchDialog(false);
      setBranchToDelete(null);
    } finally { setLoading(false); }
  };
  const cancelDeleteBranch = () => {
    setShowDeleteBranchDialog(false);
    setBranchToDelete(null);
  };

  // User CRUD
  const openUserModal = (user = null) => {
    setEditingUser(user);
    setUserForm(user ? { ...user, password: '' } : { name: '', email: '', password: '', role: 'sales', branch_id: '' });
    setShowUserModal(true);
  };
  const closeUserModal = () => { setShowUserModal(false); setEditingUser(null); };
  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };
  const saveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id, userForm);
      } else {
        await userService.createUser(userForm);
      }
      const usersRes = await branchManagementService.getAllUsers();
      setUsers(usersRes.users || usersRes.data || []);
      closeUserModal();
    } finally { setLoading(false); }
  };
  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter(u => u._id !== userId));
    } finally { setLoading(false); }
  };

  // Filtering logic
  const filteredBranches = branches.filter(b => {
    const q = branchFilter.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.code?.toLowerCase().includes(q) ||
      b.address?.city?.toLowerCase().includes(q)
    );
  });
  const filteredUsers = users.filter(u => {
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

  if (user?.role !== 'superadmin') {
    return <div className="p-8 text-red-600 font-bold">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Branch Management (Super Admin)</h1>
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <Button
            key={t.key}
            onClick={() => setTab(t.key)}
            variant={tab === t.key ? 'primary' : 'secondary'}
          >
            {t.label}
          </Button>
        ))}
      </div>
      {tab === 'branches' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Branches</h2>
            <Button onClick={() => openBranchModal()} variant="primary">+ New Branch</Button>
          </div>
          <div className="mb-2">
            <input
              type="text"
              placeholder="Filter branches..."
              value={branchFilter}
              onChange={e => setBranchFilter(e.target.value)}
              className="border rounded px-2 py-1 w-full max-w-xs"
            />
          </div>
          <TableList
            columns={["Name", "Code", "City", "Email"]}
            data={filteredBranches}
            renderRow={b => [
              b.name,
              b.code,
              b.address?.city || '',
              b.contactInfo?.email || '',
            ]}
            actions={(b) => <>
              <Button onClick={() => openBranchModal(b)} variant="info">Edit</Button>
              <Button onClick={() => confirmDeleteBranch(b)} variant="danger">Delete</Button>
            </>}
            renderDetail={b => (
              <div className="p-4">
                <p><strong>Code:</strong> {b.code}</p>
                <p><strong>City:</strong> {b.address?.city || 'N/A'}</p>
                <p><strong>Email:</strong> {b.contactInfo?.email || 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          />
        </div>
      )}
      {tab === 'users' && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Users</h2>
            <Button onClick={() => openUserModal()} variant="primary">+ New User</Button>
          </div>
          <div className="mb-2 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Search users..."
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              className="border rounded px-2 py-1 w-full max-w-xs"
            />
            <FormSelect
              value={userRoleFilter}
              onChange={e => setUserRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </FormSelect>
            <FormSelect
              value={userBranchFilter}
              onChange={e => setUserBranchFilter(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
            </FormSelect>
          </div>
          <TableList
            columns={["Name", "Email", "Role", "Branch"]}
            data={filteredUsers}
            renderRow={u => [
              u.name,
              u.email,
              u.role,
              u.branch_id ? `${u.branch_id.name} (${u.branch_id.code})` : '',
            ]}
            actions={(u) => <>
              <Button onClick={() => openUserModal(u)} variant="info">Edit</Button>
              <Button onClick={() => deleteUser(u._id)} variant="danger">Delete</Button>
            </>}
            renderDetail={u => (
              <div className="p-4">
                <p><strong>Email:</strong> {u.email}</p>
                <p><strong>Role:</strong> {u.role}</p>
                <p><strong>Branch:</strong> {u.branch_id ? `${u.branch_id.name} (${u.branch_id.code})` : 'N/A'}</p>
                <p><strong>Created At:</strong> {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          />
        </div>
      )}
      {/* Branch Modal */}
      {showBranchModal && (
        <DialogBox
          title={editingBranch ? 'Edit Branch' : 'New Branch'}
          onClose={closeBranchModal}
          onSubmit={saveBranch}
          isOpen={showBranchModal}
          loading={loading}
        >
          <form onSubmit={saveBranch} className="space-y-4">
            <FormInput label="Name" name="name" value={branchForm.name} onChange={handleBranchFormChange} required />
            <FormInput label="Code" name="code" value={branchForm.code} onChange={handleBranchFormChange} required />
            <FormInput label="City" name="address.city" value={branchForm.address?.city || ''} onChange={handleBranchFormChange} />
            <FormInput label="Email" name="contactInfo.email" value={branchForm.contactInfo?.email || ''} onChange={handleBranchFormChange} />
            <div className="flex justify-end">
              <Button type="submit" variant="primary">{editingBranch ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogBox>
      )}
      {/* User Modal */}
      {showUserModal && (
        <DialogBox
          title={editingUser ? 'Edit User' : 'New User'}
          onClose={closeUserModal}
          onSubmit={saveUser}
          isOpen={showUserModal}
          loading={loading}
        >
          <form onSubmit={saveUser} className="space-y-4">
            <FormInput label="Name" name="name" value={userForm.name} onChange={handleUserFormChange} required />
            <FormInput label="Email" name="email" value={userForm.email} onChange={handleUserFormChange} required />
            {!editingUser && (
              <FormInput label="Password" name="password" value={userForm.password} onChange={handleUserFormChange} required type="password" />
            )}
            <FormSelect label="Role" name="role" value={userForm.role} onChange={handleUserFormChange} required>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </FormSelect>
            <FormSelect label="Branch" name="branch_id" value={userForm.branch_id} onChange={handleUserFormChange} required>
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
            </FormSelect>
            <div className="flex justify-end">
              <Button type="submit" variant="primary">{editingUser ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogBox>
      )}
      {showDeleteBranchDialog && (
        <DialogBox title="Delete Branch" onClose={cancelDeleteBranch}>
          <WarningBox>
            Deleting this branch will also delete all users and related data for this branch. This action cannot be undone. Are you sure you want to continue?
          </WarningBox>
          <div className="flex justify-end gap-2">
            <Button onClick={cancelDeleteBranch} variant="secondary">Cancel</Button>
            <Button onClick={handleDeleteBranch} variant="danger" disabled={loading}>{loading ? 'Deleting...' : 'Delete Branch'}</Button>
          </div>
        </DialogBox>
      )}
    </div>
  );
};

export default BranchManagement; 