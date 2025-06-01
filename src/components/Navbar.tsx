import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Disc3, ShoppingCart, User, Menu, X, LogOut, Package, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-[#1A1A2E] to-[#232342] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Disc3 className="h-8 w-8 text-[#D4AF37]" />
              <span className="ml-2 text-xl font-bold">VinylVault</span>
            </Link>
            
            {/* Desktop menu */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-white hover:text-[#D4AF37] transition-colors px-3 py-2">
                Home
              </Link>
              <Link to="/catalog" className="text-white hover:text-[#D4AF37] transition-colors px-3 py-2">
                Records
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-white hover:text-[#D4AF37] transition-colors px-3 py-2">
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Cart icon */}
            {isAuthenticated && (
              <Link to="/cart\" className="relative p-2 mr-4">
                <ShoppingCart className="h-6 w-6 text-white hover:text-[#D4AF37] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            
            {/* User menu (desktop) */}
            {isAuthenticated ? (
              <div className="hidden md:block relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center focus:outline-none"
                >
                  <User className="h-6 w-6 text-white" />
                  <span className="ml-2">{user?.username}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        My Orders
                      </div>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex md:items-center">
                <Link
                  to="/login"
                  className="text-white hover:text-[#D4AF37] transition-colors px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="ml-4 px-4 py-2 rounded-md text-[#1A1A2E] bg-[#D4AF37] hover:bg-[#B8973D] transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#D4AF37] focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="block px-3 py-2 text-white hover:text-[#D4AF37] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className="block px-3 py-2 text-white hover:text-[#D4AF37] transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Records
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="block px-3 py-2 text-white hover:text-[#D4AF37] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-white hover:text-[#D4AF37] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-white hover:text-[#D4AF37] transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-white hover:text-[#D4AF37] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-white hover:text-[#D4AF37] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;