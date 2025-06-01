import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Disc3, 
  AlertCircle, 
  ExternalLink,
  Clock,
  Check,
  Truck,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'processing':
      return <Package className="h-5 w-5 text-blue-500" />;
    case 'shipped':
      return <Truck className="h-5 w-5 text-purple-500" />;
    case 'delivered':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const OrdersPage: React.FC = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Disc3 className="h-12 w-12 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">Your Orders</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 mb-8">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-gray-100 text-gray-400 rounded-full mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to find your favorite vinyl records!
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#D4AF37] text-[#1A1A2E] font-medium rounded-md hover:bg-[#B8973D] transition-colors"
          >
            Browse Records
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-gray-200">
            {orders.map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div>
                    <div className="flex items-center mb-2">
                      {getStatusIcon(order.status)}
                      <h3 className="ml-2 text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <span className="ml-4 px-3 py-1 text-xs font-medium uppercase rounded-full bg-gray-100 text-gray-800">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      Placed on {formatDate(order.created_at)}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      Total: ${parseFloat(order.total_amount.toString()).toFixed(2)}
                    </p>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-[#1A1A2E] text-white rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors"
                  >
                    View Order
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;