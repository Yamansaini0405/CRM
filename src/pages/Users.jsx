import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Loader, ChevronDown, ChevronUp, Download } from 'lucide-react';
import UserEditModal from '../components/UserEditModal';

// --- Utility Function: Download CSV ---
const exportUserToCSV = (user, filename = 'user_details.csv') => {
    if (!user) return;

    // --- Prepare Main User Data ---
    const mainHeaders = [
        'ID', 'First Name', 'Last Name', 'Phone', 'Email', 'Role', 'Status', 'Username'
    ];
    const mainDataRow = [
        user.id,
        user.first_name || '',
        user.last_name || '',
        user.phone || '',
        user.email || '',
        user.role || '',
        user.is_active ? 'Active' : 'Inactive',
        user.username || '',
    ].map(value => {
        const str = String(value);
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',');

    let csvContent = [mainHeaders.join(','), mainDataRow].join('\n');

    // --- Append Referred Customers Data ---
    if (user.referred_customers && user.referred_customers.length > 0) {
        const customerHeaders = [
            'Customer ID', 'Customer Name', 'Customer Phone', 'PAN', 'Status', 'Commission', 'Product', 'Bank'
        ];
        
        csvContent += '\n\nReferred Customers:\n';
        csvContent += customerHeaders.join(',') + '\n';
        
        user.referred_customers.forEach(cust => {
            const custRow = [
                cust.id,
                cust.name || '',
                cust.phone || '',
                cust.pan || '',
                cust.status || '',
                parseFloat(cust.commission_amount || 0).toFixed(2),
                cust.product_name || '',
                cust.bank_name || ''
            ].map(value => {
                const str = String(value);
                return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str.replace(/"/g, '""')}"` : str;
            }).join(',');
            csvContent += custRow + '\n';
        });
    }

    // Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${user.first_name}_${user.last_name}_${user.id}_details.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
// ----------------------------------------


export default function Users() {
  const [formData, setFormData] = useState({
    phone: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'STAFF',
    password: '',
    password2: '',
  });

  const [users, setUsers] = useState([]);
  
  // State for Row Expansion
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [expandedUserDetail, setExpandedUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // State for Edit Modal
  const [editingUser, setEditingUser] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [tableError, setTableError] = useState('');
  
  const { tokens } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setTableLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setTableError(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.password2) {
      setFormError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    setFormLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          password2: formData.password2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail 
                           || Object.values(errorData).flat().join('; ') 
                           || 'Failed to create user';
        throw new Error(errorMessage);
      }

      setFormData({
        phone: '',
        first_name: '',
        last_name: '',
        email: '',
        role: 'STAFF',
        password: '',
        password2: '',
      });

      await fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // NOTE: Using /api/user/{id}/ as per your existing code structure
      const response = await fetch(`${API_BASE_URL}/api/user/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(users.filter((u) => u.id !== id));
      
      // If deleted user was expanded, collapse the row
      if (expandedUserId === id) {
        setExpandedUserId(null);
        setExpandedUserDetail(null);
      }
    } catch (err) {
      setTableError(err.message);
    }
  };

  const handleExpandRow = async (userId) => {
    if (expandedUserId === userId) {
      // Collapse if already open
      setExpandedUserId(null);
      setExpandedUserDetail(null);
      return;
    }

    // Open new row
    setExpandedUserId(userId);
    setDetailLoading(true);
    setExpandedUserDetail(null); // Clear previous data immediately

    try {
      // NOTE: Using /api/user/{id}/ as per your existing code structure
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user details');
      const data = await response.json();
      setExpandedUserDetail(data);
    } catch (err) {
      console.error(err);
      setExpandedUserDetail(null); // Ensure detail is null if fetch fails
      setTableError('Failed to load user details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Helper component for customer status badge
  const CustomerStatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (status === 'APPROVED') colorClass = 'bg-green-100 text-green-800';
    if (status === 'IN_PROGRESS') colorClass = 'bg-yellow-100 text-yellow-800';
    if (status === 'REJECTED') colorClass = 'bg-red-100 text-red-800';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };


  return (
    <div className="space-y-8">
      {/* --- Create User Section --- */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Users</h1>
        <p className="text-slate-600 mb-8">Create and manage system users</p>

        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Create New User</h2>

          {formError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* Form Fields Grid (Same as before) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STAFF">Staff</option>
                  <option value="CONNECTOR">Connector</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {formLoading ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
              {formLoading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      </div>

      ---

      {/* --- Users Table Section --- */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Users List</h2>

        {tableError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {tableError}
          </div>
        )}

        {tableLoading ? (
          <div className="flex items-center justify-center p-8 bg-white rounded-lg">
            <Loader className="animate-spin" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg">
            <p className="text-slate-600">No users found. Create your first user!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-900 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white w-10"></th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <Fragment key={user.id}>
                    <tr 
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${expandedUserId === user.id ? 'bg-slate-50' : ''}`}
                    >
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleExpandRow(user.id)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors focus:outline-none"
                        >
                          {expandedUserId === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'STAFF'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit2 size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row Section (Updated to show Referred Customers) */}
                    {expandedUserId === user.id && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan="7" className="px-6 py-4">
                          <div className="pl-10">
                            {detailLoading ? (
                              <div className="flex items-center gap-2 text-slate-500 py-4">
                                <Loader className="animate-spin" size={16} />
                                <span>Loading details...</span>
                              </div>
                            ) : expandedUserDetail ? (
                              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                                
                                {/* Header with Export Button */}
                                <div className='flex justify-between items-center mb-4 border-b border-slate-100 pb-2'>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                        User Details
                                    </h4>
                                    <button
                                        onClick={() => exportUserToCSV(expandedUserDetail)}
                                        className="flex items-center gap-1 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors"
                                        title="Export to CSV"
                                    >
                                        <Download size={14} />
                                        Export CSV
                                    </button>
                                </div>
                                
                                {/* Primary Details Grid (Same as before) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 mb-6">
                                  {/* ... Primary Details JSX (Full Name, Username, Email, Phone, Role, Status) ... */}
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</p>
                                    <p className="text-base text-slate-900 font-medium">
                                      {expandedUserDetail.first_name} {expandedUserDetail.last_name}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Username</p>
                                    <p className="text-base text-slate-900">{expandedUserDetail.username || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</p>
                                    <p className="text-base text-slate-900">{expandedUserDetail.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Phone Number</p>
                                    <p className="text-base text-slate-900">{expandedUserDetail.phone}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">System Role</p>
                                    <span className="inline-block bg-slate-100 px-2 py-1 rounded text-sm font-medium text-slate-700">
                                      {expandedUserDetail.role}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Account Status</p>
                                    <span className={`text-sm font-medium ${expandedUserDetail.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                      {expandedUserDetail.is_active ? '● Active' : '● Inactive'}
                                    </span>
                                  </div>
                                </div>
                                
                                ---

                                {/* --- Referred Customers Section (NEW) --- */}
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                                    Referred Customers ({expandedUserDetail.referred_customers?.length || 0})
                                </h4>
                                {expandedUserDetail.referred_customers && expandedUserDetail.referred_customers.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead>
                                                <tr className="bg-slate-50">
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">Phone</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">Product</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-600 uppercase">Commission</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {expandedUserDetail.referred_customers.map((customer) => (
                                                    <tr key={customer.id}>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">{customer.name}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{customer.phone}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{customer.product_name} ({customer.bank_name})</td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <CustomerStatusBadge status={customer.status} />
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">
                                                            ${parseFloat(customer.commission_amount || 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 py-3">This user has not referred any customers yet.</p>
                                )}
                                {/* --- Product Permissions Section (NEW) --- */}
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pt-4 border-b border-slate-100 pb-2">
                                    Product Permissions ({expandedUserDetail.products?.length || 0})
                                </h4>
                                {expandedUserDetail.products && expandedUserDetail.products.length > 0 ? (
                                    <div className="flex flex-wrap gap-4">
                                        {expandedUserDetail.products.map((product) => (
                                            <span 
                                                key={product.id}
                                                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                                                    product.has_access 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {product.name}: {product.has_access ? 'Allowed' : 'Denied'}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 py-3">No product permissions defined for this user.</p>
                                )}
                                {/* --------------------------------------------- */}

                              </div>
                            ) : (
                              <div className="text-red-500 py-2">Failed to load details.</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUserUpdated={(updatedUser) => {
            setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
            setEditingUser(null);
            // Also update expanded detail if it's the same user
            if (expandedUserId === updatedUser.id) {
               setExpandedUserDetail(updatedUser);
            }
          }}
        />
      )}
    </div>
  );
} 