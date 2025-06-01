import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Disc3, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  BarChart3,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
  totalOrders: number;
  totalSales: number;
  pendingOrders: number;
  lowStockItems: number;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Normally we would fetch this data from the server
    // For demo purposes, we'll use some fake data
    setTimeout(() => {
      setStats({
        totalOrders: 5,
        totalSales: 125.95,
        pendingOrders: 2,
        lowStockItems: 3
      });
      setIsLoading(false);
    }, 1000);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-4 md:mb-0">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <Link
            to="/admin/records"
            className="inline-flex items-center px-4 py-2 bg-[#1A1A2E] text-white rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors"
          >
            Manage Records
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center px-4 py-2 bg-[#1A1A2E] text-white rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center h-12 w-12 bg-blue-100 text-blue-500 rounded-lg mr-4">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center h-12 w-12 bg-green-100 text-green-500 rounded-lg mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-900">${stats.totalSales.toFixed(2)}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center h-12 w-12 bg-yellow-100 text-yellow-500 rounded-lg mr-4">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center h-12 w-12 bg-red-100 text-red-500 rounded-lg mr-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock Items</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/records"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="inline-flex items-center justify-center h-10 w-10 bg-[#1A1A2E] text-white rounded-lg mr-4">
              <Disc3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Add New Record</h3>
              <p className="text-sm text-gray-500">Add a new record to your inventory</p>
            </div>
          </Link>
          
          <Link
            to="/admin/orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="inline-flex items-center justify-center h-10 w-10 bg-[#1A1A2E] text-white rounded-lg mr-4">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Process Orders</h3>
              <p className="text-sm text-gray-500">View and update order statuses</p>
            </div>
          </Link>
          
          <Link
            to="/admin/records"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="inline-flex items-center justify-center h-10 w-10 bg-[#1A1A2E] text-white rounded-lg mr-4">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Manage Inventory</h3>
              <p className="text-sm text-gray-500">Update stock levels and prices</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Recent activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        
        <div className="divide-y divide-gray-200">
          <div className="py-4 flex items-start">
            <div className="inline-flex items-center justify-center h-8 w-8 bg-blue-100 text-blue-500 rounded-full mr-4">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New user registered</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="py-4 flex items-start">
            <div className="inline-flex items-center justify-center h-8 w-8 bg-green-100 text-green-500 rounded-full mr-4">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New order placed</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          
          <div className="py-4 flex items-start">
            <div className="inline-flex items-center justify-center h-8 w-8 bg-yellow-100 text-yellow-500 rounded-full mr-4">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Order status updated to "Shipped"</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          
          <div className="py-4 flex items-start">
            <div className="inline-flex items-center justify-center h-8 w-8 bg-purple-100 text-purple-500 rounded-full mr-4">
              <Disc3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">New record added to inventory</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;