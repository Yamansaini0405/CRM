import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserEditModal({ user, isOpen, onClose, onUserUpdated }) {
  // Extract product IDs for initial state
  const initialProductAccess = user.products
    ? user.products.filter(p => p.has_access).map(p => p.id)
    : [];

  const [formData, setFormData] = useState({
    phone: user.phone,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    // Initialize with product IDs the user currently has access to
    product_access: initialProductAccess,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { tokens } = useAuth();
  // Get the list of all products from the user prop for rendering checkboxes
  const allProducts = user.products || [];

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'product_access') {
      const productId = parseInt(value);
      setFormData(prevFormData => ({
        ...prevFormData,
        product_access: checked
          ? [...prevFormData.product_access, productId] // Add product ID
          : prevFormData.product_access.filter(id => id !== productId), // Remove product ID
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Prepare the data to be sent, including product_access
    const dataToSend = {
      phone: formData.phone,
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      product_access: formData.product_access, // Include the array of product IDs
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${user.id}/`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), // Use dataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }

      const updatedUser = await response.json();
      onUserUpdated(updatedUser);
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Edit User</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* User Details Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="STAFF">Staff</option>
              <option value="CONNECTOR">Connector</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          
          {/* Product Access Checkboxes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Access</label>
            <div className="flex flex-wrap gap-4 p-3 border border-slate-300 rounded-lg">
              {allProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <input
                    id={`product-${product.id}`}
                    type="checkbox"
                    name="product_access"
                    value={product.id}
                    checked={formData.product_access.includes(product.id)}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`product-${product.id}`}
                    className="ml-2 text-sm text-slate-700"
                  >
                    {product.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? <Loader size={18} className="animate-spin" /> : null}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}