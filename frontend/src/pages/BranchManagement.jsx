import { useEffect, useState } from "react";
import branchManagementService from "../services/branchManagementService";
import branchService from "../services/branchService";
import userService from "../services/userService";
import { useSelector } from "react-redux";
import FormInput from "../components/common/FormInput";
import FormSelect from "../components/common/FormSelect";
import DialogBox from "../components/common/DialogBox";
import Button from "../components/common/Button";
import WarningBox from "../components/common/WarningBox";
import TableList from "../components/common/TableList";
import TableFilters from "../components/common/TableFilters";
import BranchFilter from "../components/common/BranchFilter";
import ResponsiveFilters from "../components/common/ResponsiveFilters";
import UserTable from "../components/UserTable";

const ROLES = [
  { value: "admin", label: "Branch Admin" },
  { value: "manager", label: "Branch Manager" },
];

const TABS = [
  { key: "branches", label: "Branches" },
  { key: "users", label: "Users" },
];

const BranchManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [tab, setTab] = useState("branches");
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const initialBranchForm = {
    name: "",
    millCode: "",
    address: {
      region: "",
      type: "RR", // Default to Raw Rice
    },
    contactInfo: {
      phone: "",
      email: "",
    },
    isActive: true,
    manager: "",
    gstn: "",
  };
  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    branch_id: "",
  });
  const [branchFilter, setBranchFilter] = useState("");
  const [branchSearchFilter, setBranchSearchFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userBranchFilter, setUserBranchFilter] = useState("");
  const [showDeleteBranchDialog, setShowDeleteBranchDialog] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  // Fetch all branches and users
  useEffect(() => {
    if (user?.isSuperAdmin) {
      setLoading(true);
      Promise.all([
        branchService.getAllBranches(),
        branchManagementService.getAllUsers(),
      ])
        .then(([branchesRes, usersRes]) => {
        setBranches(branchesRes.data || []);
        setUsers(usersRes.users || usersRes.data || []);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Branch CRUD
  const openBranchModal = (branch = null) => {
    setEditingBranch(branch);
    setBranchForm(
      branch
        ? {
            ...initialBranchForm,
            ...branch,
            address: { ...initialBranchForm.address, ...branch.address },
            contactInfo: {
              ...initialBranchForm.contactInfo,
              ...branch.contactInfo,
            },
            manager: branch.manager?._id || branch.manager || "",
          }
        : initialBranchForm
    );
    setShowBranchModal(true);
  };
  const closeBranchModal = () => {
    setShowBranchModal(false);
    setEditingBranch(null);
  };
  const handleBranchFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      setBranchForm({
        ...branchForm,
        address: { ...branchForm.address, [name.split(".")[1]]: value },
      });
    } else if (name.startsWith("contactInfo.")) {
      setBranchForm({
        ...branchForm,
        contactInfo: { ...branchForm.contactInfo, [name.split(".")[1]]: value },
      });
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
    } finally {
      setLoading(false);
    }
  };
  const confirmDeleteBranch = (branch) => {
    setBranchToDelete(branch);
    setShowDeleteBranchDialog(true);
  };
  const handleDeleteBranch = async () => {
    setLoading(true);
    try {
      await branchService.deleteBranch(branchToDelete._id);
      setBranches((prev) => prev.filter((b) => b._id !== branchToDelete._id));
      setShowDeleteBranchDialog(false);
      setBranchToDelete(null);
    } finally {
      setLoading(false);
    }
  };
  const cancelDeleteBranch = () => {
    setShowDeleteBranchDialog(false);
    setBranchToDelete(null);
  };

  // User CRUD
  const openUserModal = (user = null) => {
    setEditingUser(user);
    setUserForm(
      user
        ? { ...user, password: "" }
        : { name: "", email: "", password: "", role: "manager", branch_id: "" }
    );
    setShowUserModal(true);
  };
  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };
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
    } finally {
      setLoading(false);
    }
  };
  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic
  const filteredBranches = branches.filter((b) => {
    // Text search filter
    const q = branchSearchFilter.toLowerCase();
    const matchesText = !branchSearchFilter || (
      b.name?.toLowerCase().includes(q) ||
      b.millCode?.toLowerCase().includes(q) ||
      b.address?.region?.toLowerCase().includes(q) ||
      b.contactInfo?.email?.toLowerCase().includes(q)
    );

    // Branch filter - use currentBranchId if set, otherwise use branchFilter
    const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter;
    const matchesBranch = !effectiveBranchFilter || b._id === effectiveBranchFilter;
    
    return matchesText && matchesBranch;
  });
  const filteredUsers = users.filter((u) => {
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
    const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' ? currentBranchId : userBranchFilter;
    const matchesBranch = effectiveBranchFilter
      ? u.branch_id === effectiveBranchFilter
      : true;
    return matchesText && matchesRole && matchesBranch;
  });

  const safeBranches = branches.map((b) => ({
    ...b,
    id: b._id || b.id || b.millCode,
  }));

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading branches...</p>
      </div>
    </div>
  );

  if (user?.role !== "superadmin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Branch Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Super Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Mobile Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex gap-2">
            {TABS.map((t) => (
              <Button
                key={t.key}
                onClick={() => setTab(t.key)}
                variant={tab === t.key ? "primary" : "secondary"}
                icon={t.key === "branches" ? "branch" : "users"}
                className={`flex-1 sm:flex-none ${
                  tab === t.key 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      {tab === "branches" && (
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Branches</h2>
              <Button
                onClick={() => openBranchModal()}
                variant="primary"
                icon="add"
              >
                New Branch
              </Button>
          </div>
          <ResponsiveFilters title="Filters & Search" className="mt-4">
            <TableFilters
              searchValue={branchSearchFilter}
              searchPlaceholder="Search branches by name, mill code, region, or email..."
              onSearchChange={(e) => setBranchSearchFilter(e.target.value)}
              showSelect={false}
            />
            <BranchFilter
              value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            />
          </ResponsiveFilters>
          <TableList
            columns={["Name", "Mill Code", "Region", "Type", "Email"]}
            data={filteredBranches}
            renderRow={(b) => [
              b.name,
              b.millCode,
              b.address?.region || "",
              b.address?.type === 'RR' ? 'Raw Rice' : b.address?.type === 'BR' ? 'Boiled Rice' : '',
              b.contactInfo?.email || "",
            ]}
            actions={(b) => (
              <div className="flex gap-2">
                <Button
                  onClick={() => openBranchModal(b)}
                  variant="secondary"
                  icon="edit"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => confirmDeleteBranch(b)}
                  variant="danger"
                  icon="delete"
                >
                  Delete
                </Button>
              </div>
            )}
            renderDetail={(b) => (
              <div className="p-4 space-y-2">
                <p>
                  <strong>Mill Code:</strong> {b.millCode}
                </p>
                <p>
                  <strong>Region:</strong> {b.address?.region || "N/A"}
                </p>
                <p>
                  <strong>Type:</strong> {b.address?.type || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {b.contactInfo?.email || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(b.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <strong>GSTN:</strong> {b.gstn || "N/A"}
                </p>
                <div className="flex gap-2">
                <Button
                  onClick={() => openBranchModal(b)}
                   variant="secondary"
                  icon="edit"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => confirmDeleteBranch(b)}
                  variant="danger"
                  icon="delete"
                >
                  Delete
                </Button>
              </div>
              </div>
            )}
          />
        </div>
      )}
      {tab === "users" && (
        <UserTable
          users={filteredUsers}
          userFilter={userFilter}
          userRoleFilter={userRoleFilter}
          userBranchFilter={userBranchFilter}
          setUserFilter={setUserFilter}
          setUserRoleFilter={setUserRoleFilter}
          setUserBranchFilter={setUserBranchFilter}
          openUserModal={openUserModal}
          deleteUser={deleteUser}
          roles={ROLES}
          showAddButton={currentBranchId && currentBranchId !== 'all'}
        />
      )}
      {/* Branch Modal */}
      {showBranchModal && (
        <DialogBox
          title={editingBranch ? "Edit Branch" : "New Branch"}
          onClose={closeBranchModal}
          onSubmit={saveBranch}
          show={showBranchModal}
          loading={loading}
        >
          <form onSubmit={saveBranch} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Name"
                name="name"
                value={branchForm.name}
                onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                required
                icon="branch"
              />
              <FormInput
                label="Mill Code"
                name="millCode"
                value={branchForm.millCode}
                onChange={e => setBranchForm({ ...branchForm, millCode: e.target.value })}
                required
                icon="branch"
              />
            </div>
            {/* Address */}
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">Region & Type</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Region"
                  name="address.region"
                  value={branchForm.address.region || ''}
                  onChange={e => setBranchForm({
                    ...branchForm,
                    address: { ...branchForm.address, region: e.target.value }
                  })}
                  required
                  icon="branch"
                />
                <FormSelect
                  label="Type"
                  name="address.type"
                  value={branchForm.address.type || ''}
                  onChange={e => setBranchForm({
                    ...branchForm,
                    address: { ...branchForm.address, type: e.target.value }
                  })}
                  required
                >
                  <option value="RR">Raw Rice</option>
                  <option value="BR">Boiled Rice</option>
                </FormSelect>
              </div>
            </fieldset>
            {/* Contact Info */}
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">
                Contact Info
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Phone"
                  name="contactInfo.phone"
                  value={branchForm.contactInfo.phone}
                  onChange={e => setBranchForm({ ...branchForm, contactInfo: { ...branchForm.contactInfo, phone: e.target.value } })}
                  required
                  icon="phone"
                />
                <FormInput
                  label="Email"
                  name="contactInfo.email"
                  value={branchForm.contactInfo.email}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      contactInfo: {
                        ...branchForm.contactInfo,
                        email: e.target.value,
                      },
                    })
                  }
                  required
                  icon="mail"
                />
              </div>
            </fieldset>
            {/* Settings */}
            {/* Operating Hours */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
              <FormInput
              label="GSTN"
              name="gstn"
              value={branchForm.gstn || ''}
              onChange={e => setBranchForm({ ...branchForm, gstn: e.target.value })}
              required
              icon="branch"
            />
            </div>
            <div className="flex gap-2 justify-end">
            <Button onClick={()=>closeBranchModal()} variant="secondary" icon="close">Cancel</Button>

              <Button type="submit" variant="primary" icon="save">
                {editingBranch ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogBox>
      )}
      {/* User Modal */}
      {showUserModal && (
        <DialogBox
          title={editingUser ? "Edit User" : "New User"}
          onClose={closeUserModal}
          onSubmit={saveUser}
          show={showUserModal}
          loading={loading}
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
              value={userForm.email}
              onChange={handleUserFormChange}
              required
              icon="user"
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
            <div className="flex gap-2 justify-end">
              <Button onClick={()=>closeUserModal()} variant="secondary" icon="close">Cancel</Button>
              <Button type="submit" variant="primary" icon="save">
                {editingUser ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogBox>
      )}
      {showDeleteBranchDialog && (
        <DialogBox title="Delete Branch" onClose={cancelDeleteBranch}>
          <WarningBox>
            Deleting this branch will also delete all users and related data for
            this branch. This action cannot be undone. Are you sure you want to
            continue?
          </WarningBox>
          <div className="flex justify-end gap-2">
            <Button
              onClick={cancelDeleteBranch}
              variant="secondary"
              icon="close"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteBranch}
              variant="danger"
              icon="delete"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete Branch"}
            </Button>
          </div>
        </DialogBox>
      )}
      </div>
    </div>
  );
};

export default BranchManagement; 
