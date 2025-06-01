import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Disc3, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  AlertCircle,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Record {
  id: number;
  title: string;
  artist: string;
  genre: string;
  year: number;
  price: number;
  stock: number;
  image_url: string;
  description: string;
}

interface RecordFormData {
  title: string;
  artist: string;
  genre: string;
  year: string;
  price: string;
  stock: string;
  image_url: string;
  description: string;
}

const emptyFormData: RecordFormData = {
  title: '',
  artist: '',
  genre: '',
  year: '',
  price: '',
  stock: '',
  image_url: '',
  description: ''
};

const AdminRecords: React.FC = () => {
  const { token } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<RecordFormData>(emptyFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<RecordFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [token]);

  const fetchRecords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/records', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      
      const data = await response.json();
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors: Partial<RecordFormData> = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.artist.trim()) errors.artist = 'Artist is required';
    if (!formData.genre.trim()) errors.genre = 'Genre is required';
    
    if (!formData.year.trim()) {
      errors.year = 'Year is required';
    } else if (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear()) {
      errors.year = `Year must be between 1900 and ${new Date().getFullYear()}`;
    }
    
    if (!formData.price.trim()) {
      errors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Price must be a positive number';
    }
    
    if (!formData.stock.trim()) {
      errors.stock = 'Stock is required';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0 || !Number.isInteger(Number(formData.stock))) {
      errors.stock = 'Stock must be a non-negative integer';
    }
    
    if (!formData.image_url.trim()) {
      errors.image_url = 'Image URL is required';
    } else {
      try {
        new URL(formData.image_url);
      } catch (e) {
        errors.image_url = 'Must be a valid URL';
      }
    }
    
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const url = editingId 
        ? `/api/admin/records/${editingId}` 
        : '/api/admin/records';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          year: Number(formData.year),
          price: Number(formData.price),
          stock: Number(formData.stock),
          image_url: formData.image_url,
          description: formData.description
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save record');
      }
      
      // Refresh records list
      fetchRecords();
      
      // Close modal and reset form
      setShowModal(false);
      setFormData(emptyFormData);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record: Record) => {
    setFormData({
      title: record.title,
      artist: record.artist,
      genre: record.genre,
      year: record.year.toString(),
      price: record.price.toString(),
      stock: record.stock.toString(),
      image_url: record.image_url,
      description: record.description
    });
    setEditingId(record.id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/records/${recordToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete record');
      }
      
      // Refresh records list
      fetchRecords();
      
      // Close modal
      setShowDeleteModal(false);
      setRecordToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (record: Record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  const filteredRecords = searchQuery
    ? records.filter(record => 
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.genre.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : records;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Disc3 className="h-12 w-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-4 md:mb-0">Manage Records</h1>
        <div className="flex space-x-4">
          <Link
            to="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => {
              setFormData(emptyFormData);
              setEditingId(null);
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-[#1A1A2E] text-white rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Record
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Search and filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search records by title, artist, or genre"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>
        </div>
      </div>
      
      {/* Records table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-md object-cover" 
                            src={record.image_url} 
                            alt={record.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{record.title}</div>
                          <div className="text-sm text-gray-500">{record.artist}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {record.genre}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${record.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.stock === 0
                          ? 'bg-red-100 text-red-800'
                          : record.stock < 5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {record.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(record)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(record)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingId ? 'Edit Record' : 'Add New Record'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.title ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-1">
                    Artist
                  </label>
                  <input
                    type="text"
                    id="artist"
                    name="artist"
                    value={formData.artist}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.artist ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  />
                  {formErrors.artist && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.artist}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <input
                    type="text"
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.genre ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  />
                  {formErrors.genre && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.genre}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.year ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  />
                  {formErrors.year && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.year}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.price ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.stock ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  />
                  {formErrors.stock && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.stock}</p>
                  )}
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.image_url ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  />
                  {formErrors.image_url && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.image_url}</p>
                  )}
                </div>
                
                <div className="col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]`}
                  ></textarea>
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#1A1A2E] text-white rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Disc3 className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    'Save Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete "{recordToDelete.title}" by {recordToDelete.artist}? This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Disc3 className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRecords;