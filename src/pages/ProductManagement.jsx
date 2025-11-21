'use client';

import { useState, useEffect } from 'react';
import { X, Loader, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Helper component for Product List Row
const ProductRow = ({ product, onDelete }) => {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{product.name}</td>
      <td className="px-6 py-4 text-sm text-slate-500">{product.id}</td>
      <td className="px-6 py-4 text-sm">
        <button
          onClick={() => onDelete(product.id)}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          title="Delete Product"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default function ProductManagement() {
  // --- Creation Form State ---
  const [name, setName] = useState('');
  const [creationLoading, setCreationLoading] = useState(false);
  const [creationError, setCreationError] = useState('');

  // --- List State ---
  const [products, setProducts] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const { tokens } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

  // --- Effects and Fetching ---

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setListLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/links/products/types/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setListError(err.message);
    } finally {
      setListLoading(false);
    }
  };

  // --- Form Handler (Create) ---

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreationError('');

    if (!name.trim()) {
      setCreationError('Product name is required');
      return;
    }

    setCreationLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/links/products/types/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || Object.values(errorData).flat().join('; ') || 'Failed to create product';
        throw new Error(errorMessage);
      }

      // Success: Reset form and refresh list
      setName('');
      fetchProducts();
      
    } catch (err) {
      setCreationError(err.message);
    } finally {
      setCreationLoading(false);
    }
  };

  // --- Delete Handler ---

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/links/products/types/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      // Update list state directly
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      setListError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Product Type Management</h1>

      {/* --- 1. Create Product Section --- */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Plus size={20} /> Create New Product Type
        </h2>
        
        {creationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {creationError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Home Loan, Savings Account"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={creationLoading}
            className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {creationLoading ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
            {creationLoading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
      
      ---
      
      {/* --- 2. Product List Section --- */}
      <div className="bg-white rounded-lg shadow p-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Existing Product Types</h2>
        
        {listError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-slate-600">No product types found. Use the form above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((product) => (
                  <ProductRow 
                    key={product.id} 
                    product={product} 
                    onDelete={handleDelete} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}