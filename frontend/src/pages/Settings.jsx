import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, changePassword } from '../store/slices/authSlice';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import DialogBox from '../components/common/DialogBox';
import Icon from '../components/common/Icon';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile settings
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // System settings
  const [systemSettings, setSystemSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    theme: 'light',
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    inventoryAlerts: true,
    financialAlerts: true,
    qualityAlerts: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await dispatch(updateProfile(profileForm)).unwrap();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await dispatch(changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })).unwrap();
      setSuccess('Password changed successfully');
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to backend
    setSuccess('System settings updated');
  };

  const handleNotificationSettingChange = (key, value) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to backend
    setSuccess('Notification settings updated');
  };

  const handleSecuritySettingChange = (key, value) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to backend
    setSuccess('Security settings updated');
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure system settings and preferences</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive border border-destructive/30 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Icon name="error" className="h-5 w-5 text-destructive" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">Error</h3>
                <div className="mt-1 text-sm text-destructive">{error}</div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-primary/10 text-primary border border-primary/30 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Icon name="success" className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary">Success</h3>
                <div className="mt-1 text-sm text-primary">{success}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-3 border-b border-border bg-muted/50">
              <h3 className="text-lg font-semibold text-foreground">Profile Settings</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <FormInput
                  label="Full Name"
                  name="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  required
                  icon="user"
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  required
                  icon="mail"
                />
                <FormInput
                  label="Phone Number"
                  name="phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  icon="phone"
                />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" icon="save" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-3 border-b border-border bg-muted/50">
              <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Change Password</h4>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
                <Button
                  onClick={() => setShowPasswordModal(true)}
                  variant="outline"
                  icon="lock"
                >
                  Change Password
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth}
                    onChange={(e) => handleSecuritySettingChange('twoFactorAuth', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Session Timeout</h4>
                  <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                </div>
                <div className="relative">
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecuritySettingChange('sessionTimeout', parseInt(e.target.value))}
                    className="border border-input bg-background text-foreground rounded-md px-3 py-1 text-sm appearance-none pr-8"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-2 flex items-center">
                    <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Configuration */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-3 border-b border-border bg-muted/50">
              <h3 className="text-lg font-semibold text-foreground">System Configuration</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Language</h4>
                  <p className="text-sm text-muted-foreground">Interface language</p>
                </div>
                <div className="relative">
                  <select
                    value={systemSettings.language}
                    onChange={(e) => handleSystemSettingChange('language', e.target.value)}
                    className="border border-input bg-background text-foreground rounded-md px-3 py-1 text-sm appearance-none pr-8"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="hi">Hindi</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-2 flex items-center">
                    <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Theme</h4>
                  <p className="text-sm text-muted-foreground">Interface appearance</p>
                </div>
                <div className="relative">
                  <select
                    value={systemSettings.theme}
                    onChange={(e) => handleSystemSettingChange('theme', e.target.value)}
                    className="border border-input bg-background text-foreground rounded-md px-3 py-1 text-sm appearance-none pr-8"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-2 flex items-center">
                    <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Currency</h4>
                  <p className="text-sm text-muted-foreground">Default currency</p>
                </div>
                <div className="relative">
                  <select
                    value={systemSettings.currency}
                    onChange={(e) => handleSystemSettingChange('currency', e.target.value)}
                    className="border border-input bg-background text-foreground rounded-md px-3 py-1 text-sm appearance-none pr-8"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-2 flex items-center">
                    <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Date Format</h4>
                  <p className="text-sm text-muted-foreground">Date display format</p>
                </div>
                <div className="relative">
                  <select
                    value={systemSettings.dateFormat}
                    onChange={(e) => handleSystemSettingChange('dateFormat', e.target.value)}
                    className="border border-input bg-background text-foreground rounded-md px-3 py-1 text-sm appearance-none pr-8"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 pr-2 flex items-center">
                    <Icon name="chevronDown" className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-6 py-3 border-b border-border bg-muted/50">
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => handleNotificationSettingChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Inventory Alerts</h4>
                  <p className="text-sm text-muted-foreground">Low stock and inventory notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.inventoryAlerts}
                    onChange={(e) => handleNotificationSettingChange('inventoryAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-foreground">Quality Alerts</h4>
                  <p className="text-sm text-muted-foreground">Quality control notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.qualityAlerts}
                    onChange={(e) => handleNotificationSettingChange('qualityAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <DialogBox
          show={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
          title="Change Password"
          submitText="Change Password"
          cancelText="Cancel"
          error={error}
          success={success}
          size="2xl"
        >
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <FormInput
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              required
              icon="lock"
            />
            <FormInput
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              required
              icon="lock"
              minLength={6}
            />
            <FormInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              required
              icon="lock"
              minLength={6}
            />
          </form>
        </DialogBox>
      )}
    </div>
  );
};

export default Settings; 