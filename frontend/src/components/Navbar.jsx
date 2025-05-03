import React from "react";
import { Button } from "./ui/button";
import { LuChartNoAxesCombined } from "react-icons/lu";

const Navbar = () => {
  return (
    <>
      <div className="w-full py-5 px-12 border-b border-gray-300/40">
        <nav className="flex justify-between items-center align-center">
          <div className="flex justify-center items-center gap-2 text-green-700 font-bold text-2xl">
            <LuChartNoAxesCombined size={25} />
            <div>Excelytics</div>
          </div>

          <ul className="flex items-center gap-5">
            <li className="text-sm px-4 py-1 hover:border-b-2 border-green-700 cursor-pointer">
              Home
            </li>
            <li className="text-sm px-4 py-1 hover:border-b-2 border-green-700 cursor-pointer">
              Dashboard
            </li>
            <li className="text-sm px-4 py-1 hover:border-b-2 border-green-700 cursor-pointer">
              About
            </li>
            <li className="text-sm px-4 py-1 hover:border-b-2 border-green-700 cursor-pointer">
              Contact
            </li>
            <Button className="bg-green-700 hover:bg-green-800 cursor-pointer">
              Login
            </Button>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
