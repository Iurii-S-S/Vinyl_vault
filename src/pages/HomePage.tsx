import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Disc3, ShoppingCart, Music, ArrowRight, TrendingUp } from 'lucide-react';
import RecordCard from '../components/RecordCard';

interface Record {
  id: number;
  title: string;
  artist: string;
  genre: string;
  year: number;
  price: number;
  image_url: string;
}

const HomePage: React.FC = () => {
  const [featuredRecords, setFeaturedRecords] = useState<Record[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedRecords = async () => {
      try {
        const response = await fetch('/api/records?limit=4');
        if (response.ok) {
          const data = await response.json();
          setFeaturedRecords(data);
        }
      } catch (error) {
        console.error('Error fetching featured records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedRecords();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1A1A2E] to-[#232342] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Discover <span className="text-[#D4AF37]">Vinyl</span> Treasures for Your Collection
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              From classic albums to rare finds, explore our curated selection of vinyl records.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#D4AF37] text-[#1A1A2E] font-medium rounded-md hover:bg-[#B8973D] transition-colors"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shop Now
              </Link>
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#D4AF37] text-[#D4AF37] font-medium rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <img
                src="https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg"
                alt="Vinyl Records Collection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Disc3 className="h-24 w-24 text-[#D4AF37] animate-spin-slow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#1A1A2E]">
            Why Choose <span className="text-[#D4AF37]">VinylVault</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#1A1A2E] text-[#D4AF37] rounded-full mb-4">
                <Music className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A2E]">Curated Selection</h3>
              <p className="text-gray-600">
                Hand-picked vinyl records across all genres, from classic albums to rare finds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#1A1A2E] text-[#D4AF37] rounded-full mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A2E]">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Every record is carefully inspected to ensure the highest quality for your collection.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center transition-transform hover:-translate-y-2">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-[#1A1A2E] text-[#D4AF37] rounded-full mb-4">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#1A1A2E]">Fast Shipping</h3>
              <p className="text-gray-600">
                Secure packaging and prompt delivery to bring music to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Records */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-[#1A1A2E]">Featured Records</h2>
            <Link
              to="/catalog"
              className="inline-flex items-center text-[#1A1A2E] hover:text-[#D4AF37] font-medium"
            >
              View all
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Disc3 className="h-12 w-12 text-[#D4AF37] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRecords.map(record => (
                <RecordCard
                  key={record.id}
                  id={record.id}
                  title={record.title}
                  artist={record.artist}
                  price={record.price}
                  imageUrl={record.image_url}
                  year={record.year}
                  genre={record.genre}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-[#1A1A2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Newsletter</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to receive updates on new arrivals, special offers, and vinyl care tips.
          </p>
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-gray-900"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#D4AF37] text-[#1A1A2E] font-medium rounded-r-md hover:bg-[#B8973D] transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;