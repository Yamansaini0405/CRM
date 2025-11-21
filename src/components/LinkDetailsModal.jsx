'use client';

import { X, Copy, ExternalLink } from 'lucide-react';

export default function LinkDetailsModal({ link, onClose, onCopy, copied }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">Link Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">Link Name</label>
            <p className="text-slate-700 bg-slate-50 px-4 py-3 rounded-lg">{link.name}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Bank</label>
              <p className="text-slate-700 bg-slate-50 px-4 py-3 rounded-lg text-sm">
                {link.bank_name}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Product</label>
              <p className="text-slate-700 bg-slate-50 px-4 py-3 rounded-lg text-sm">
                {link.product_name}
              </p>
            </div>
          </div>

          {link.user_id && (
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">User ID</label>
              <p className="text-slate-700 bg-slate-50 px-4 py-3 rounded-lg text-sm font-mono">
                {link.user_id}
              </p>
            </div>
          )}

          {link.password && (
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">Password</label>
              <p className="text-slate-700 bg-slate-50 px-4 py-3 rounded-lg text-sm font-mono">
                {link.password}
              </p>
            </div>
          )}

          {link.utm_link && (
            <div>
              <label className="text-sm font-semibold text-slate-900 block mb-2">UTM Link</label>
              <a
                href={link.utm_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm truncate flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg"
              >
                {link.utm_link}
                <ExternalLink size={16} />
              </a>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-900 block mb-2">
              Customer Onboarding Link
            </label>
            <div className="flex gap-2">
              <p className="text-slate-700 bg-slate-50 px-4 py-3 rounded-lg text-sm font-mono flex-1 truncate">
                {link.unique_customer_link}
              </p>
              <button
                onClick={onCopy}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap text-sm font-medium"
              >
                {copied ? (
                  <>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {link.created_at && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-600">
                Created on {new Date(link.created_at).toLocaleDateString()}{' '}
                {new Date(link.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
