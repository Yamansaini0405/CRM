import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Plus, Eye, Edit2, Trash2, Loader, ArrowUp, ArrowDown } from 'lucide-react';
import CustomerDetailModal from '../../components/CustomerDetailModal.jsx';


// Helper function to format date (optional but good practice)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export default function CustomerView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // 🔍 NEW: State for Search and Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });

  const { tokens } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || ""

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    // ... (fetchCustomers function remains the same) ...
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/management/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // ... (handleDelete function remains the same) ...
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/management/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete customer');
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Function to open the modal with customer data
  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };
  
  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  // ⬇️ NEW: Sorting and Filtering Logic using useMemo
  const sortedAndFilteredCustomers = useMemo(() => {
    let sortableCustomers = [...customers];
    const lowerCaseSearch = searchTerm.toLowerCase();

    // 1. Filtering (Search by name, email, or phone)
    if (searchTerm) {
      sortableCustomers = sortableCustomers.filter(customer => 
        customer.name?.toLowerCase().includes(lowerCaseSearch) ||
        customer.email?.toLowerCase().includes(lowerCaseSearch) ||
        customer.phone?.includes(searchTerm)
      );
    }

    // 2. Sorting
    if (sortConfig.key !== null) {
      sortableCustomers.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableCustomers;
  }, [customers, searchTerm, sortConfig]);

  // 3. Sorting Request Handler
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // 4. Helper to render sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    if (sortConfig.direction === 'ascending') {
        return <ArrowUp size={14} className="ml-1" />;
    }
    return <ArrowDown size={14} className="ml-1" />;
  };
  // ⬆️ END NEW LOGIC

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage your customer relationships</p>
        </div>
        <Link
          to="/customers/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Customer
        </Link>
      </div>

      {/* 🔍 NEW: Search Input */}
      <div className="mb-6">
        <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[40%] px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader className="animate-spin" size={32} />
        </div>
      ) : sortedAndFilteredCustomers.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-slate-600">
                {searchTerm ? `No results found for "${searchTerm}".` : "No customers found. Create your first customer!"}
            </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-900">
              <tr>
                {/* 🔨 Sortable Headers */}
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    <button onClick={() => requestSort('name')} className="flex items-center focus:outline-none">
                        Name {getSortIcon('name')}
                    </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    <button onClick={() => requestSort('email')} className="flex items-center focus:outline-none">
                        Email {getSortIcon('email')}
                    </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                    <button onClick={() => requestSort('status')} className="flex items-center focus:outline-none">
                        Status {getSortIcon('status')}
                    </button>
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedAndFilteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{customer.email}</td>
                  
                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      customer.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Button (Triggers Modal) */}
                      <button 
                        onClick={() => handleViewDetails(customer)}
                        title="View Details"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>

                      {/* Edit Button (Navigates to Edit Page) */}
                      <Link 
                         to={`/customers/edit/${customer.id}`} 
                         title="Edit Customer"
                         className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} className="text-green-600" />
                      </Link>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(customer.id)}
                        title="Delete Customer"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Detail Modal Component */}
      {isModalOpen && selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer} 
          onClose={handleCloseModal} 
          // You can pass the format function down if needed
          formatDate={formatDate}
        />
      )}
    </div>
  );
}