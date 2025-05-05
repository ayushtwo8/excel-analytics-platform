import React, { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store auth info in localStorage
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("uid", user.uid);
      
      // Refresh user profile
      await refreshProfile();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      // User-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Failed to log in. Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Store auth info
      localStorage.setItem("token", await user.getIdToken());
      localStorage.setItem("uid", user.uid);
      
      await refreshProfile();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <Link to="/" className="flex justify-center items-center gap-2 text-green-800 font-bold text-2xl">
              <LuChartNoAxesCombined />
              Excelytics
            </Link>
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
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        to="/reset-password"
                        className="ml-auto text-xs underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder='********' 
                      required 
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-800 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <FcGoogle className="mr-2" />
                        Login with Google
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline underline-offset-4 text-blue-700">
                    Sign up
                  </Link>
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