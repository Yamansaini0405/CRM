import React from 'react';
import { X } from 'lucide-react';

export default function CustomerDetailModal({ customer, onClose, formatDate }) {
  if (!customer) return null;

  // Function to safely display monetary values
  const formatCurrency = (amount) => {
      return `Rs ${parseFloat(amount || 0).toFixed(2)}`;
  };
  
  // Function to render a single detail row
  const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-100">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-sm text-slate-900 font-semibold">{value || 'N/A'}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm  flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 no-scrollbar">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">Details for: {customer.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Modal Body (Full Details) */}
        <div className="p-6 space-y-4">
          
          <h3 className="text-lg font-semibold text-blue-600 border-b pb-2">Primary Information</h3>
          <DetailRow label="ID" value={customer.id} />
          <DetailRow label="Phone" value={customer.phone} />
          <DetailRow label="Email" value={customer.email} />
          <DetailRow label="PAN" value={customer.pan} />
          <DetailRow label="Status" value={customer.status} />
          <DetailRow label="Created On" value={formatDate(customer.created_at)} />

          <h3 className="text-lg font-semibold text-blue-600 border-b pt-4 pb-2">Referral & Commission</h3>
          <DetailRow label="Commission Amount" value={formatCurrency(customer.commission_amount)} />
          <DetailRow label="Product" value={customer.product_name || 'No Product Assigned'} />
          <DetailRow label="Referred By Name" value={customer.referred_by_name || 'N/A'} />
          <DetailRow label="Referred By Phone" value={customer.referred_by_phone || 'N/A'} />
          
          <h3 className="text-lg font-semibold text-blue-600 border-b pt-4 pb-2">Description</h3>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{customer.description || 'No description provided.'}</p>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
        
      </div>
    </div>
  );
}