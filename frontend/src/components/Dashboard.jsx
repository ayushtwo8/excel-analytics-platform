import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AiOutlineHome, AiOutlineLogout } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";

function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [protectedData, setProtectedData] = useState("");
  const [error, setError] = useState("");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
      console.log("Logout successful");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const fetchProtectedData = async () => {
    setError("");
    setProtectedData("Loading...");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      // Axios already has the token header set by AuthContext
      const response = await axios.get(`${backendUrl}/api/protected`);
      setProtectedData(response.data.message);
    } catch (err) {
      console.error("Failed to fetch protected data:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Failed to fetch data. Are you logged in?");
      setProtectedData("");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white py-6 px-4">
        <div className="text-2xl font-bold mb-8 text-center">Excelytics</div>
        <div className="space-y-4">
          <button className="w-full flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded">
            <MdDashboard size={20} />
            Dashboard
          </button>
          <button className="w-full flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded">
            <AiOutlineHome size={20} />
            Home
          </button>
          <button className="w-full flex items-center gap-2 py-2 px-4 hover:bg-green-700 rounded">
            <FiSettings size={20} />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-semibold mb-6">Dashboard</h2>
        {currentUser ? (
          <div>
            <div className="bg-white p-6 rounded-md shadow-md">
              <p className="text-xl mb-2">Welcome, {currentUser.email}!</p>
              <p className="text-sm text-gray-500">Firebase UID: {currentUser.uid}</p>
              <button
                onClick={fetchProtectedData}
                className="mt-4 px-6 py-2 bg-green-800 text-white rounded hover:bg-green-700"
              >
                Fetch Protected Data from Backend
              </button>
              {protectedData && (
                <p className="mt-4 text-lg font-semibold">Backend says: {protectedData}</p>
              )}
              {error && (
                <p className="mt-4 text-red-500 font-medium">{error}</p>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500"
              >
                <AiOutlineLogout size={20} />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>You are not logged in.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
