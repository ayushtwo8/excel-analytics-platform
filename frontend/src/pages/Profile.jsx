import { useState, useEffect } from "react";
import { useUserAuth } from "@/context/userAuthContext";
import axios from "axios";
import { FaUserEdit } from "react-icons/fa";
import { TbLogout, TbPhotoEdit } from "react-icons/tb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Added CardHeader
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react"; // For a consistent loader
import { Label } from "@/components/ui/label";

// Framer Motion Variants
const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }, // Smooth ease-out
  },
};

const contentSwitchVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 16 },
  },
};
const itemVariantsStiff = {
  // For things that need less "float"
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const avatarVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15, delay: 0.1 },
  },
};

const alertVariants = {
  initial: { opacity: 0, y: -20, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.95,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const { logout } = useUserAuth();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("idToken");
        if (!token) {
          throw new Error("No authentication token found. Please login.");
        }
        const { data } = await axios.get(`${backendUrl}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setEditForm({
          name: data.name || data.displayName || "", // Fallback to displayName
          bio: data.bio || "",
          avatar: data.avatar || data.photoURL || "", // Fallback to photoURL
        });
      } catch (err) {
        setError(err.message || "Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [backendUrl]); // Added backendUrl to dependency array

  const showTemporaryAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "success" }),
      3500 // Slightly longer for visibility
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      // Ensure form is populated correctly when entering edit mode
      name: user?.name || user?.displayName || "",
      bio: user?.bio || "",
      avatar: user?.avatar || user?.photoURL || "",
    });
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(
        `${backendUrl}/api/v1/user/profile`,
        editForm,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        }
      );
      setUser(response.data); // Assuming backend returns the updated user object
      setIsEditing(false);
      showTemporaryAlert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      showTemporaryAlert(
        err.response?.data?.message ||
          "Failed to update profile. Please try again.",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = ({ target: { name, value } }) => {
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file); // Ensure key matches backend ('avatar')

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/v1/user/avatar`, // Endpoint for avatar upload
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        }
      );
      setEditForm((prev) => ({ ...prev, avatar: data.imageUrl }));
      setUser((prevUser) => ({ ...prevUser, avatar: data.imageUrl })); // Also update main user state for immediate reflection if not saving yet
      showTemporaryAlert(
        "Avatar updated! Save changes to make it permanent.",
        "success"
      );
    } catch (err) {
      console.error("Error uploading image:", err);
      showTemporaryAlert(
        err.response?.data?.message ||
          "Failed to upload image. Please try again.",
        "error"
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("idToken");
      showTemporaryAlert("Logged out successfully!");
      // Navigate after a short delay to allow alert to be seen
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      console.log("Error logging out:", err.message);
      showTemporaryAlert("Logout failed. " + err.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  if (error && !user) {
    // Only show full page error if user data couldn't be fetched at all
    return (
      <motion.div
        className="flex justify-center items-center min-h-[calc(100vh-150px)] p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto my-8" // Added my-8 for spacing
    >
      <Card className="shadow-xl border-t-4 border-t-green-500 overflow-hidden">
        <AnimatePresence mode="wait">
          {alert.show && (
            <motion.div
              key="alert"
              variants={alertVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 md:w-auto z-50" // Centered alert
            >
              <Alert
                variant={alert.type === "error" ? "destructive" : "default"}
                className={
                  alert.type === "success"
                    ? "bg-green-50 border-green-500 text-green-700"
                    : ""
                }
              >
                <AlertDescription className="font-medium">
                  {alert.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isEditing ? (
            // EDITING MODE
            <motion.div
              key="editing-profile"
              variants={contentSwitchVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CardHeader>
                <motion.div variants={itemVariantsStiff}>
                  <CardTitle className="text-2xl font-bold text-green-700">
                    Edit Profile
                  </CardTitle>
                </motion.div>
              </CardHeader>
              <CardContent className="space-y-6">
                <motion.div
                  className="flex flex-col items-center"
                  variants={avatarVariants}
                >
                  <div className="relative group">
                    <Avatar className="w-32 h-32 ring-4 ring-green-100 transition-all duration-300 group-hover:ring-green-300 shadow-md">
                      <AvatarImage
                        src={editForm.avatar}
                        alt={editForm.name || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-green-100 text-green-700 text-4xl font-bold">
                        {(
                          editForm.name?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          "U"
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <motion.label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-2 -right-2 bg-green-600 p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:bg-green-700 transition-all duration-200"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.95 }} // <--- This is on a motion.label
                    >
                      <TbPhotoEdit size={22} className="text-white" />
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </motion.label>
                  </div>
                </motion.div>

                <motion.div className="space-y-4" variants={itemVariants}>
                  <div>
                    <Label
                      htmlFor="name-edit"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </Label>
                    <Input
                      id="name-edit"
                      type="text"
                      name="name"
                      value={editForm.name || ""}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200/50 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="bio-edit"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Bio
                    </Label>
                    <Textarea
                      id="bio-edit"
                      name="bio"
                      value={editForm.bio || ""}
                      onChange={handleChange}
                      rows={4}
                      className="border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200/50 transition-all duration-200"
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="flex justify-end space-x-3 pt-2"
                  variants={itemVariants}
                >
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="border-gray-300 hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200 min-w-[120px]"
                  >
                    {isSaving ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </motion.div>
          ) : (
            // VIEWING MODE
            <motion.div
              key="viewing-profile"
              variants={contentSwitchVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <motion.div variants={itemVariantsStiff}>
                    <CardTitle className="text-2xl font-bold text-green-700">
                      Your Profile
                    </CardTitle>
                  </motion.div>
                  <motion.div
                    className="flex space-x-2"
                    variants={itemVariantsStiff}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="flex items-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200"
                    >
                      <FaUserEdit size={16} className="mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="flex items-center text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200"
                    >
                      <TbLogout size={16} className="mr-1.5" />
                      Logout
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  <motion.div
                    className="flex-shrink-0"
                    variants={avatarVariants}
                  >
                    <Avatar className="w-28 h-28 md:w-32 md:h-32 ring-4 ring-green-100 shadow-lg">
                      <AvatarImage
                        src={user?.avatar || user?.photoURL}
                        alt={user?.name || user?.displayName || "User"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-green-100 text-green-700 text-3xl md:text-4xl font-bold">
                        {(
                          user?.name?.charAt(0) ||
                          user?.displayName?.charAt(0) ||
                          user?.email?.charAt(0) ||
                          "U"
                        ).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="flex-grow text-center md:text-left w-full">
                    <motion.h2
                      className="text-2xl md:text-3xl font-bold text-gray-800 mb-1"
                      variants={itemVariants}
                    >
                      {user?.name || user?.displayName || "User Name"}
                    </motion.h2>
                    <motion.p
                      className="text-sm text-gray-500 mb-4"
                      variants={itemVariants}
                    >
                      {user?.email || "No email provided"}
                    </motion.p>

                    <motion.div
                      variants={itemVariants}
                      className="bg-slate-50 p-4 rounded-lg border-l-4 border-green-400 min-h-[60px]"
                    >
                      {user?.bio ? (
                        <p className="text-gray-700 leading-relaxed">
                          {user.bio}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">
                          No bio yet. Click Edit to add information.
                        </p>
                      )}
                    </motion.div>

                    <motion.div
                      className="mt-4 pt-4 border-t border-gray-200"
                      variants={itemVariants}
                    >
                      <div className="text-xs text-gray-500">
                        <p>
                          Member since:{" "}
                          {user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "Recently"}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default Profile;
