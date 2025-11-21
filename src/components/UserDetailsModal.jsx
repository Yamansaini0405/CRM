import { X } from 'lucide-react';

export default function UserDetailsModal({ user, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Username</p>
              <p className="text-sm text-slate-900 break-all">{user.username}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Phone</p>
              <p className="text-sm text-slate-900">{user.phone}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Email</p>
              <p className="text-sm text-slate-900">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Role</p>
              <p className="text-sm text-slate-900">{user.role}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">First Name</p>
              <p className="text-sm text-slate-900">{user.first_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Last Name</p>
              <p className="text-sm text-slate-900">{user.last_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Is Active</p>
              <p className="text-sm">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_active ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600 uppercase">Is Staff</p>
              <p className="text-sm">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.is_staff
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.is_staff ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
