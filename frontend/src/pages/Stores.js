import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Stores = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [ratingModal, setRatingModal] = useState({ show: false, store: null, rating: 5, comment: '' });

  // Get stores on page load
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchName) params.name = searchName;
      if (searchAddress) params.address = searchAddress;
      
      const response = await api.get('/stores', { params });
      
      // Ensure rating is always a number
      const storesWithRating = response.data.map(store => ({
        ...store,
        rating: typeof store.rating === 'string' ? parseFloat(store.rating) || 0 : store.rating || 0
      }));
      
      setStores(storesWithRating);
    } catch (error) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const openRatingModal = (store) => {
    setRatingModal({ show: true, store, rating: 5, comment: '' });
  };

  const closeRatingModal = () => {
    setRatingModal({ show: false, store: null, rating: 5, comment: '' });
  };

  const submitRating = async () => {
    try {
      const { store, rating, comment } = ratingModal;
      
      await api.post('/ratings', {
        storeId: store.id,
        rating,
        comment
      });
      
      toast.success('Rating submitted successfully!');
      closeRatingModal();
      fetchStores(); // Refresh to show new rating
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit rating');
    }
  };

  const updateRating = async () => {
    try {
      const { store, rating, comment } = ratingModal;
      
      // Find existing rating
      const existingRating = store.userRating;
      if (!existingRating) {
        toast.error('No existing rating found');
        return;
      }
      
      await api.put(`/ratings/${existingRating.id}`, {
        rating,
        comment
      });
      
      toast.success('Rating updated successfully!');
      closeRatingModal();
      fetchStores(); // Refresh to show updated rating
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update rating');
    }
  };

  const handleRatingSubmit = () => {
    if (ratingModal.store.userRating) {
      updateRating();
    } else {
      submitRating();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Browse Stores
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

      {/* Search Form */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by store name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by address..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Stores List */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg">Loading stores...</div>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-500">No stores found</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <div key={store.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {store.name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      <span className="font-medium">Address:</span> {store.address}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Overall Rating:</span>{' '}
                      {store.rating && typeof store.rating === 'number' ? `${store.rating.toFixed(1)}/5` : 'No ratings yet'}
                    </p>
                    {store.userRating && (
                      <p className="text-blue-600">
                        <span className="font-medium">Your Rating:</span> {store.userRating.rating}/5
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {store.userRating ? (
                      <button
                        onClick={() => openRatingModal(store)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Update Rating
                      </button>
                    ) : (
                      <button
                        onClick={() => openRatingModal(store)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Rate Store
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Rating Modal */}
      {ratingModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rate {ratingModal.store.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <select
                  value={ratingModal.rating}
                  onChange={(e) => setRatingModal(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{num} - {num === 5 ? 'Excellent' : num === 4 ? 'Good' : num === 3 ? 'Average' : num === 2 ? 'Poor' : 'Very Poor'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (optional)
                </label>
                <textarea
                  value={ratingModal.comment}
                  onChange={(e) => setRatingModal(prev => ({ ...prev, comment: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeRatingModal}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {ratingModal.store.userRating ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stores;
