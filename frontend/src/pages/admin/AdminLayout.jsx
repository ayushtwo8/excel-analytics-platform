import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaFileAlt } from 'react-icons/fa';
import { useUserAuth } from '@/context/userAuthContext'; // Your auth context

const AdminLayout = () => {
  const { user } = useUserAuth();

  const navItems = [
    { to: 'dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: 'users', icon: <FaUsers />, label: 'Users' },
    // { to: 'files', icon: <FaFileAlt />, label: 'Files' }, // Uncomment when you build this page
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="text-2xl font-bold mb-8 text-center">Admin Panel</div>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'hover:bg-gray-700'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-center text-sm text-gray-400">
          <p>Logged in as</p>
          <p className="font-semibold text-white">{user?.email}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet /> {/* This is where the child routes will render */}
      </main>
    </div>
  );
};

export default AdminLayout;