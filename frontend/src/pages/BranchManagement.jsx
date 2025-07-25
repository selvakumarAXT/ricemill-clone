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
import CommonSearchField from "../components/common/CommonSearchField";
import UserTable from "../components/UserTable";

const ROLES = [
  { value: "admin", label: "Branch Admin" },
  { value: "accountant", label: "Accountant" },
  { value: "qc", label: "QC Officer" },
  { value: "sales", label: "Sales Staff" },
];

const TABS = [
  { key: "branches", label: "Branches" },
  { key: "users", label: "Users" },
];

const BranchManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [tab, setTab] = useState("branches");
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const initialBranchForm = {
    name: "",
    code: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    contactInfo: {
      phone: "",
      email: "",
    },
    isActive: true,
    settings: {
      currency: "INR",
      timezone: "Asia/Kolkata",
      operatingHours: {
        start: "",
        end: "",
      },
    },
    manager: "",
  };
  const [branchForm, setBranchForm] = useState(initialBranchForm);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "sales",
    branch_id: "",
  });
  const [branchFilter, setBranchFilter] = useState("");
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
            settings: {
              ...initialBranchForm.settings,
              ...branch.settings,
              operatingHours: {
                ...initialBranchForm.settings.operatingHours,
                ...(branch.settings?.operatingHours || {}),
              },
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
        : { name: "", email: "", password: "", role: "sales", branch_id: "" }
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
    const q = branchFilter.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.code?.toLowerCase().includes(q) ||
      b.address?.city?.toLowerCase().includes(q)
    );
  });
  const filteredUsers = users.filter((u) => {
    const q = userFilter.toLowerCase();
    const matchesText =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      (u.branch_id &&
        (u.branch_id.name?.toLowerCase().includes(q) ||
          u.branch_id.code?.toLowerCase().includes(q)));
    const matchesRole = userRoleFilter ? u.role === userRoleFilter : true;
    const matchesBranch = userBranchFilter
      ? u.branch_id === userBranchFilter
      : true;
    return matchesText && matchesRole && matchesBranch;
  });

  const safeBranches = branches.map((b) => ({
    ...b,
    id: b._id || b.id || b.code,
  }));

  if (user?.role !== "superadmin") {
    return <div className="p-8 text-red-600 font-bold">Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Branch Management (Super Admin)
      </h1>
      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <Button
            key={t.key}
            onClick={() => setTab(t.key)}
            variant={tab === t.key ? "primary" : "secondary"}
            icon={t.key === "branches" ? "branch" : "users"}
          >
            {t.label}
          </Button>
        ))}
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
          <div className="flex flex-wrap gap-2 items-center">
            <CommonSearchField
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              placeholder="Filter branches..."
            />
            <FormSelect
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b.name}>
                  {b.name} ({b.code})
                </option>
              ))}
            </FormSelect>
          </div>
          <TableList
            columns={["Name", "Code", "City", "Email"]}
            data={
              filteredBranches ||
              safeBranches.filter(
                (b) => !branchFilter || b.name === branchFilter
              )
            }
            renderRow={(b) => [
              b.name,
              b.code,
              b.address?.city || "",
              b.contactInfo?.email || "",
            ]}
            actions={(b) => (
              <>
                <Button
                  onClick={() => openBranchModal(b)}
                  variant="info"
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
              </>
            )}
            renderDetail={(b) => (
              <div className="p-4">
                <p>
                  <strong>Code:</strong> {b.code}
                </p>
                <p>
                  <strong>City:</strong> {b.address?.city || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {b.contactInfo?.email || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          />
        </div>
      )}
      {tab === "users" && (
        <UserTable
          users={filteredUsers}
          branches={branches}
          userFilter={userFilter}
          userRoleFilter={userRoleFilter}
          userBranchFilter={userBranchFilter}
          setUserFilter={setUserFilter}
          setUserRoleFilter={setUserRoleFilter}
          setUserBranchFilter={setUserBranchFilter}
          openUserModal={openUserModal}
          deleteUser={deleteUser}
          roles={ROLES}
        />
      )}
      {/* Branch Modal */}
      {showBranchModal && (
        <DialogBox
          title={editingBranch ? "Edit Branch" : "New Branch"}
          onClose={closeBranchModal}
          onSubmit={saveBranch}
          isOpen={showBranchModal}
          loading={loading}
        >
          <form onSubmit={saveBranch} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Name"
                name="name"
                value={branchForm.name}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, name: e.target.value })
                }
                required
                icon="branch"
              />
              <FormInput
                label="Code"
                name="code"
                value={branchForm.code}
                onChange={(e) =>
                  setBranchForm({ ...branchForm, code: e.target.value })
                }
                required
                icon="branch"
              />
            </div>
            {/* Address */}
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">
                Address
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Street"
                  name="address.street"
                  value={branchForm.address.street}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      address: {
                        ...branchForm.address,
                        street: e.target.value,
                      },
                    })
                  }
                  required
                  icon="branch"
                />
                <FormInput
                  label="City"
                  name="address.city"
                  value={branchForm.address.city}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      address: { ...branchForm.address, city: e.target.value },
                    })
                  }
                  required
                  icon="branch"
                />
                <FormInput
                  label="State"
                  name="address.state"
                  value={branchForm.address.state}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      address: { ...branchForm.address, state: e.target.value },
                    })
                  }
                  required
                  icon="branch"
                />
                <FormInput
                  label="Zip Code"
                  name="address.zipCode"
                  value={branchForm.address.zipCode}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      address: {
                        ...branchForm.address,
                        zipCode: e.target.value,
                      },
                    })
                  }
                  required
                  icon="branch"
                />
                <FormInput
                  label="Country"
                  name="address.country"
                  value={branchForm.address.country}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      address: {
                        ...branchForm.address,
                        country: e.target.value,
                      },
                    })
                  }
                  required
                  icon="branch"
                />
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
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      contactInfo: {
                        ...branchForm.contactInfo,
                        phone: e.target.value,
                      },
                    })
                  }
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
            <fieldset className="border border-gray-200 rounded p-4">
              <legend className="text-sm font-semibold text-gray-700 px-2">
                Settings
              </legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Currency"
                  name="settings.currency"
                  value={branchForm.settings.currency}
                  disabled
                  icon="currency"
                />
                <FormInput
                  label="Timezone"
                  name="settings.timezone"
                  value={branchForm.settings.timezone}
                  disabled
                  icon="timezone"
                />
                <div className="flex items-center space-x-2 mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Active
                  </label>
                  <input
                    type="checkbox"
                    checked={branchForm.isActive}
                    onChange={(e) =>
                      setBranchForm({
                        ...branchForm,
                        isActive: e.target.checked,
                      })
                    }
                    className="ml-2"
                  />
                </div>
              </div>
              {/* Operating Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormInput
                  label="Operating Start"
                  name="settings.operatingHours.start"
                  value={branchForm.settings.operatingHours.start}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      settings: {
                        ...branchForm.settings,
                        operatingHours: {
                          ...branchForm.settings.operatingHours,
                          start: e.target.value,
                        },
                      },
                    })
                  }
                  icon="clock"
                  type="time"
                />
                <FormInput
                  label="Operating End"
                  name="settings.operatingHours.end"
                  value={branchForm.settings.operatingHours.end}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      settings: {
                        ...branchForm.settings,
                        operatingHours: {
                          ...branchForm.settings.operatingHours,
                          end: e.target.value,
                        },
                      },
                    })
                  }
                  icon="clock"
                  type="time"
                />
              </div>
            </fieldset>
            <div className="flex justify-end">
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
          isOpen={showUserModal}
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
                  {b.name} ({b.code})
                </option>
              ))}
            </FormSelect>
            <div className="flex justify-end">
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
  );
};

export default BranchManagement;
