import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserAuth } from "@/context/userAuthContext";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, googleSignIn, logout } = useUserAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // To distinguish which button is causing the loading state
  const [loadingAction, setLoadingAction] = useState(null);


  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setLoadingAction("email"); // Mark email login as active
    try {
      const { user } = await login(email, password);
      const idToken = await user.getIdToken();
      localStorage.setItem("idToken", idToken);
      navigate("/dashboard");
    } catch (error) {
      // setIsLoading(false); // Handled in finally
      console.error("Error logging in:", error);
      setError(`Failed to log in: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setLoadingAction("google"); // Mark Google sign-in as active
    try {
      const { user } = await googleSignIn();
      const idToken = await user.getIdToken();

      const res = await axios.post(
        `${backendUrl}/api/v1/user/checkUser`,
        { idToken },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (res.data.exists) {
        localStorage.setItem("idToken", idToken);
        navigate("/dashboard");
      } else {
        const createRes = await axios.post(
          `${backendUrl}/api/v1/user/profile`,
          {
            email: user.email,
            displayName: user.displayName || email.split('@')[0], // Default display name
            photoURL: user.photoURL || "",
            bio: "",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        if (createRes.data.success) {
          localStorage.setItem("idToken", idToken);
          navigate("/dashboard");
        } else {
          setError("Failed to create user profile. Please try again.");
          await logout();
        }
      }
    } catch (error) {
      console.error("Google sign in failed", error);
      setError(`Google sign in failed. Please try again: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // Animation Variants - Adjusted for "floatier" and "smoother" feel

  const pageContainerVariants = { // For the overall grid
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  const leftPanelVariants = {
    hidden: { x: -150, opacity: 0 }, // Start further off-screen
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1], delay: 0.1 } // Custom ease-out, slight delay
    },
  };

  const rightPanelVariants = {
    hidden: { x: 150, opacity: 0 }, // Start further off-screen
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1], delay: 0.25 } // Custom ease-out, slightly more delay
    },
  };

  const logoVariants = {
    hidden: { scale: 0.7, opacity: 0, y: -20 }, // Add y movement
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.4, ease: "easeOut" } // Smoother, slightly longer
    },
  };

  // Renamed from containerVariants to formElementsContainerVariants for clarity
  const formElementsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.5, // Delay for the form elements to start after panel
        staggerChildren: 0.2, // Slightly increased stagger
        delayChildren: 0.1,
        ease: "easeInOut"
      },
    },
  };

  // Renamed from itemVariants to formItemVariants for clarity
  const formItemVariants = {
    hidden: { y: 30, opacity: 0 }, // Start lower
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70, // Softer spring
        damping: 18,
        mass: 1.2,
      }
    },
  };

  const imageVariants = { // Specific variants for the image
    hidden: { scale: 0.7, opacity: 0, x: 30 }, // Add x movement from the right
    visible: {
      scale: 1,
      opacity: 1,
      x: 0,
      transition: {
        duration: 1.2,
        delay: 0.5, // Delay after right panel appears
        ease: [0.33, 1, 0.68, 1] // Gentle float and settle
      }
    },
  };


  const errorVariants = {
    hidden: { opacity: 0, y: -15, height: 0 }, // Start higher, include height
    visible: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: { duration: 0.5, ease: "easeInOut" }
    },
    exit: {
      opacity: 0,
      y: -15,
      height: 0,
      transition: { duration: 0.4, ease: "easeInOut" }
    },
  };

  return (
    <>
      <motion.div
        className="grid min-h-svh lg:grid-cols-2"
        variants={pageContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex flex-col gap-4 p-6 md:p-10"
          variants={leftPanelVariants}
          // initial="hidden" // Inherited from parent
          // animate="visible" // Inherited from parent
        >
          <motion.div
            className="flex justify-center gap-2 md:justify-start"
            variants={logoVariants}
          >
            <Link
              to="/"
              className="flex justify-center items-center gap-2 text-green-800 font-bold text-2xl"
            >
              <LuChartNoAxesCombined />
              Excelytics
            </Link>
          </motion.div>
          <div className="flex flex-1 items-center justify-center">
            <motion.div
              className="w-full max-w-sm"
              variants={formElementsContainerVariants} // Staggers its children
            >
              <motion.form
                onSubmit={handleLogin}
                className="flex flex-col gap-6 border p-6 rounded-lg shadow-md bg-white" // Added bg-white
                 // The form itself isn't individually animated here, its parent (formElementsContainerVariants) handles the entry
              >
                <motion.div
                  className="flex flex-col items-center gap-2 text-center"
                  variants={formItemVariants}
                >
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        className="text-red-500 text-sm my-2" // Added margin for error
                        variants={errorVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <p className="text-balance text-sm text-muted-foreground">
                    Enter your email below to login to your account
                  </p>
                </motion.div>

                <motion.div className="grid gap-6" variants={formItemVariants}> {/* Group for staggering */}
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
                      placeholder="********"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>


                <motion.div variants={formItemVariants}
                whileHover={{
                      scale: 1.04,
                      y: -3,
                      transition: { type: "spring", stiffness: 280, damping: 12 }
                    }}
                    whileTap={{ scale: 0.97, y: -1 }}>
                  <Button
                    type="submit"
                    className="w-full bg-green-800 hover:bg-green-700 text-white py-2.5" // Added text-white, adjusted padding
                    disabled={isLoading}
                    
                  >
                    {isLoading && loadingAction === "email" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </motion.div>

                <motion.div
                  className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
                  variants={formItemVariants}
                >
                  <span className="relative z-10 bg-white px-2 text-muted-foreground"> {/* Changed bg-background to bg-white */}
                    Or continue with
                  </span>
                </motion.div>

                <motion.div variants={formItemVariants}
                whileHover={{
                        scale: 1.04,
                        y: -3,
                        transition: { type: "spring", stiffness: 280, damping: 12 }
                      }}
                    whileTap={{ scale: 0.97, y: -1 }}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full py-2.5" // Adjusted padding
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    
                  >
                    {isLoading && loadingAction === "google" ? (
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
                </motion.div>

                <motion.div className="text-center text-sm" variants={formItemVariants}>
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="underline underline-offset-4 text-blue-700 hover:text-blue-600"
                  >
                    Sign up
                  </Link>
                </motion.div>
              </motion.form>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="hidden lg:flex align-center items-center justify-center" // Centered justify
          variants={rightPanelVariants}
          // initial="hidden" // Inherited
          // animate="visible" // Inherited
        >
          <motion.img
            src="/login-illustration.jpg"
            alt="Image"
            className="w-4/5 h-auto object-contain"
            variants={imageVariants} // Using specific image variants
          />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Login;