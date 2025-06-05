import React from "react";
import AdminDashboard from "../components/AdminDashboard";
import UseAdminAuth from "../components/useAdminAuth";

const Admin = () => {
  UseAdminAuth();
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  return (
    <div>
      <nav className="flex justify-between items-center p-4 bg-gray-100">
        <img src=".\Logo.png" alt="Logo" className="w-32" />
        <h2 className="text-3xl font-bold text-cyan-900 mb-2">
          Admin Dashboard
        </h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-cyan-800 text-white rounded hover:bg-cyan-600 transition"
        >
          Logout
        </button>
      </nav>
      <AdminDashboard />
    </div>
  );
};

export default Admin;
