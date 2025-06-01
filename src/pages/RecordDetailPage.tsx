import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Disc3, 
  AlertCircle, 
  Plus, 
  Minus, 
  Clock, 
  Music,
  Star
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

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

const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<Record | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/records/${id}`);
        
        if (!response.ok) {
          throw new Error('Record not found');
        }
        
        const data = await response.json();
        setRecord(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleAddToCart = () => {
    if (record) {
      addToCart(record.id, quantity);
    }
  };

  const incrementQuantity = () => {
    if (record && quantity < record.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Disc3 className="h-12 w-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error || 'Record not found'}</p>
          </div>
          <div className="mt-4">
            <Link
              to="/catalog"
              className="inline-flex items-center text-[#D4AF37] hover:underline"
            >
              Back to catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Breadcrumbs */}
        <div className="w-full mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-[#D4AF37]">Home</Link>
              </li>
              <li className="flex items-center">
                <span className="mx-1">/</span>
                <Link to="/catalog" className="hover:text-[#D4AF37]">Records</Link>
              </li>
              <li className="flex items-center">
                <span className="mx-1">/</span>
                <span className="text-gray-700 font-medium">{record.title}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={record.image_url}
              alt={`${record.title} by ${record.artist}`}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
        
        {/* Details */}
        <div className="lg:w-1/2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#1A1A2E] text-white rounded-full">
                {record.genre}
              </span>
              <span className="inline-block ml-2 px-3 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
                {record.year}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{record.title}</h1>
            <h2 className="text-xl text-gray-700 mb-6">{record.artist}</h2>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= 4 ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">(12 reviews)</span>
            </div>
            
            <p className="text-gray-600 mb-8">{record.description}</p>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span>Release Year: {record.year}</span>
                </div>
                <div className="flex items-center">
                  <Music className="h-4 w-4 text-gray-500 mr-2" />
                  <span>Genre: {record.genre}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <div className="text-2xl font-bold text-[#1A1A2E]">${record.price.toFixed(2)}</div>
              
              <div className="text-sm text-gray-600">
                {record.stock > 0 ? (
                  <span className="text-green-600">
                    In stock ({record.stock} available)
                  </span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </div>
            </div>
            
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="inline-flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={record.stock <= quantity}
                    className="px-3 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  disabled={isCartLoading || record.stock <= 0}
                  className="flex-grow px-6 py-3 bg-[#1A1A2E] text-white font-medium rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCartLoading ? (
                    <Disc3 className="animate-spin h-5 w-5 mx-auto" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2 inline" />
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50 text-center">
                <p className="text-gray-600 mb-3">Sign in to add this record to your cart</p>
                <Link
                  to="/login"
                  className="inline-block px-6 py-2 bg-[#D4AF37] text-[#1A1A2E] font-medium rounded-md hover:bg-[#B8973D] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailPage;