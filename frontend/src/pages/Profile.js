import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

// Component to display detailed store ratings
const StoreRatingDetails = ({ storeId }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await api.get(`/ratings/store/${storeId}`);
        setRatings(response.data);
      } catch (error) {
        console.error('Failed to load store ratings');
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [storeId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading ratings...</div>;
  }

  if (ratings.length === 0) {
    return <div className="text-sm text-gray-500">No ratings found.</div>;
  }

  return (
    <div className="space-y-3">
      {ratings.map((rating) => (
        <div key={rating.id} className="bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {rating.user_name}
                </span>
                <span className="text-sm text-blue-600 font-medium">
                  {rating.rating}/5
                </span>
              </div>
              {rating.comment && (
                <p className="text-sm text-gray-600 italic">"{rating.comment}"</p>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {new Date(rating.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStores, setUserStores] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [expandedStore, setExpandedStore] = useState(null);

  // Load profile data and user-specific data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || ''
      });
      
      // Load user's stores if they're a store owner
      if (user.role === 'store_owner') {
        fetchUserStores();
      }
      
      // Load user's ratings
      fetchUserRatings();
    }
  }, [user]);

  const fetchUserStores = async () => {
    try {
      const response = await api.get('/users/stores');
      setUserStores(response.data);
    } catch (error) {
      console.error('Failed to load user stores');
    }
  };

  const fetchUserRatings = async () => {
    try {
      const response = await api.get('/ratings/user');
      setUserRatings(response.data);
    } catch (error) {
      console.error('Failed to load user ratings');
    }
  };

  const toggleStoreExpansion = (storeId) => {
    if (expandedStore === storeId) {
      setExpandedStore(null);
    } else {
      setExpandedStore(storeId);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const validateProfileForm = () => {
    if (profileData.name.length < 20) {
      toast.error('Name must be at least 20 characters');
      return false;
    }
    
    if (profileData.address.length > 400) {
      toast.error('Address too long');
      return false;
    }
    
    return true;
  };

  const validatePasswordForm = () => {
    if (passwordData.newPassword.length < 8 || passwordData.newPassword.length > 16) {
      toast.error('Password must be 8-16 characters');
      return false;
    }
    
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      toast.error('Password must contain uppercase letter');
      return false;
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) {
      toast.error('Password must contain special character');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.put('/users/profile', profileData);
      updateProfile(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Management
            </h1>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Profile Information
              </h2>
              
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name (min 20 characters)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    required
                    rows="3"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your address (max 400 characters)"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Change Password
              </h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    name="currentPassword"
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    name="newPassword"
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password (8-16 chars, uppercase + special)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>

          {/* User's Stores (for Store Owners) */}
          {user?.role === 'store_owner' && userStores.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Stores
              </h2>
              
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {userStores.map((store) => (
                   <div key={store.id} className="border border-gray-200 rounded-lg p-4">
                     <div 
                       className="cursor-pointer hover:bg-gray-50 transition-colors"
                       onClick={() => toggleStoreExpansion(store.id)}
                     >
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-medium text-gray-900">{store.name}</h3>
                         <button className="text-blue-600 hover:text-blue-800 text-sm">
                           {expandedStore === store.id ? '▼ Hide' : '▶ Show'} Details
                         </button>
                       </div>
                       <p className="text-sm text-gray-600 mb-2">{store.address}</p>
                       <p className="text-sm text-gray-600">
                         Rating: {store.rating && typeof store.rating === 'number' ? `${store.rating.toFixed(1)}/5 (${store.rating_count} ratings)` : store.rating ? `${parseFloat(store.rating).toFixed(1)}/5 (${store.rating_count} ratings)` : 'No ratings yet'}
                       </p>
                     </div>
                     
                     {/* Expanded Rating Details */}
                     {expandedStore === store.id && (
                       <div className="mt-4 pt-4 border-t border-gray-200">
                         <h4 className="font-medium text-gray-900 mb-3">Rating Details</h4>
                         <StoreRatingDetails storeId={store.id} />
                       </div>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* User's Ratings */}
          {userRatings.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Ratings
              </h2>
              
              <div className="space-y-4">
                {userRatings.map((rating) => (
                  <div key={rating.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{rating.store_name}</h3>
                        <p className="text-sm text-gray-600">{rating.store_address}</p>
                        <p className="text-sm text-blue-600">Your Rating: {rating.rating}/5</p>
                        {rating.comment && (
                          <p className="text-sm text-gray-600 mt-2">"{rating.comment}"</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
