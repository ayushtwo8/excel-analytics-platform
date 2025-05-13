import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { Loader2 } from "lucide-react";
import { useUserAuth } from "@/context/userAuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useUserAuth();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { user } = await signUp(email, password);
      const idToken = await user.getIdToken();

      const userProfile = {
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        photoURL: user.photoURL || "",
      };

      await axios.post(`${backendUrl}/api/v1/user/profile`, userProfile, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      console.log("User profile created for:", userProfile.email);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup Error:", error);
      let errorMessage = "Signup Failed. Please try again.";
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email address is already in use. Please try a different email or login.";
            break;
          case 'auth/weak-password':
            errorMessage = "The password is too weak. Please choose a stronger password.";
            break;
          default:
            errorMessage = error.message;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation Variants - Adjusted for "floatier" and "smoother" feel
  const pageVariants = {
    hidden: { opacity: 0 },
    // Smoother page transition with a slight delay to let other elements start
    visible: { opacity: 1, transition: { duration: 0.6, delay: 0.1, ease: "easeInOut" } },
  };

  const panelVariants = {
    hiddenLeft: { x: -150, opacity: 0 }, // Start further off-screen
    hiddenRight: { x: 150, opacity: 0 }, // Start further off-screen
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: [0.25, 1, 0.5, 1] } // Custom ease-out for smooth arrival
    },
  };

  const imageVariants = {
    hidden: { scale: 0.7, opacity: 0, y: 40 }, // Start smaller, lower, and faded
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2, // Longer duration for floaty effect
        delay: 0.4,    // Delay after panel starts appearing
        ease: [0.33, 1, 0.68, 1] // Custom gentle ease-out (float and settle)
      }
    },
  };

  const welcomeVariants = {
    hidden: { y: -50, opacity: 0 }, // Start further up
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.9, delay: 0.6, ease: "easeOut" } // Smoother and slightly longer
    },
  };

  const formContainerVariants = {
    hidden: { opacity: 0, y: 70 }, // Start lower
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8, // Longer duration for the container
        delay: 0.7,     // Delay after welcome text
        when: "beforeChildren",
        staggerChildren: 0.25, // Slightly increased stagger for more pronounced float-in
        ease: "easeInOut"
      },
    },
  };

  const formItemVariants = {
    hidden: { opacity: 0, y: 30 }, // Start lower for a more noticeable rise
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 60, // Lower stiffness for softer spring
        damping: 15,   // Good damping to prevent excessive oscillation but allow softness
        mass: 1.1,     // Slightly increased mass for a more "weighted" float
      }
    },
  };

  const errorVariants = {
    hidden: { opacity: 0, height: 0, y: -10, marginTop: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      y: 0,
      marginTop: "1rem",
      marginBottom: "1rem",
      transition: { duration: 0.5, ease: "easeInOut" } // Smoother transition for error
    },
    exit: {
      opacity: 0,
      height: 0,
      y: -10,
      marginTop: 0,
      marginBottom: 0,
      transition: { duration: 0.4, ease: "easeInOut" }
    },
  };


  return (
    <motion.div
      className="grid min-h-screen lg:grid-cols-2"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="hidden lg:flex items-center justify-center " // Removed bg-green-50 as per your last code
        variants={panelVariants}
        initial="hiddenLeft"
        animate="visible"
      >
        <motion.img
          src="/signup-illustration.jpg"
          alt="Signup Illustration"
          className="w-[70%] h-auto object-contain"
          variants={imageVariants}
          // initial & animate are inherited or handled by variants if not specified
        />
      </motion.div>

      <motion.div
        className="flex flex-col items-center justify-center px-6 py-10 md:px-12"
        variants={panelVariants}
        initial="hiddenRight"
        animate="visible"
      >
        <div className="w-full max-w-md space-y-8 md:space-y-12">
          <motion.div variants={welcomeVariants}>
            <Link
              to="/"
              className="flex flex-col sm:flex-row justify-center items-center gap-2 font-bold text-3xl md:text-4xl text-gray-700"
            >
              Welcome to
              <span className="flex text-green-800 align-center justify-center items-center">
                <LuChartNoAxesCombined className="mr-1" /> Excelytics
              </span>
            </Link>
          </motion.div>

          <motion.form
            onSubmit={handleSignup}
            className="flex flex-col gap-6 border p-8 md:p-10 rounded-xl shadow-lg bg-white"
            variants={formContainerVariants}
          >
            <motion.h2
              className="text-center text-2xl md:text-3xl font-semibold pb-4 text-gray-800"
              variants={formItemVariants}
            >
              Create Your Account
            </motion.h2>

            <AnimatePresence>
              {error && (
                <motion.div
                  className="rounded-md bg-red-50 p-4"
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div className="space-y-4" variants={formItemVariants}>
              <div className="space-y-2">
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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  required
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            <motion.div variants={formItemVariants}
            whileHover={{
                  scale: 1.04,
                  y: -3, // Slight lift on hover
                  transition: { type: "spring", stiffness: 280, damping: 12 } // Softer spring for hover
                }}
                whileTap={{ scale: 0.97, y: -1 }}>
              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-700 text-white py-3 text-base"
                disabled={isLoading}
                
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </motion.div>

            <motion.p
              className="text-center text-sm text-gray-600"
              variants={formItemVariants}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign In
              </Link>
            </motion.p>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;