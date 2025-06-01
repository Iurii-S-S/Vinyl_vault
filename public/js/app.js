import { router } from './router.js';
import { showToast, showModal, closeModal } from './ui/notifications.js';
import { authService } from './services/auth.service.js';
import { setupHeaderInteractions } from './ui/header.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  // Setup UI interactions
  setupHeaderInteractions();
  
  // Setup cart counter
  updateCartCounter();
  
  // Setup auth menu
  await updateAuthMenu();
  
  // Initialize router
  router.init();
  
  // Add event listener for logout
  document.addEventListener('click', async (e) => {
    if (e.target.matches('#logout-btn')) {
      e.preventDefault();
      await handleLogout();
    }
  });
  
  // Add newsletter form submission
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
});

// Update cart counter
async function updateCartCounter() {
  const cartCountElement = document.getElementById('cart-count');
  
  try {
    if (authService.isAuthenticated()) {
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        cartCountElement.textContent = data.data.items.length;
        cartCountElement.style.display = data.data.items.length > 0 ? 'flex' : 'none';
      } else {
        cartCountElement.textContent = '0';
        cartCountElement.style.display = 'none';
      }
    } else {
      cartCountElement.textContent = '0';
      cartCountElement.style.display = 'none';
    }
  } catch (error) {
    console.error('Error updating cart counter:', error);
    cartCountElement.textContent = '0';
    cartCountElement.style.display = 'none';
  }
}

// Update auth menu
async function updateAuthMenu() {
  const userDropdown = document.getElementById('user-dropdown');
  
  if (authService.isAuthenticated()) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const user = data.data.user;
        
        userDropdown.innerHTML = `
          <div class="user-dropdown-header">
            <p>Hello, ${user.firstName}!</p>
          </div>
          <a href="/profile" class="user-dropdown-item">My Profile</a>
          <a href="/profile/orders" class="user-dropdown-item">My Orders</a>
          ${user.isAdmin ? '<a href="/admin" class="user-dropdown-item">Admin Dashboard</a>' : ''}
          <div class="user-dropdown-divider"></div>
          <a href="#" id="logout-btn" class="user-dropdown-item">Logout</a>
        `;
      } else {
        // Token might be invalid, clear it
        authService.logout();
        renderLoginMenu();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      authService.logout();
      renderLoginMenu();
    }
  } else {
    renderLoginMenu();
  }
}

// Render login menu
function renderLoginMenu() {
  const userDropdown = document.getElementById('user-dropdown');
  
  userDropdown.innerHTML = `
    <a href="/login" class="user-dropdown-item">Login</a>
    <a href="/register" class="user-dropdown-item">Register</a>
  `;
}

// Handle logout
async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authService.getToken()}`
      }
    });
    
    authService.logout();
    await updateAuthMenu();
    await updateCartCounter();
    
    showToast('success', 'Logged out successfully', 'You have been logged out.');
    
    // Redirect to home page if on a protected page
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/profile') || currentPath.startsWith('/admin')) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Handle newsletter submit
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('newsletter-email').value;
  
  // In a real app, you would send this to the server
  console.log('Newsletter subscription:', email);
  
  // Show success message
  showToast('success', 'Subscription successful', 'You have been subscribed to our newsletter.');
  
  // Reset form
  e.target.reset();
}

// Export functions for use in other modules
export { updateCartCounter, updateAuthMenu };