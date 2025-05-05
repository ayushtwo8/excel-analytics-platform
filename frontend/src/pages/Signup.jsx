import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { LuChartNoAxesCombined } from "react-icons/lu";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error signing up:", error);
      setError(`Failed to sign up: ${error.message}`);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
  
      <div className="hidden lg:flex items-center justify-center">
        <img
          src="/signup-illustration.jpg"
          alt="Signup Illustration"
          className="w-[80%] h-auto object-contain"
        />
      </div>

      <div className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-md space-y-16">
          
          <a
            href="#"
            className="flex justify-center items-center gap-2 font-bold text-4xl"
          >
            Welcome to  <span className="flex text-green-800  align-center justify-center items-center"><LuChartNoAxesCombined /> Excelytics</span>
          </a>

          {/* Signup Form */}
          <form
            onSubmit={handleSignup}
            className="flex flex-col gap-6 border p-12 rounded-xl shadow-md"
          >
            <h2 className="text-center text-3xl font-semibold pb-4 text-gray-800">
              Create Account
            </h2>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="text-xs text-blue-600 hover:underline underline-offset-4"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-700"
              >
                Signup
              </Button>
            </div>
            <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </p>

           
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default Signup;
