import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, LinkIcon, UserPlus, ChevronDown, Menu, X, Banknote, Building, Building2, Box, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Helper for exact matches on submenu items
  const isActiveLink = (path) => location.pathname === path;

  // Check if the current path belongs to a parent to auto-expand the menu
  const isParentActive = (path) => location.pathname.includes(path);

  // Automatically expand the menu if we are on a child page (optional UX improvement)
  useEffect(() => {
    if (location.pathname.includes('/customers')) {
      setExpandedMenu('Customers');
    }
  }, [location.pathname]);

  const menuItems = [
    {
      label: 'Customers',
      icon: Users,
      // Ensure path strings used for checking logic match the route structure (use absolute paths)
      pathKey: 'customers',
      submenu: [
        { label: 'View Customers', path: '/customers' },
        { label: 'Create Customer', path: '/customers/create' },
      ],
    },
    {
      label: 'Links',
      icon: LinkIcon,
      path: '/links',
    },
    {
      label: 'Create Bank',
      icon: Building2,
      path: '/create-bank',
    },
    {
      label: 'Create Product',
      icon: Box,
      path: '/create-product',
    },
    ...(user?.role === 'ADMIN'
      ? [
        {
          label: 'Users',
          icon: UserPlus,
          path: '/users',
        },
      ]
      : []),
      ...(user?.role === 'ADMIN'
      ? [
        {
          label: 'Slider Management',
          icon: Settings,
          path: '/slider-management',
        },
      ]
      : []),
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <div
        className={`${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:relative w-72 h-screen bg-slate-900 text-white transition-transform duration-300 z-40 flex flex-col`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold">CRM Software</h1>

        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <div>
                  {/* Parent Dropdown Button */}
                  <button
                    onClick={() =>
                      setExpandedMenu(expandedMenu === item.label ? null : item.label)
                    }
                    // FIX: Removed conditional bg-blue-600. It is now always transparent/slate.
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-slate-800 ${
                      // Optional: Keep text white if expanded, but no background
                      expandedMenu === item.label || isParentActive(item.pathKey) ? 'text-white' : ''
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${expandedMenu === item.label ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {/* Submenu Items */}
                  {expandedMenu === item.label && (
                    <div className="ml-4 mt-2 space-y-2 border-l border-slate-700 pl-2">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.path}
                          to={subitem.path}
                          onClick={() => setIsOpen(false)}
                          className={`block px-4 py-2 rounded-lg transition-colors ${
                            // Logic determines if THIS specific child is active
                            isActiveLink(subitem.path)
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Single Link Items (Links, Users)
                <Link
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActiveLink(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
        <Link to="/terms-and-conditions">
        <div className="border-t border-slate-700 px-4 py-2">
          <p className="text-md font-semibold text-white my-2">Terms & Condition</p>

        </div>
        </Link>
        <div className="border-t border-slate-700 px-4 py-2">
          <p className="text-sm text-slate-400 my-2"><span className='font-semibold text-white'>User: </span>{user?.first_name || user?.phone}</p>
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
        />
      )}
    </>
  );
}