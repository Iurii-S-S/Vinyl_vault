import React from 'react';
import { Link } from 'react-router-dom';
import { Disc3, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1A1A2E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div>
            <Link to="/" className="flex items-center">
              <Disc3 className="h-8 w-8 text-[#D4AF37]" />
              <span className="ml-2 text-xl font-bold">VinylVault</span>
            </Link>
            <p className="mt-4 text-gray-300">
              Discover the world's finest vinyl records. From classic albums to rare finds, 
              we've got your musical needs covered.
            </p>
            <div className="flex mt-6 space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Records
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Popular genres */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Genres</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog?genre=Rock" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Rock
                </Link>
              </li>
              <li>
                <Link to="/catalog?genre=Jazz" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Jazz
                </Link>
              </li>
              <li>
                <Link to="/catalog?genre=Pop" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Pop
                </Link>
              </li>
              <li>
                <Link to="/catalog?genre=Hip Hop" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Hip Hop
                </Link>
              </li>
              <li>
                <Link to="/catalog?genre=Classical" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Classical
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#D4AF37] mr-2 mt-1" />
                <span className="text-gray-300">
                  Vernadskogo pr., h.78
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-[#D4AF37] mr-2" />
                <span className="text-gray-300">8(999)123-45-67</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-[#D4AF37] mr-2" />
                <a href="mailto:info@vinylvault.com" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  info@vinylvault.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} VinylVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;