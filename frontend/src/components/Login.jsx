import React, { useState} from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // If you need to use the auth context
  // const { refreshProfile } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // If you need to refresh the profile after login
      // await refreshProfile();
      navigate("/dashboard");
      console.log("User logged in successfully");
    } catch (error) {
      console.error("Error logging in:", error);
      setError(`Failed to log in: ${error.message}`);
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // If you need to refresh the profile after login
      // await refreshProfile();
      navigate("/dashboard");
      console.log("User logged in with Google successfully");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setError(`Failed to log in with Google: ${error.message}`);
    }
  }

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2 ">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex justify-center items-center gap-2 text-green-800 font-bold text-2xl">
              <LuChartNoAxesCombined />
              Excelytics
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              <form onSubmit={handleLogin} className='flex flex-col gap-6 border p-6 rounded-lg shadow-md'>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <p className="text-balance text-sm text-muted-foreground">
                    Enter your email below to login to your account
                  </p>
                </div>
                <div className="grid gap-6">
                  <div className="grid gap-2">
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
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <a
                        href="#"
                        className="ml-auto text-xs underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder='********' 
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full bg-green-800 hover:bg-green-700">
                    Login
                  </Button>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleSignIn}
                  >
                    <FcGoogle className="mr-2" />
                    Login with Google
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <a href="#" className="underline underline-offset-4 text-blue-700" onClick={() => navigate("/signup")} >
                    Sign up
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex align-center items-center justify-start ">
          <img
            src="/login-illustration.jpg"
            alt="Image"
            className="w-4/5 h-auto object-contain"
          />
        </div>
      </div>
    </>
  );
};

export default Login;