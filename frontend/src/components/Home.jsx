import React from "react";
import Navbar from "./Navbar";
import { Button } from "./ui/button";
import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="w-full py-5 px-40 flex justify-between items-center">
        <div className="flex flex-col justify-center items-start w-1/2">
          <h1 className="text-6xl font-semibold pb-2">
            Analyze your Data with Ease{" "}
          </h1>
          <p className="text-sm w-2/3">
            Turn your Excel data into powerful insights — upload your files and
            create interactive charts in seconds.
          </p>
          <Button className="bg-green-700 my-10 flex items-center gap-2" onClick={() => navigate("/login")}>
            Get Started
            <FaArrowRightLong />{" "}
          </Button>
        </div>
        <div className="flex w-1/2 justify-center">
          <img
            src="home-illustration.jpg"
            alt="illustration"
            className="w-full max-w-[600px] h-auto"
          />
        </div>
      </div>
    </>
  );
};

export default Home;
