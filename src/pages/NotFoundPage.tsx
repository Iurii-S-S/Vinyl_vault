import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Disc3 } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Disc3 className="h-24 w-24 text-[#D4AF37] mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold text-[#1A1A2E] mb-4">404 - Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          The record you're looking for seems to be missing from our collection.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 bg-[#1A1A2E] text-white font-medium rounded-md hover:bg-[#D4AF37] hover:text-[#1A1A2E] transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;