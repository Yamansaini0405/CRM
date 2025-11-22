import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Loader } from 'lucide-react';

export default function CustomerCreate() {
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || ""
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pan: '',
    referred_by: '', // Changed to empty string for consistent input type
    referred_for_product: '', // Changed to empty string for consistent input type
    commission_amount: '',
    // --- New Fields Added Here ---
    status: 'IN_PROGRESS', // Default to a valid status like IN_PROGRESS or APPROVED
    description: '',
    // ----------------------------
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { tokens } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const requestBody = {
      ...formData,
      referred_by: formData.referred_by ? parseInt(formData.referred_by) : null,
      referred_for_product: formData.referred_for_product ? parseInt(formData.referred_for_product) : null,
      commission_amount: formData.commission_amount ? parseFloat(formData.commission_amount) : 0, 
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/management/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Attempt to parse JSON error message
        const errorData = await response.json();
        // Check for specific field errors or general detail
        const errorMessage = errorData.detail 
                             || Object.values(errorData).flat().join('; ') 
                             || 'Failed to create customer';
        throw new Error(errorMessage);
      }

      navigate('/customers');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Create Customer</h1>
      <div className="bg-white rounded-lg shadow p-8 max-w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number"
              />
            </div>
          </div>

          {/* Row 2: Email and PAN */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">PAN</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="PAN number"
              />
            </div>
          </div>
          
          {/* Row 3: Commission and Status (New) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Commission Amount</label>
              <input
                type="number"
                name="commission_amount"
                value={formData.commission_amount}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            {/* --- Status Field --- */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          {/* Row 4: Referred By and Referred For Product (Optional ID fields) */}
          {/* <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Referred By (User ID)</label>
              <input
                type="number"
                name="referred_by"
                value={formData.referred_by}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional User ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Referred For Product (Product ID)</label>
              <input
                type="number"
                name="referred_for_product"
                value={formData.referred_for_product}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional Product ID"
              />
            </div>
          </div> */}

          {/* --- Description Field (New) --- */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes or description"
            />
          </div>
          {/* --------------------------------- */}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader size={20} className="animate-spin" /> : null}
              {loading ? 'Creating...' : 'Create Customer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/customers')}
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