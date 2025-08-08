import React from 'react';

const Account = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6">Account</h1>

      {/* Profile Information */}
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

      {/* Security Settings */}
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

      {/* Login Activity */}
      <section className="bg-white shadow rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Login Activity</h2>
        <ul className="list-disc list-inside">
          <li>2025-08-08 – 09:15 – Chrome – Taipei ✅</li>
          <li>2025-08-07 – 22:43 – Edge – New York ⚠️</li>
        </ul>
      </section>

      {/* Recovery & Verification */}
      <section className="bg-white shadow rounded-lg p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4">Account Recovery</h2>
        <p><strong>Recovery Email:</strong> recovery@example.com</p>
        <p><strong>Recovery Phone:</strong> +886 912 345 678</p>
        <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          Edit Recovery Info
        </button>
      </section>

      {/* Privacy & Data */}
      <section className="bg-white shadow rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-4">Privacy & Data</h2>
        <button className="block mb-2 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600">
          Download Account Data
        </button>
        <button className="block px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          Delete Account
        </button>
      </section>
    </div>
  );
};

export default Account;
