import { useState, useEffect } from "react";
import { useUserAuth } from "@/context/userAuthContext";
import axios from "axios";
import { FaUserEdit } from "react-icons/fa";
import { TbLogout, TbPhotoEdit } from "react-icons/tb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/v1/user/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        });
        console.log("User Profile Data:", data);
        setUser(data);
        setEditForm({
          name: data.name || "",
          bio: data.bio || "",
          avatar: data.avatar || "",
        });
      } catch (err) {
        setError("Failed to load profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const showTemporaryAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "success" }),
      3000
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
    });
  };

  const handleCancel = () => setIsEditing(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
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
      console.log("Profile updated:", response.data);
      setUser(response.data);

      setIsEditing(false);
      showTemporaryAlert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      showTemporaryAlert(
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
    formData.append("avatar", file);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/v1/user/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("idToken")}`,
          },
        }
      );
      setEditForm((prev) => ({ ...prev, avatar: data.imageUrl }));
    } catch (err) {
      console.error("Error uploading image:", err);
      showTemporaryAlert("Failed to upload image. Please try again.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("idToken");
      showTemporaryAlert("Logged out successfully!");
      window.location.href = "/login";
    } catch (err) {
      console.log("Error logging out:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <Alert className="bg-red-100 border-red-500">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-t-4 border-t-green-500">
      {alert.show && (
        <Alert
          className={`mx-6 mt-6 ${
            alert.type === "error"
              ? "bg-red-100 border-red-500 text-red-800"
              : "bg-green-100 border-green-500 text-green-800"
          }`}
        >
          <AlertDescription className="font-medium">
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {isEditing ? (
        <CardContent className="space-y-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-bold text-green-700">
              Edit Profile
            </CardTitle>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <Avatar className="w-32 h-32 ring-4 ring-green-100 transition-all duration-300 group-hover:ring-green-300">
                <AvatarImage
                  src={editForm.avatar}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-green-100 text-green-700 text-3xl font-bold">
                  {editForm.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full text-white cursor-pointer shadow-md hover:bg-green-700 transition-all duration-200 hover:scale-110">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer flex items-center justify-center"
                >
                  <TbPhotoEdit size={24} className="text-white" />
                  <input
                    type="file"
                    id="avatar-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                type="text"
                name="name"
                value={editForm.name || ""}
                onChange={handleChange}
                className="border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <Textarea
                name="bio"
                value={editForm.bio || ""}
                onChange={handleChange}
                rows={4}
                className="border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200 transition-all duration-200"
                placeholder="Tell us about yourself..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-8">
            <CardTitle className="text-2xl font-bold text-green-700">
              Your Profile
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={handleEdit}
                className="flex items-center text-green-600 hover:text-green-800 hover:bg-green-50 transition-all duration-200"
              >
                <FaUserEdit size={18} className="mr-1" />
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center text-red-600 hover:text-red-800 hover:bg-red-50 transition-all duration-200"
              >
                <TbLogout size={18} className="mr-1" />
                Logout
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 ring-4 ring-green-100 shadow-md">
                <AvatarImage
                  src={user?.avatar}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-green-100 text-green-700 text-3xl font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-grow text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {user?.name}
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-green-400">
                {user?.bio ? (
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                ) : (
                  <p className="text-gray-500 italic">
                    No bio yet. Click Edit to add information about yourself.
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <p className="mb-1">
                    Member since: {new Date().toLocaleDateString()}
                  </p>
                  <p>Email: {user?.email || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default Profile;
