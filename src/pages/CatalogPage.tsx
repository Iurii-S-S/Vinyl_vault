import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Disc3, Filter, X } from 'lucide-react';
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

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState<Record[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [artists, setArtists] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Get filter values from URL
  const genreFilter = searchParams.get('genre') || '';
  const artistFilter = searchParams.get('artist') || '';
  const minPriceFilter = searchParams.get('minPrice') || '';
  const maxPriceFilter = searchParams.get('maxPrice') || '';
  const searchFilter = searchParams.get('search') || '';

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        
        if (genreFilter) queryParams.append('genre', genreFilter);
        if (artistFilter) queryParams.append('artist', artistFilter);
        if (minPriceFilter) queryParams.append('minPrice', minPriceFilter);
        if (maxPriceFilter) queryParams.append('maxPrice', maxPriceFilter);
        if (searchFilter) queryParams.append('search', searchFilter);
        
        const response = await fetch(`/api/records?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setRecords(data);
        }
      } catch (error) {
        console.error('Error fetching records:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFilters = async () => {
      try {
        // Fetch available genres and artists for filters
        const [genresResponse, artistsResponse] = await Promise.all([
          fetch('/api/records/filters/genres'),
          fetch('/api/records/filters/artists')
        ]);
        
        if (genresResponse.ok && artistsResponse.ok) {
          const genresData = await genresResponse.json();
          const artistsData = await artistsResponse.json();
          setGenres(genresData);
          setArtists(artistsData);
        }
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchRecords();
    fetchFilters();
  }, [genreFilter, artistFilter, minPriceFilter, maxPriceFilter, searchFilter]);

  const handleFilterChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile filter toggle */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Record Catalog</h1>
          <button
            onClick={toggleFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters sidebar */}
        <div 
          className={`${
            showFilters ? 'block' : 'hidden'
          } lg:block lg:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit sticky top-4`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1A1A2E]">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-[#D4AF37] hover:underline"
            >
              Clear all
            </button>
            <button
              onClick={toggleFilters}
              className="lg:hidden text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Search filter */}
          <div className="mb-6">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchFilter}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search title or artist..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>

          {/* Genre filter */}
          <div className="mb-6">
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-2">
              Genre
            </label>
            <select
              id="genre"
              value={genreFilter}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Artist filter */}
          <div className="mb-6">
            <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
              Artist
            </label>
            <select
              id="artist"
              value={artistFilter}
              onChange={(e) => handleFilterChange('artist', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            >
              <option value="">All Artists</option>
              {artists.map((artist) => (
                <option key={artist} value={artist}>
                  {artist}
                </option>
              ))}
            </select>
          </div>

          {/* Price range filter */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="minPrice" className="sr-only">Minimum Price</label>
                <input
                  type="number"
                  id="minPrice"
                  value={minPriceFilter}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="Min"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="maxPrice" className="sr-only">Maximum Price</label>
                <input
                  type="number"
                  id="maxPrice"
                  value={maxPriceFilter}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="Max"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Records grid */}
        <div className="lg:w-3/4">
          <h1 className="hidden lg:block text-3xl font-bold text-[#1A1A2E] mb-8">Record Catalog</h1>
          
          {/* Active filters */}
          {(genreFilter || artistFilter || minPriceFilter || maxPriceFilter || searchFilter) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-700">Active filters:</span>
              
              {genreFilter && (
                <button
                  onClick={() => handleFilterChange('genre', '')}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A1A2E] text-white text-sm"
                >
                  Genre: {genreFilter}
                  <X className="ml-1 h-4 w-4" />
                </button>
              )}
              
              {artistFilter && (
                <button
                  onClick={() => handleFilterChange('artist', '')}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A1A2E] text-white text-sm"
                >
                  Artist: {artistFilter}
                  <X className="ml-1 h-4 w-4" />
                </button>
              )}
              
              {(minPriceFilter || maxPriceFilter) && (
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', '');
                    handleFilterChange('maxPrice', '');
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A1A2E] text-white text-sm"
                >
                  Price: {minPriceFilter ? `$${minPriceFilter}` : '$0'} - {maxPriceFilter ? `$${maxPriceFilter}` : 'Any'}
                  <X className="ml-1 h-4 w-4" />
                </button>
              )}
              
              {searchFilter && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A1A2E] text-white text-sm"
                >
                  Search: {searchFilter}
                  <X className="ml-1 h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Disc3 className="h-12 w-12 text-[#D4AF37] animate-spin" />
            </div>
          ) : records.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map(record => (
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
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No records found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search criteria.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-[#D4AF37] text-[#1A1A2E] font-medium rounded-md hover:bg-[#B8973D] transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;