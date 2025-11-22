'use client';

import { useState, useEffect } from 'react';
import { X, Loader, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Helper component for the full-screen image modal
const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm  flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl max-w-2xl max-h-[90vh] p-4" 
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-white hover:bg-slate-100 rounded-full transition-colors z-10"
          title="Close"
        >
          <X size={24} className="text-slate-900" />
        </button>
        <img 
          src={imageUrl} 
          alt="Bank Logo" 
          className="max-w-full max-h-[85vh] object-contain" 
        />
      </div>
    </div>
  );
};


// Helper component for Bank List Row
// onLogoClick is a new prop
const BankRow = ({ bank, onDelete, onLogoClick, API_BASE_URL, tokens }) => {
  const logoUrl = bank.logo ? `${bank.logo}` : '/placeholder-bank.svg';

  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{bank.id}</td>
      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{bank.name}</td>
      <td className="px-6 py-4 text-sm">
        {bank.logo ? (
          // Make the image a clickable button to open the modal
          <button 
            onClick={() => onLogoClick(logoUrl)} 
            className="p-0 border-none bg-transparent focus:outline-none"
            title={`View ${bank.name} Logo`}
          >
            <img 
              src={logoUrl} 
              alt={`${bank.name} logo`} 
              className="h-10 w-auto rounded object-contain border border-slate-200 cursor-pointer hover:opacity-75 transition-opacity" 
            />
          </button>
        ) : (
          <span className="text-slate-500 text-sm">No Logo</span>
        )}
      </td>
      <td className="px-6 py-4 text-sm">
        <button
          onClick={() => onDelete(bank.id)}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          title="Delete Bank"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};


export default function BankManagement() {
  // --- Creation Form State ---
  const [formData, setFormData] = useState({
    name: '',
    logo: null,
  });
  const [creationLoading, setCreationLoading] = useState(false);
  const [creationError, setCreationError] = useState('');
  const [preview, setPreview] = useState('');

  // --- List State ---
  const [banks, setBanks] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  // --- Modal State (NEW) ---
  const [modalImage, setModalImage] = useState(null);
  
  const { tokens } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

  // --- Modal Handlers (NEW) ---
  const openImageModal = (url) => {
    // Only open if it's a real logo, not the placeholder SVG
    if (!url.includes('placeholder-bank.svg')) {
      setModalImage(url);
    }
  }

  const closeImageModal = () => {
    setModalImage(null);
  }

  // --- Effects and Fetching ---

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setListLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/links/banks/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch banks');
      const data = await response.json();
      setBanks(data);
    } catch (err) {
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  // --- Form Handlers ---

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, logo: null });
      setPreview('');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreationError('');

    if (!formData.name.trim()) {
      setCreationError('Bank name is required');
      return;
    }
    if (!formData.logo) {
      setCreationError('Bank logo is required');
      return;
    }

    setCreationLoading(true);

    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('logo', formData.logo);

      const response = await fetch(`${API_BASE_URL}/api/links/banks/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || Object.values(errorData).flat().join('; ') || 'Failed to create bank';
        throw new Error(errorMessage);
      }

      // Success: Reset form, clear preview, and refresh list
      setFormData({ name: '', logo: null });
      setPreview('');
      fetchBanks();
      // Removed: window.location.reload(); as fetchBanks should be sufficient
      
    } catch (err) {
      setCreationError(err.message);
    } finally {
      setCreationLoading(false);
    }
  };

  // --- Delete Handler ---

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bank?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/links/banks/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete bank');
      
      // Update list state directly
      setBanks(banks.filter((b) => b.id !== id));
    } catch (err) {
      setListError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Bank Management</h1>

      {/* --- 1. Create Bank Section --- */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Plus size={20} /> Create New Bank
        </h2>
        
        {creationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {creationError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., HDFC Bank"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Logo Input and Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bank Logo * (PNG/JPG)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {preview && (
                <div className="mt-4 p-3 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50">
                  <img src={preview} alt="Logo preview" className="max-h-16 w-auto rounded object-contain" />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={creationLoading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {creationLoading ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
            {creationLoading ? 'Creating...' : 'Create Bank'}
          </button>
        </form>
      </div>
      
      <hr className="border-slate-200" />
      
      {/* --- 2. Bank List Section --- */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Existing Banks</h2>
        
        {listError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : banks.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-slate-600">No banks found. Use the form above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Bank Id</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {banks.map((bank) => (
                  <BankRow 
                    key={bank.id} 
                    bank={bank} 
                    onDelete={handleDelete} 
                    onLogoClick={openImageModal} // <-- NEW: Pass the handler
                    // Retaining original, unused props for signature compatibility
                    API_BASE_URL={API_BASE_URL} 
                    tokens={tokens}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- 3. Image Modal Renderer (NEW) --- */}
      <ImageModal imageUrl={modalImage} onClose={closeImageModal} />
    </div>
  );
}