import React from "react";
import { Button } from "./ui/button";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "@/context/userAuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserAuth();

  const handleProtectedRoute = (path) => {
    if (!currentUser) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <>
      <div className="w-full py-5 px-12 border-b border-gray-300/40">
        <nav className="flex justify-between items-center align-center">
          <div className="flex justify-center items-center gap-2 text-green-800 font-bold text-2xl">
            <LuChartNoAxesCombined size={25} />
            <div>Excelytics</div>
          </div>

          <ul className="flex items-center gap-5">
            <li
              className="text-sm px-4 py-1 hover:border-b-2 border-green-800 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Home
            </li>
            <li
              className="text-sm px-4 py-1 hover:border-b-2 border-green-800 cursor-pointer"
              onClick={() => handleProtectedRoute("/dashboard")}
            >
              Dashboard
            </li>
            <li
              className="text-sm px-4 py-1 hover:border-b-2 border-green-800 cursor-pointer"
              onClick={() => handleProtectedRoute("/about")}
            >
              About
            </li>
            <li
              className="text-sm px-4 py-1 hover:border-b-2 border-green-800 cursor-pointer"
              onClick={() => handleProtectedRoute("/contact")}
            >
              Contact
            </li>
            <Button
              className="bg-green-800 hover:bg-green-700 cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
