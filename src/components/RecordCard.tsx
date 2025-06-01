import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface RecordCardProps {
  id: number;
  title: string;
  artist: string;
  price: number;
  imageUrl: string;
  year?: number;
  genre?: string;
}

const RecordCard: React.FC<RecordCardProps> = ({ 
  id, 
  title, 
  artist, 
  price, 
  imageUrl, 
  year, 
  genre 
}) => {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(id, 1);
  };

  return (
    <Link to={`/records/${id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
        <div className="relative overflow-hidden h-64">
          <img 
            src={imageUrl} 
            alt={`${title} by ${artist}`} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 p-4 text-white w-full">
              {genre && (
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-[#D4AF37] text-[#1A1A2E] rounded mb-2">
                  {genre}
                </span>
              )}
              {year && <p className="text-sm">Year: {year}</p>}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-900 truncate">{title}</h3>
          <p className="text-gray-600 truncate">{artist}</p>
          
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[#1A1A2E] font-bold">${price.toFixed(2)}</span>
            
            {isAuthenticated && (
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="p-2 rounded-full bg-[#1A1A2E] text-white hover:bg-[#D4AF37] transition-colors disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecordCard;