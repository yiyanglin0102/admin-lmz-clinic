import React, { useState } from "react";

const AdminBackend = () => {
  const [activeTab, setActiveTab] = useState("account");

  // Mock device data
  const devices = [
    {
      id: 1,
      name: "MacBook Pro",
      browser: "Chrome 138",
      ip: "203.0.113.45",
      location: "Taipei, Taiwan",
      lastActive: "2025-08-08 09:15",
      current: true,
    },
    {
      id: 2,
      name: "Windows PC",
      browser: "Edge 128",
      ip: "198.51.100.23",
      location: "New York, USA",
      lastActive: "2025-08-07 22:43",
      current: false,
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Tabs Navigation */}
      <div className="flex border-b mb-6">
        {["account", "devices", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px border-b-2 font-medium capitalize ${
              activeTab === tab
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === "account" && (
        <>
          <section className="bg-white shadow rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
            <div className="flex items-center space-x-4">
              <img
                src="https://via.placeholder.com/80"
                alt="Profile"
                className="w-20 h-20 rounded-full border"
              />
              <div>
                <p><strong>Name:</strong> Yi-Yang Lin</p>
                <p><strong>Email:</strong> yi.yang@example.com ✅</p>
                <p><strong>Role:</strong> Super Admin</p>
                <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Change Profile Picture
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white shadow rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
            <div className="mb-3">
              <p><strong>Password:</strong> ●●●●●●●●</p>
              <button className="text-blue-500 hover:underline">Change Password</button>
            </div>
            <div className="mb-3">
              <p><strong>Two-Factor Authentication:</strong> ❌ Disabled</p>
              <button className="text-blue-500 hover:underline">Enable 2FA</button>
            </div>
            <div>
              <p><strong>Active Sessions:</strong> 3</p>
              <button className="text-blue-500 hover:underline">Log Out of All Devices</button>
            </div>
          </section>
        </>
      )}

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <section className="bg-white shadow rounded-lg p-5">
          <h2 className="text-lg font-semibold mb-4">Devices</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3">Device</th>
                <th className="p-3">Browser</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Location</th>
                <th className="p-3">Last Active</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {device.name}{" "}
                    {device.current && (
                      <span className="text-green-600 text-sm">(Current)</span>
                    )}
                  </td>
                  <td className="p-3">{device.browser}</td>
                  <td className="p-3">{device.ip}</td>
                  <td className="p-3">{device.location}</td>
                  <td className="p-3">{device.lastActive}</td>
                  <td className="p-3">
                    {!device.current && (
                      <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <section className="bg-white shadow rounded-lg p-5 space-y-6">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>

          {/* General Preferences */}
          <div>
            <h3 className="font-medium mb-2">General Preferences</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium">Language</label>
              <select className="border rounded px-3 py-1 mt-1 w-64">
                <option>English</option>
                <option>中文</option>
                <option>日本語</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium">Time Zone</label>
              <select className="border rounded px-3 py-1 mt-1 w-64">
                <option>GMT+8 Taipei</option>
                <option>GMT-5 New York</option>
                <option>GMT+0 London</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="font-medium mb-2">Notifications</h3>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="emailNotif" defaultChecked />
              <label htmlFor="emailNotif">Email Notifications</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="smsNotif" />
              <label htmlFor="smsNotif">SMS Notifications</label>
            </div>
          </div>

          {/* Security */}
          <div>
            <h3 className="font-medium mb-2">Security</h3>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="autoLogout" defaultChecked />
              <label htmlFor="autoLogout">Auto logout after 30 min inactivity</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="ipRestrict" />
              <label htmlFor="ipRestrict">Restrict login to allowed IPs</label>
            </div>
          </div>

          {/* Save Button */}
          <div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminBackend;
