// Records service
class RecordService {
  // Get all records with optional filters
  async getRecords(params = {}) {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.genre) queryParams.append('genre', params.genre);
      if (params.artist) queryParams.append('artist', params.artist);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortDir) queryParams.append('sortDir', params.sortDir);
      
      const url = `/api/records?${queryParams.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch records');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }
  
  // Get a single record by ID
  async getRecord(id) {
    try {
      const response = await fetch(`/api/records/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch record');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching record ${id}:`, error);
      throw error;
    }
  }
  
  // Get featured records
  async getFeaturedRecords() {
    try {
      const response = await fetch('/api/records/featured/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured records');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching featured records:', error);
      throw error;
    }
  }
  
  // Add a review for a record
  async addReview(recordId, review) {
    try {
      const response = await fetch(`/api/records/${recordId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(review)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add review');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
}

// Create records service instance
const recordService = new RecordService();

export { recordService };