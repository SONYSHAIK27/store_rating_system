import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Store Rating System
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <Link
              to="/"
              className="text-blue-600 border-b-2 border-blue-600 py-2 px-1 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/stores"
              className="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium"
            >
              Browse Stores
            </Link>
            <Link
              to="/profile"
              className="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium"
            >
              Profile
            </Link>
            {user?.role === 'system_administrator' && (
              <Link
                to="/admin"
                className="text-gray-500 hover:text-gray-700 py-2 px-1 text-sm font-medium"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Browse Stores
                </h3>
                <p className="text-blue-700 mb-4">
                  Discover and rate stores in your area
                </p>
                <Link
                  to="/stores"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  View Stores
                </Link>
              </div>

              {/* Profile Management */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-900 mb-2">
                  Manage Profile
                </h3>
                <p className="text-green-700 mb-4">
                  Update your personal information
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Role Specific */}
              {user?.role === 'store_owner' && (
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">
                    My Stores
                  </h3>
                  <p className="text-purple-700 mb-4">
                    View ratings and manage your stores
                  </p>
                  <Link
                    to="/profile"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
                  >
                    View Stores
                  </Link>
                </div>
              )}

              {user?.role === 'system_administrator' && (
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-red-900 mb-2">
                    Admin Panel
                  </h3>
                  <p className="text-red-700 mb-4">
                    Manage users, stores, and system settings
                  </p>
                  <Link
                    to="/admin"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    Admin Panel
                  </Link>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Your Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-sm text-gray-900 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-sm text-gray-900">{user?.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
