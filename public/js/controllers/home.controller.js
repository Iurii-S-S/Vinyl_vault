import { recordService } from '../services/record.service.js';
import { showToast } from '../ui/notifications.js';
import { updateCartCounter } from '../app.js';
import { cartService } from '../services/cart.service.js';
import { authService } from '../services/auth.service.js';

// Home controller
const homeController = {
  // Index page
  async index() {
    const mainContent = document.getElementById('main-content');
    
    try {
      // Fetch featured records
      const response = await recordService.getFeaturedRecords();
      const { newest, highestRated } = response.data;
      
      // Update page title
      document.title = 'Vinyl Vault | Premium Record Shop';
      
      // Render page content
      mainContent.innerHTML = `
        <section class="hero">
          <img src="https://images.pexels.com/photos/3253686/pexels-photo-3253686.jpeg" alt="Record collection" class="hero-bg">
          <div class="container">
            <div class="hero-content">
              <h1>Discover the Perfect Vinyl Sound</h1>
              <p>Explore our curated collection of vinyl records from classic albums to new releases. Find that perfect record to add to your collection.</p>
              <div class="hero-buttons">
                <a href="/shop" class="btn btn-accent btn-lg">Shop Now</a>
                <a href="/about" class="btn btn-outline btn-lg">About Us</a>
              </div>
            </div>
          </div>
        </section>
        
        <section class="featured-records section">
          <div class="container">
            <div class="section-header">
              <h2>New Arrivals</h2>
              <p>The latest additions to our vinyl collection</p>
            </div>
            
            <div class="records-grid">
              ${renderRecordsList(newest)}
            </div>
            
            <div class="text-center" style="margin-top: 3rem;">
              <a href="/shop" class="btn btn-primary">View All Records</a>
            </div>
          </div>
        </section>
        
        <section class="genres-section section">
          <div class="container">
            <div class="section-header">
              <h2>Browse by Genre</h2>
              <p>Find your next favorite record in your preferred musical style</p>
            </div>
            
            <div class="genres-grid">
              <a href="/shop/Rock" class="genre-card">
                <img src="https://images.pexels.com/photos/811838/pexels-photo-811838.jpeg" alt="Rock">
                <div class="genre-overlay">
                  <h3 class="genre-name">Rock</h3>
                </div>
              </a>
              
              <a href="/shop/Jazz" class="genre-card">
                <img src="https://images.pexels.com/photos/4087991/pexels-photo-4087991.jpeg" alt="Jazz">
                <div class="genre-overlay">
                  <h3 class="genre-name">Jazz</h3>
                </div>
              </a>
              
              <a href="/shop/Classical" class="genre-card">
                <img src="https://images.pexels.com/photos/7097455/pexels-photo-7097455.jpeg" alt="Classical">
                <div class="genre-overlay">
                  <h3 class="genre-name">Classical</h3>
                </div>
              </a>
              
              <a href="/shop/Pop" class="genre-card">
                <img src="https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg" alt="Pop">
                <div class="genre-overlay">
                  <h3 class="genre-name">Pop</h3>
                </div>
              </a>
              
              <a href="/shop/Electronic" class="genre-card">
                <img src="https://images.pexels.com/photos/2111015/pexels-photo-2111015.jpeg" alt="Electronic">
                <div class="genre-overlay">
                  <h3 class="genre-name">Electronic</h3>
                </div>
              </a>
              
              <a href="/shop/Hip-Hop" class="genre-card">
                <img src="https://images.pexels.com/photos/3480494/pexels-photo-3480494.jpeg" alt="Hip-Hop">
                <div class="genre-overlay">
                  <h3 class="genre-name">Hip-Hop</h3>
                </div>
              </a>
            </div>
          </div>
        </section>
        
        <section class="featured-records section">
          <div class="container">
            <div class="section-header">
              <h2>Top Rated Records</h2>
              <p>Highest rated albums loved by our customers</p>
            </div>
            
            <div class="records-grid">
              ${renderRecordsList(highestRated)}
            </div>
          </div>
        </section>
      `;
      
      // Add event listeners for add to cart buttons
      setupAddToCartButtons();
      
    } catch (error) {
      console.error('Error loading homepage:', error);
      mainContent.innerHTML = `
        <div class="container section">
          <div class="alert alert-error">
            <p>Error loading content. Please try again later.</p>
          </div>
        </div>
      `;
    }
  }
};

// Render records list
function renderRecordsList(records) {
  if (!records || records.length === 0) {
    return '<p>No records found.</p>';
  }
  
  return records.map(record => `
    <div class="record-card">
      <div class="record-image">
        <img src="${record.image_url || 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg'}" alt="${record.title}">
        ${record.stock_quantity < 5 ? `<span class="record-badge">Low Stock</span>` : ''}
      </div>
      <div class="record-content">
        <p class="record-artist">${record.artist}</p>
        <h3 class="record-title">${record.title}</h3>
        <div class="record-details">
          <p class="record-price">$${parseFloat(record.price).toFixed(2)}</p>
          <span class="record-genre">${record.genre || 'Various'}</span>
        </div>
        <div class="record-actions">
          <a href="/records/${record.id}" class="btn btn-outline">View Details</a>
          <button class="btn btn-primary add-to-cart-btn" data-id="${record.id}">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Setup add to cart buttons
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        showToast('warning', 'Login Required', 'Please login to add items to your cart.');
        return;
      }
      
      const recordId = button.getAttribute('data-id');
      
      try {
        // Add item to cart
        await cartService.addItem(recordId, 1);
        
        // Update cart counter
        updateCartCounter();
        
        // Show success message
        showToast('success', 'Added to Cart', 'Item has been added to your cart.');
      } catch (error) {
        showToast('error', 'Error', error.message || 'Failed to add item to cart.');
      }
    });
  });
}

export { homeController };