import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Disc3,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage: React.FC = () => {
  const { 
    items, 
    totalPrice, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    isLoading,
    error
  } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Disc3 className="h-12 w-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">Your Cart</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-gray-100 text-gray-400 rounded-full mb-4">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any records to your cart yet.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#D4AF37] text-[#1A1A2E] font-medium rounded-md hover:bg-[#B8973D] transition-colors"
          >
            Browse Records
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </h2>
                <button
                  onClick={() => clearCart()}
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Clear cart
                </button>
              </div>
              
              {items.map((item) => (
                <div key={item.id} className="border-b border-gray-200 last:border-b-0">
                  <div className="px-6 py-4 flex items-center">
                    <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        <Link to={`/records/${item.record_id}`} className="hover:text-[#D4AF37]">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">{item.artist}</p>
                      <div className="mt-2 flex items-center">
                        <div className="inline-flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-3 py-1 border-l border-r border-gray-300 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-600 hover:text-gray-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center">
                      <div className="text-base font-medium text-gray-900 mr-4">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Link
                to="/catalog"
                className="inline-flex items-center text-[#1A1A2E] hover:text-[#D4AF37] font-medium"
              >
                <ArrowRight className="h-4 w-4 mr-2 transform rotate-180" />
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="border-t border-gray-200 pt-4 pb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">$5.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${(totalPrice * 0.08).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 pb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${(totalPrice + 5 + totalPrice * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 px-6 py-3 bg-[#1A1A2E] text-white font-medium rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;