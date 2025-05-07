import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaHistory,
  FaRobot,
  FaUser,
} from "react-icons/fa";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";

const navItems = [
  { path: "/visualize", icon: <FaChartBar />, label: "Visualize" },
  { path: "/history", icon: <FaHistory />, label: "History" },
  { path: "/insights", icon: <FaRobot />, label: "Smart Insights" },
  { path: "/profile", icon: <FaUser />, label: "Profile" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white shadow-md h-screen flex flex-col justify-between transition-all duration-300 border-r`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b">
        {collapsed ? (
          <LuChartNoAxesCombined 
            className="text-3xl text-green-800 cursor-pointer" 
            onClick={() => navigate("/dashboard")}
          />
        ) : (
          <div 
            className="flex items-center gap-2 text-green-800 text-2xl font-bold cursor-pointer" 
            onClick={() => navigate("/dashboard")}
          >
            <LuChartNoAxesCombined />
            Excelytics
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <div
        className={`flex-1 overflow-y-auto py-4 px-2 space-y-4 ${
          collapsed ? "flex flex-col items-center space-y-4" : ""
        }`}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center ${
                collapsed ? "justify-center" : "justify-start"
              } gap-4 p-2 rounded-md transition-all text-sm w-full ${
                isActive
                  ? "bg-green-100 text-green-800 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
            title={collapsed ? item.label : ""}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Collapse Button */}
      <div
        className={`h-16 border-t flex items-center ${
          collapsed ? "justify-center" : "justify-end"
        } px-4`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:text-green-800 transition-transform duration-300"
          title={collapsed ? "Expand" : "Collapse"}
        >
          <TbLayoutSidebarLeftCollapse
            className={`text-2xl transform ${
              collapsed ? "rotate-180" : ""
            } transition-transform duration-300`}
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;