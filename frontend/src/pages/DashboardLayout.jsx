import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import { useUserAuth } from "@/context/userAuthContext";

const DashboardLayout = () => {
  const { user } = useUserAuth();
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;