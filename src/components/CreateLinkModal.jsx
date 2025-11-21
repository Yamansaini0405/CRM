'use client';

import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CreateLinkModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bank: '',
    product: '',
    name: '',
    user_id: '',
    password: '',
    utm_link: '',
    // --- New/Updated Fields ---
    description: '', // Added description field
    image: '',       // Keeping image as empty string, will send as string
    // --------------------------
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [banks, setBanks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const { tokens } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

  // --- 1. Fetch Bank and Product Options ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [banksRes, productsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/links/banks/`, {
            headers: { Authorization: `Bearer ${tokens?.access}` },
          }),
          fetch(`${API_BASE_URL}/api/links/products/types/`, {
            headers: { Authorization: `Bearer ${tokens?.access}` },
          }),
        ]);

        if (banksRes.ok) setBanks(await banksRes.json());
        if (productsRes.ok) setProducts(await productsRes.json());
      } catch (err) {
        console.error('Failed to fetch options:', err);
        setError('Failed to load bank/product options.');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [tokens, API_BASE_URL]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- 2. Handle Form Submission (POST Request) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bank || !formData.product || !formData.name) {
      setError('Please fill Bank, Product, and Link Name.');
      return;
    }

    setError('');
    setLoading(true);

    // Prepare the request body, ensuring IDs are integers and other fields are sent as strings
    const requestBody = {
      bank: parseInt(formData.bank),
      product: parseInt(formData.product),
      name: formData.name,
      // Send user_id, password, utm_link, description, and image as strings.
      // If the field is optional and the API expects an empty string instead of null, this is correct.
      user_id: formData.user_id,
      password: formData.password,
      utm_link: formData.utm_link,
      description: formData.description, // Included new field
      // image: formData.image,             // Sent as string URL
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/links/products/links/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Improved error handling to show detailed field errors if available
        const errorMessage = errorData.detail 
                           || Object.values(errorData).flat().join('; ') 
                           || 'Failed to create link';
        throw new Error(errorMessage);
      }

      const newLink = await response.json();
      onSuccess(newLink);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 flex items-center gap-3">
          <Loader size={24} className="animate-spin text-blue-600" />
          <span>Loading options...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Create Link</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Bank Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bank *</label>
            <select
              name="bank"
              value={formData.bank}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a bank</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product *</label>
            <select
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Link Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Link Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., HDFC Home Loan Q4"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">User ID</label>
            <input
              type="text"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              placeholder="Portal user ID (Optional)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Portal password (Optional)"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* UTM Link */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">UTM Link</label>
            <input
              type="url"
              name="utm_link"
              value={formData.utm_link}
              onChange={handleChange}
              placeholder="https://example.com?utm_source=..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Description (NEW FIELD) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Detailed description of the link or product."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Link'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}