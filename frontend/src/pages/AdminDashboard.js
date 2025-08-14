import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Debug: Log current user
  console.log('Current user in AdminDashboard:', user);
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal_user'
  });
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerEmail: ''
  });
  
  // Password change state
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Search states
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '' });

  // Load dashboard data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'stores') {
      fetchStores();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin dashboard stats...');
      const response = await api.get('/admin/dashboard');
      console.log('Dashboard response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(userFilters).forEach(key => {
        if (userFilters[key]) params[key] = userFilters[key];
      });
      
      const response = await api.get('/admin/users', { params });
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.keys(storeFilters).forEach(key => {
        if (storeFilters[key]) params[key] = storeFilters[key];
      });
      
      const response = await api.get('/admin/stores', { params });
      setStores(response.data);
    } catch (error) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/admin/users', newUser);
      toast.success('User created successfully!');
      setNewUser({ name: '', email: '', password: '', address: '', role: 'normal_user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await api.post('/admin/stores', newStore);
      toast.success('Store created successfully!');
      setNewStore({ name: '', email: '', address: '', ownerEmail: '' });
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create store');
    }
  };

  const handleUserFilterChange = (key, value) => {
    setUserFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStoreFilterChange = (key, value) => {
    setStoreFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyUserFilters = () => {
    fetchUsers();
  };

  const applyStoreFilters = () => {
    fetchStores();
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    try {
      await api.post('/users/change-password', {
        currentPassword: passwordChange.currentPassword,
        newPassword: passwordChange.newPassword
      });
      
      toast.success('Password changed successfully!');
      setPasswordChange({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
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

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'dashboard' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'users' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
            >
              Manage Users
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`py-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'stores' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
            >
              Manage Stores
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 text-sm font-medium border-b-2 ${
                activeTab === 'password' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
            >
              Change Password
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Dashboard Stats */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-lg">Loading stats...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                     <div className="bg-white rounded-lg shadow p-6">
                     <h3 className="text-lg font-medium text-gray-900 mb-2">Total Users</h3>
                     <p className="text-3xl font-bold text-blue-600">{stats.users || 0}</p>
                   </div>
                   
                   <div className="bg-white rounded-lg shadow p-6">
                     <h3 className="text-lg font-medium text-gray-900 mb-2">Total Stores</h3>
                     <p className="text-3xl font-bold text-green-600">{stats.stores || 0}</p>
                   </div>
                   
                   <div className="bg-white rounded-lg shadow p-6">
                     <h3 className="text-lg font-medium text-gray-900 mb-2">Total Ratings</h3>
                     <p className="text-3xl font-bold text-purple-600">{stats.ratings || 0}</p>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* Manage Users */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
              
              {/* Add New User */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
                
                <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Full name (min 20 characters)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Email address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Password (8-16 chars, uppercase + special)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="normal_user">Normal User</option>
                      <option value="store_owner">Store Owner</option>
                      <option value="system_administrator">System Administrator</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      required
                      rows="3"
                      value={newUser.address}
                      onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Address (max 400 characters)"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                      Create User
                    </button>
                  </div>
                </form>
              </div>

              {/* User Filters */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Users</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    placeholder="Filter by name..."
                    value={userFilters.name}
                    onChange={(e) => handleUserFilterChange('name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Filter by email..."
                    value={userFilters.email}
                    onChange={(e) => handleUserFilterChange('email', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Filter by address..."
                    value={userFilters.address}
                    onChange={(e) => handleUserFilterChange('address', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <select
                    value={userFilters.role}
                    onChange={(e) => handleUserFilterChange('role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="normal_user">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="system_administrator">System Administrator</option>
                  </select>
                </div>
                
                <button
                  onClick={applyUserFilters}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Apply Filters
                </button>
              </div>

              {/* Users List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Users List</h3>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-lg">Loading users...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Rating</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role.replace('_', ' ')}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{user.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.role === 'store_owner' && user.store_rating ? (
                                <span className="text-green-600 font-medium">
                                  {parseFloat(user.store_rating).toFixed(1)}/5 ({user.rating_count} ratings)
                                </span>
                              ) : user.role === 'store_owner' ? (
                                <span className="text-gray-400">No ratings yet</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manage Stores */}
          {activeTab === 'stores' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Stores</h2>
              
              {/* Add New Store */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Store</h3>
                
                <form onSubmit={handleStoreSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input
                      type="text"
                      required
                      value={newStore.name}
                      onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Store name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                    <input
                      type="email"
                      required
                      value={newStore.email}
                      onChange={(e) => setNewStore(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Store email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                    <input
                      type="email"
                      required
                      value={newStore.ownerEmail}
                      onChange={(e) => setNewStore(prev => ({ ...prev, ownerEmail: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Store owner's email"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                    <textarea
                      required
                      rows="3"
                      value={newStore.address}
                      onChange={(e) => setNewStore(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Store address"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                      Create Store
                    </button>
                  </div>
                </form>
              </div>

              {/* Store Filters */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Stores</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Filter by store name..."
                    value={storeFilters.name}
                    onChange={(e) => handleStoreFilterChange('name', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Filter by store email..."
                    value={storeFilters.email}
                    onChange={(e) => handleStoreFilterChange('email', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="text"
                    placeholder="Filter by address..."
                    value={storeFilters.address}
                    onChange={(e) => handleStoreFilterChange('address', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button
                  onClick={applyStoreFilters}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Apply Filters
                </button>
              </div>

              {/* Stores List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Stores List</h3>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="text-lg">Loading stores...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stores.map((store) => (
                          <tr key={store.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{store.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{store.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{store.owner_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {store.rating ? `${store.rating.toFixed(1)}/5` : 'No ratings'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Change Password */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              
              <div className="bg-white rounded-lg shadow p-6 max-w-md">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordChange.currentPassword}
                      onChange={(e) => setPasswordChange(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordChange.newPassword}
                      onChange={(e) => setPasswordChange(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="8-16 chars, uppercase + special"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordChange.confirmPassword}
                      onChange={(e) => setPasswordChange(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
                  >
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
