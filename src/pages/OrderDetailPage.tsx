import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { 
  Package, 
  Disc3, 
  AlertCircle, 
  ArrowLeft,
  Truck,
  Clock,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  id: number;
  record_id: number;
  quantity: number;
  price: number;
  title: string;
  artist: string;
  image_url: string;
}

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const getStatusStep = (status: string) => {
  switch (status) {
    case 'pending':
      return 1;
    case 'processing':
      return 2;
    case 'shipped':
      return 3;
    case 'delivered':
      return 4;
    case 'cancelled':
      return 0;
    default:
      return 1;
  }
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { token } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isNewOrder = location.state?.isNewOrder || false;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Disc3 className="h-12 w-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error || 'Order not found'}</p>
          </div>
          <div className="mt-4">
            <Link
              to="/orders"
              className="inline-flex items-center text-[#D4AF37] hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusStep = getStatusStep(order.status);
  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Calculate order totals
  const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 5.00;
  const tax = subtotal * 0.08;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          to="/orders"
          className="inline-flex items-center text-[#1A1A2E] hover:text-[#D4AF37]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to orders
        </Link>
      </div>
      
      {isNewOrder && (
        <div className="mb-8 bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>Your order has been placed successfully!</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Order details */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                  Order #{order.id}
                </h1>
                <span className="px-3 py-1 text-xs font-medium uppercase rounded-full bg-gray-100 text-gray-800">
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Placed on {formattedDate}</p>
            </div>
            
            {/* Order progress */}
            {order.status !== 'cancelled' && (
              <div className="px-6 py-6 border-b border-gray-200">
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        statusStep >= 1 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Clock className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-2 text-gray-500">Pending</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        statusStep >= 2 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Package className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-2 text-gray-500">Processing</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        statusStep >= 3 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Truck className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-2 text-gray-500">Shipped</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        statusStep >= 4 ? 'bg-[#D4AF37] text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-2 text-gray-500">Delivered</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                    <div 
                      className="h-full bg-[#D4AF37]" 
                      style={{ 
                        width: `${(statusStep - 1) * 33.3}%`,
                        transition: 'width 0.5s ease-in-out'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Order items */}
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 flex">
                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900">
                            <Link to={`/records/${item.record_id}`} className="hover:text-[#D4AF37]">
                              {item.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-gray-500">{item.artist}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${parseFloat(item.price.toString()).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          ${(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">${tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between mb-6">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-semibold text-gray-900">
                ${parseFloat(order.total_amount.toString()).toFixed(2)}
              </span>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-[#D4AF37]" />
                Shipping Address
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {order.shipping_address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;