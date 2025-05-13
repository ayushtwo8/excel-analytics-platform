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
  { path: "/dashboard/visualize", icon: <FaChartBar size={20} />, label: "Visualize" },
  { path: "/dashboard/history", icon: <FaHistory size={20} />, label: "History" },
  { path: "/dashboard/insights", icon: <FaRobot size={20} />, label: "Smart Insights" },
  { path: "/dashboard/profile", icon: <FaUser size={20} />, label: "Profile" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/dashboard"); // Or your main dashboard landing page
  };

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white shadow-md h-screen flex flex-col justify-between transition-width duration-300 ease-in-out border-r border-gray-200`}
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-center border-b border-gray-200 px-4">
        <button // Using a button for better accessibility
          onClick={handleLogoClick}
          className={`flex items-center gap-2 text-green-700 font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md p-2
                      ${collapsed ? 'justify-center' : 'w-full justify-start'}`}
          aria-label="Go to dashboard homepage"
        >
          <LuChartNoAxesCombined className={`${collapsed ? 'text-3xl' : 'text-2xl'}`} />
          {!collapsed && <span className="text-xl">Excelytics</span>}
        </button>
      </div>

      {/* Navigation Section */}
      <nav // Using <nav> semantic element
        className={`flex-1 overflow-y-auto py-4 px-2 space-y-2 ${
          collapsed ? "flex flex-col items-center" : ""
        }`}
        aria-label="Main dashboard navigation"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center py-2.5 px-3 rounded-lg transition-all duration-200 ease-in-out text-sm w-full group
              ${ collapsed ? "justify-center" : "justify-start gap-3" }
              ${
                isActive
                  ? "bg-green-100 text-green-700 font-semibold shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
            title={collapsed ? item.label : ""} // Good for tooltips
          >
            <span className="flex-shrink-0 group-hover:scale-110 transition-transform duration-150"> {/* Icon scaling on hover */}
                {item.icon}
            </span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Button */}
      <div
        className={`h-16 border-t border-gray-200 flex items-center ${
          collapsed ? "justify-center" : "justify-end"
        } px-4`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md text-gray-500 hover:text-green-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200 ease-in-out"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
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