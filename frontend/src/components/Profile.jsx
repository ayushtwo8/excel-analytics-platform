import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const { userProfile, updateProfile, profileLoading, currentUser } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photoURL: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || '',
        photoURL: userProfile.photoURL || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (!currentUser && !profileLoading) {
      navigate('/login');
    }
  }, [currentUser, profileLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await updateProfile(formData);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      window.scrollTo(0, 0);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow rounded-lg">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <input
            type="text"
            name="displayName"
            id="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>

        {/* Profile Photo URL */}
        <div>
          <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
            Profile Photo URL
          </label>
          <div className="flex items-center mt-1">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 mr-4">
              {formData.photoURL ? (
                <img
                  src={formData.photoURL}
                  alt="Profile Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150?text=Error';
                  }}
                />
              ) : (
                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </div>
            <input
              type="text"
              name="photoURL"
              id="photoURL"
              value={formData.photoURL}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a little about yourself"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="mr-3 px-4 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
              isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;
