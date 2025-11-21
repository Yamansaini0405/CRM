'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, Trash2, Copy, Loader, Plus, Send } from 'lucide-react'; // Added Send icon
import CreateLinkModal from '../../components/CreateLinkModal';
import CreateProductModal from '../../components/CreateProductModal';
import CreateBankModal from '../../components/CreateBankModal';
import LinkDetailsModal from '../../components/LinkDetailsModal';
import { Link } from 'react-router-dom';

export default function LinkView() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // State for viewing link details modal
  const [selectedLink, setSelectedLink] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(null);
  // States for creating new resources
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const { tokens } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';
  
  // --- Static Application URL ---
  // Assuming the unique customer link is used, not a static partner link, 
  // but following your specified format for the text appended at the end.
  const FIXED_APPLY_TEXT = "Click here to apply now! ";

  // Fetch all links on component mount
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    // ... (fetchLinks function remains the same) ...
    try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/links/products/links/`, {
            headers: {
                Authorization: `Bearer ${tokens?.access}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch links');
        const data = await response.json();
        setLinks(data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // ... (handleDelete function remains the same) ...
    if (!confirm('Are you sure you want to delete this link?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/links/products/links/${id}/`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${tokens?.access}`,
            },
        });

        if (!response.ok) throw new Error('Failed to delete link');
        setLinks(links.filter((l) => l.id !== id));
    } catch (err) {
        setError(err.message);
    }
  };

  const handleCopy = (link, id) => {
    // ... (handleCopy function remains the same) ...
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleViewDetails = (link) => {
    setSelectedLink(link);
    setShowModal(true);
  };

  // ⬅️ NEW HANDLER: Send Link via WhatsApp
  const handleSendLink = (link) => {
    // Use description or a fallback message if description is null
    const messageDescription = link.description && link.description.trim() !== '' 
        ? link.description.trim() 
        : `Check out this offer for ${link.product_name} from ${link.bank_name}.`;

    // Construct the final message using the unique customer link (as per your example logic)
    const finalMessage = `${messageDescription}\n\n${FIXED_APPLY_TEXT}${link.unique_customer_link}`;
    
    // Construct the WhatsApp deep link
    const encodedMessage = encodeURIComponent(finalMessage);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;

    // Open the WhatsApp URL
    window.open(whatsappUrl, '_blank');
  };

  // Extract unique banks and products from the fetched links to build the table matrix
  const banks = [
    ...new Map(links.map((l) => [l.bank, { id: l.bank, name: l.bank_name }])).values()
  ];

  const products = [
    ...new Map(links.map((l) => [l.product, { id: l.product, name: l.product_name }])).values()
  ];

  // Create a map for quick lookup: { "bankId-productId": linkObject }
  const linkMap = {};
  links.forEach((link) => {
    linkMap[`${link.bank}-${link.product}`] = link;
  });

  return (
    <div>
      {/* Header and Call-to-Action Buttons */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Links Management</h1>
        <p className="text-slate-600 mt-1">View and manage your customer onboarding links</p>
      </div>

      <div className="mb-6 flex gap-3">
        <Link to='/create-bank'>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Create Bank
        </button>
        </Link>
        <Link to='/create-product'>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Create Product
        </button>
        </Link>
        <button
          onClick={() => setShowCreateLinkModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus size={18} />
          Create Link
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading/Empty State */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : links.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <p className="text-slate-600 text-lg">No links found yet</p>
        </div>
      ) : (
        /* Data Matrix Table */
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Bank column header (Sticky for horizontal scrolling) */}
                <th className="sticky left-0 px-6 py-4 text-left text-sm font-semibold text-white bg-slate-900 border-b border-slate-200 z-10">
                  Bank
                </th>
                {/* Product column headers */}
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="px-4 py-4 text-left text-sm font-semibold text-white bg-slate-900 border-b border-r border-slate-200 min-w-[280px]"
                  >
                    <div className="truncate">{product.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banks.map((bank) => (
                <tr key={bank.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  {/* Bank name cell (Sticky for horizontal scrolling) */}
                  <td className="sticky left-0 px-6 py-4 text-sm font-medium text-slate-900 bg-slate-50 border-r border-slate-200 z-10">
                    {bank.name}
                  </td>
                  
                  {/* Link data cells for each Product */}
                  {products.map((product) => {
                    const link = linkMap[`${bank.id}-${product.id}`];
                    return (
                      <td
                        key={`${bank.id}-${product.id}`}
                        className="px-4 py-4 border-r border-slate-200"
                      >
                        {link ? (
                          <div className="flex items-center gap-2">
                            
                            {/* ⬅️ NEW: Send Button (redirects immediately) */}
                            <button
                                onClick={() => handleSendLink(link)}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700"
                                title="Send via WhatsApp"
                            >
                                <Send size={18} />
                            </button>

                            {/* View Button (Triggers Modal) */}
                            <button
                              onClick={() => handleViewDetails(link)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopy(link.unique_customer_link, link.id)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600 hover:text-green-700"
                              title="Copy link"
                            >
                              {copied === link.id ? (
                                <span className="text-xs font-medium">Copied!</span>
                              ) : (
                                <Copy size={18} />
                              )}
                            </button>
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                              title="Delete link"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showModal && selectedLink && (
        <LinkDetailsModal
          link={selectedLink}
          onClose={() => setShowModal(false)}
          onCopy={() => handleCopy(selectedLink.unique_customer_link, selectedLink.id)}
          copied={copied === selectedLink.id}
        />
      )}

      {showCreateLinkModal && (
        <CreateLinkModal
          onClose={() => setShowCreateLinkModal(false)}
          onSuccess={() => fetchLinks()}
        />
      )}
    </div>
  );
}