// Authentication service
class AuthService {
  constructor() {
    // Check if token exists in localStorage
    this.token = localStorage.getItem('token');
    this.userData = null;
    
    if (this.token) {
      try {
        // Parse the JWT payload to get user data
        const payload = JSON.parse(atob(this.token.split('.')[1]));
        
        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
          this.logout();
        } else {
          // Fetch user data if token is valid
          this.fetchUserData();
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        this.logout();
      }
    }
  }
  
  // Login user
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Save token to localStorage
      this.token = data.token || document.cookie.match(/token=([^;]+)/)?.[1];
      localStorage.setItem('token', this.token);
      
      // Save user data
      this.userData = data.data.user;
      localStorage.setItem('userData', JSON.stringify(this.userData));
      
      return data.data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
  
  // Register user
  async register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Save token to localStorage
      this.token = data.token || document.cookie.match(/token=([^;]+)/)?.[1];
      localStorage.setItem('token', this.token);
      
      // Save user data
      this.userData = data.data.user;
      localStorage.setItem('userData', JSON.stringify(this.userData));
      
      return data.data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
  
  // Logout user
  logout() {
    this.token = null;
    this.userData = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
  
  // Get token
  getToken() {
    return this.token;
  }
  
  // Get user data
  getUserData() {
    if (!this.userData && this.isAuthenticated()) {
      // Try to get from localStorage
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          this.userData = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // If still no user data, fetch it
      if (!this.userData) {
        this.fetchUserData();
      }
    }
    
    return this.userData;
  }
  
  // Fetch user data from API
  async fetchUserData() {
    if (!this.isAuthenticated()) {
      return null;
    }
    
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      this.userData = data.data.user;
      localStorage.setItem('userData', JSON.stringify(this.userData));
      
      return this.userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
}

// Create authentication service instance
const authService = new AuthService();

export { authService };