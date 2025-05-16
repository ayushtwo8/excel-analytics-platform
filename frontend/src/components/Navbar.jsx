import React, { useState, useEffect } from "react";
import { Button } from "./ui/button"; // Assuming this is your Shadcn UI or custom Button
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FaBars, FaTimes, FaSignOutAlt } from "react-icons/fa"; // Icons for menu and logout
import { useNavigate, useLocation } from "react-router-dom";
import { useUserAuth } from "@/context/userAuthContext"; // Assuming this context provides currentUser and logout

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To detect route changes
  const { currentUser, logout } = useUserAuth(); // Destructure logout from context
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      if (logout) { // Check if logout function exists
        await logout();
      }
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Failed to log out:", error);
      // Optionally: show an error message to the user
    }
  };

  // Simplified navigation handler, protection logic is now in navLinks
  const handleNavigation = (path, isProtected) => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    if (isProtected && !currentUser) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const navLinks = [
    { name: "Home", path: "/", protected: false },
    { name: "Dashboard", path: "/dashboard", protected: true },
    // Decide if About and Contact should be protected or public
    // Assuming public for this example:
    { name: "About", path: "/about", protected: false },
    { name: "Contact", path: "/contact", protected: false },
  ];

  const renderNavLinks = (isMobile = false) =>
    navLinks.map((link) => {
      // Optionally hide protected links from navbar if user is not logged in,
      // even if handleNavigation would redirect them.
      // For this example, we show them and let handleNavigation manage access.
      // if (link.protected && !currentUser && !isMobile) return null;

      return (
        <li key={link.name}>
          <button // Using button for better accessibility and click handling
            onClick={() => handleNavigation(link.path, link.protected)}
            className={`text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200 ease-in-out
                        ${isMobile ? 'block w-full text-left hover:bg-gray-100' : 'hover:text-green-600 hover:bg-green-50/50'}
                        ${location.pathname === link.path ? (isMobile ? 'bg-green-100 text-green-700' : 'text-green-700 underline underline-offset-4 decoration-2 decoration-green-700') : 'text-gray-700'}`}
          >
            {link.name}
          </button>
        </li>
      );
    });

  return (
    <>
      <header className="w-full py-4 px-6 md:px-10 lg:px-16 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 text-green-700 font-bold text-2xl cursor-pointer"
            onClick={() => navigate("/")}
            aria-label="Go to homepage"
          >
            <LuChartNoAxesCombined size={28} />
            <span>Excelytics</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <ul className="flex items-center gap-1 lg:gap-2">
              {renderNavLinks()}
            </ul>
          </nav>

          {/* Auth Buttons & User Info (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <>
                {/* Optional: Display user name or avatar */}
                {/* <span className="text-sm text-gray-600">Hi, {currentUser.displayName || 'User'}</span> */}
                <Button
                  variant="outline" // Assuming Shadcn UI or similar Button component
                  className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 text-sm"
                  onClick={handleLogout}
                >
                  Logout
                  <FaSignOutAlt className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-green-700 hover:bg-green-100 hover:text-green-800 px-4 py-2 text-sm"
                  onClick={() => handleNavigation("/login", false)}
                >
                  Login
                </Button>
                <Button
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-sm"
                  onClick={() => handleNavigation("/signup", false)} // Assuming you have a /signup route
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-green-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[61px] bg-white shadow-lg z-40 border-t border-gray-200"> {/* Adjust top value based on actual header height */}
          <nav className="container mx-auto px-4 py-4">
            <ul className="flex flex-col gap-1">
              {renderNavLinks(true)}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col gap-3">
              {currentUser ? (
                <Button
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50 justify-center"
                  onClick={handleLogout}
                >
                  Logout <FaSignOutAlt className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full text-green-700 hover:bg-green-100 justify-center"
                    onClick={() => handleNavigation("/login", false)}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full bg-green-700 hover:bg-green-800 text-white justify-center"
                    onClick={() => handleNavigation("/signup", false)}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;