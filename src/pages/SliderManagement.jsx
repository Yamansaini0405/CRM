import { useState, useEffect } from 'react';
import { Loader, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Update the context path as necessary

// --- Helper Component: SliderRow ---
const SliderRow = ({ slider, onDelete }) => {
  return (
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-sm text-slate-900 font-medium">{slider.id}</td>
      <td className="px-6 py-4 text-sm">
        <div className="flex items-center gap-3">
            {/* The slider.image field is used as the image source */}
            {slider.image ? (
            <img 
                src={slider.image} 
                alt={slider.caption || "Slider image"} 
                className="h-10 w-20 object-cover rounded border border-slate-200" 
            />
            ) : (
                <span className="text-slate-500 text-xs">No Image</span>
            )}
            <span className="text-slate-900">{slider.caption}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {/* Status Badge based on is_active */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            slider.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {slider.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600">{slider.order}</td>
      <td className="px-6 py-4 text-sm">
        <button
          onClick={() => onDelete(slider.id)}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
          title="Delete Slider"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

// --- Main Component: SliderManagement ---
export default function SliderManagement() {
  // --- Creation Form State ---
  const [formData, setFormData] = useState({
    caption: '',
    order: 0,
    image: null, // Stores the File object
    is_active: true,
  });
  const [creationLoading, setCreationLoading] = useState(false);
  const [creationError, setCreationError] = useState('');
  const [preview, setPreview] = useState(''); // Stores URL for local image preview

  // --- List State ---
  const [sliders, setSliders] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  
  const { tokens } = useAuth(); // Assume useAuth provides tokens
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || '';

  // --- Effects and Fetching ---
  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setListLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/homepage-sliders/`, {
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch sliders');
      const data = await response.json();
      // Sort by order by default
      data.sort((a, b) => a.order - b.order); 
      setSliders(data);
      setListError('');
    } catch (err) {
      setListError(err.message || 'Error fetching slider list.');
    } finally {
      setListLoading(false);
    }
  };

  // --- Form Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
        ...formData, 
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value 
    });
  };

  // Handles file selection and generates a preview URL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, image: null });
      setPreview('');
    }
  };

  // Handles the POST request (multipart/form-data)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreationError('');

    if (!formData.image) {
      setCreationError('Slider image is required');
      return;
    }

    setCreationLoading(true);

    try {
      // Use FormData for multipart request
      const form = new FormData();
      form.append('image', formData.image); 
      form.append('caption', formData.caption);
      form.append('order', formData.order);
      form.append('is_active', formData.is_active); 

      const response = await fetch(`${API_BASE_URL}/api/homepage-sliders/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
          // Note: Do NOT manually set 'Content-Type': 'multipart/form-data'. 
          // The browser sets it correctly when passing a FormData object.
        },
        body: form, // Send FormData object directly
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || Object.values(errorData).flat().join('; ') || 'Failed to create slider';
        throw new Error(errorMessage);
      }

      // Success: Reset form and refresh list
      setFormData({ caption: '', order: 0, image: null, is_active: true });
      setPreview('');
      fetchSliders();
      
    } catch (err) {
      setCreationError(err.message);
    } finally {
      setCreationLoading(false);
    }
  };

  // --- Delete Handler ---
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-sliders/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${tokens?.access}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete slider');
      
      // Update list state directly
      setSliders(sliders.filter((s) => s.id !== id));
      setListError('');
    } catch (err) {
      setListError(err.message || 'Error deleting slider.');
    }
  };

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold text-slate-900">Slider Management</h1>

      {/* --- 1. Create Slider Section --- */}
      <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
            <Plus size={20} /> Create New Slider
        </h2>
        
        {creationError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {creationError}
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Image Input and Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Image * (PNG/JPG)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                // Require image only if no preview is set (e.g., initial state)
                required={!preview} 
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {preview && (
                <div className="mt-4 p-3 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50">
                  <img src={preview} alt="Slider preview" className="max-h-24 w-full object-cover rounded" />
                </div>
              )}
            </div>
            
            {/* Caption Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Caption</label>
              <input
                type="text"
                name="caption"
                value={formData.caption}
                onChange={handleChange}
                placeholder="Short description or title"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Order Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            {/* Is Active Checkbox */}
            {/* <div className="flex items-center">
              <input
                id="is_active_slider"
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active_slider" className="ml-2 text-sm font-medium text-slate-700">
                Is Active
              </label>
            </div> */}

            <button
              type="submit"
              disabled={creationLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {creationLoading ? <Loader size={20} className="animate-spin" /> : <Plus size={20} />}
              {creationLoading ? 'Creating...' : 'Create Slider'}
            </button>
          </div>
        </form>
      </div>
      
      {/* --- 2. Slider List Section --- */}
      <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Existing Sliders</h2>
        
        {listError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader className="animate-spin text-blue-600" size={32} />
          </div>
        ) : sliders.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-slate-600">No sliders found. Use the form above to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Image & Caption</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sliders.map((slider) => (
                  <SliderRow 
                    key={slider.id} 
                    slider={slider} 
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