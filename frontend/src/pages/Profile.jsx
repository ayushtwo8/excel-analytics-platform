import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { FcEditImage, FcCamera, FcCancel } from 'react-icons/fc';
import { 
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

function Profile() {
  const { userProfile, refreshProfile, updateProfile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  // Initialize from userProfile and fetch if needed
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        await refreshProfile();
        setError(null);
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatar || ''
      });
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [userProfile, refreshProfile]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({
      name: userProfile?.name || '',
      bio: userProfile?.bio || '',
      avatar: userProfile?.avatar || ''
    });
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(editForm);
      setIsEditing(false);
      setShowAlert(true);
      setAlertMessage("Profile updated successfully!");
      setAlertType("success");
      
      // Hide alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setShowAlert(true);
      setAlertMessage("Failed to update profile. Please try again.");
      setAlertType("error");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post(`${backendUrl}/api/v1/user/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Update form and preview with new image URL
      setEditForm(prev => ({
        ...prev,
        avatar: response.data.imageUrl
      }));
    } catch (err) {
      console.error('Error uploading image:', err);
      setShowAlert(true);
      setAlertMessage("Failed to upload image. Please try again.");
      setAlertType("error");
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
    <Card className="max-w-2xl mx-auto">
      {showAlert && (
        <Alert className={`mb-4 ${alertType === "error" ? "bg-red-100 border-red-500" : "bg-green-100 border-green-500"}`}>
          <AlertDescription>
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {isEditing ? (
        // Edit Mode
        <CardContent className="space-y-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <CardTitle>Edit Profile</CardTitle>
            <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
              <FcCancel size={20} />
            </Button>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={editForm.avatar} alt="Profile" />
                <AvatarFallback>{editForm.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full text-white cursor-pointer">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <FcCamera size={16} />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                type="text"
                name="name"
                value={editForm.name || ''}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <Textarea
                name="bio"
                value={editForm.bio || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      ) : (
        // View Mode
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-8">
            <CardTitle>Profile</CardTitle>
            <Button 
              variant="ghost"
              onClick={handleEdit}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FcEditImage size={16} className="mr-1" />
              <span>Edit</span>
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32">
                <AvatarImage src={userProfile?.avatar} alt="Profile" />
                <AvatarFallback>{userProfile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h2 className="text-xl font-semibold mb-2">{userProfile?.name}</h2>
              <p className="text-gray-600 mb-4">{userProfile?.bio}</p>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Design</Badge>
                <Badge variant="secondary">Development</Badge>
                <Badge variant="secondary">UX</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default Profile;