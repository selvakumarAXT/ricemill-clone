const Settings = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure system settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500">Profile management features coming soon...</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500">System configuration options coming soon...</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500">Security and privacy settings coming soon...</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500">Notification settings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 