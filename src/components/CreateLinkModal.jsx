'use client';

import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function CreateLinkModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bank: '', // Will hold the selected bank ID (as a string)
    product: '',
    name: '',
    user_id: '',
    password: '',
    utm_link: '',
    description: '',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [banks, setBanks] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // --- NEW STATE FOR CUSTOM BANK DROPDOWN ---
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  // ------------------------------------------

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

  // --- NEW HANDLER FOR CUSTOM BANK SELECTION ---
  const handleBankSelect = (bankId) => {
    setFormData(prev => ({
        ...prev,
        bank: bankId.toString(), // Store as string to match other form fields
    }));
    setIsBankDropdownOpen(false); // Close the dropdown after selection
  };
  
  // Helper to find the currently selected bank object for display
  const selectedBank = banks.find(b => b.id === parseInt(formData.bank));
  // ------------------------------------------

  // --- 2. Handle Form Submission (POST Request) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bank || !formData.product || !formData.name) {
      setError('Please fill Bank, Product, and Link Name.');
      return;
    }

    setError('');
    setLoading(true);

    // Prepare the request body, ensuring IDs are integers
    const requestBody = {
      // Note: formData.bank is a string, so we must parse it to an integer for the API
      bank: parseInt(formData.bank),
      product: parseInt(formData.product),
      name: formData.name,
      user_id: formData.user_id,
      password: formData.password,
      utm_link: formData.utm_link,
      description: formData.description,

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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
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

          {/* Bank Select (CUSTOM DROPDOWN WITH LOGO) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Bank *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                aria-expanded={isBankDropdownOpen}
              >
                {selectedBank ? (
                  <span className="flex items-center gap-3">
                    <img src={selectedBank.logo} alt={`${selectedBank.name} logo`} className="h-6 w-auto object-contain" />
                    <span className="text-slate-900 font-medium">{selectedBank.name}</span>
                  </span>
                ) : (
                  <span className="text-slate-500">Select a bank</span>
                )}
                <svg 
                  className={`w-4 h-4 text-slate-500 transform transition-transform ${isBankDropdownOpen ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {isBankDropdownOpen && (
                <div 
                  className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  <ul className="py-1">
                    {banks.map((b) => (
                      <li key={b.id}>
                        <button
                          type="button"
                          onClick={() => handleBankSelect(b.id)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                        >
                          <img src={b.logo} alt={`${b.name} logo`} className="h-6 w-auto object-contain" />
                          <span className="text-slate-900">{b.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* We no longer need the hidden input for 'bank' since the button/custom UI handles the click and updates formData.bank */}
          </div>

          {/* Product Select (Standard Dropdown remains) */}
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