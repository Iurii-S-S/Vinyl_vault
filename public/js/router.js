import { homeController } from './controllers/home.controller.js';
import { shopController } from './controllers/shop.controller.js';
import { recordController } from './controllers/record.controller.js';
import { cartController } from './controllers/cart.controller.js';
import { checkoutController } from './controllers/checkout.controller.js';
import { authController } from './controllers/auth.controller.js';
import { profileController } from './controllers/profile.controller.js';
import { adminController } from './controllers/admin.controller.js';
import { pageController } from './controllers/page.controller.js';
import { authService } from './services/auth.service.js';
import { showToast } from './ui/notifications.js';

// Router class for handling client-side navigation
class Router {
  constructor() {
    this.routes = [
      { path: '/', controller: homeController.index },
      { path: '/shop', controller: shopController.index },
      { path: '/shop/:genre', controller: shopController.byGenre },
      { path: '/records/:id', controller: recordController.show },
      { path: '/cart', controller: cartController.index, auth: true },
      { path: '/checkout', controller: checkoutController.index, auth: true },
      { path: '/login', controller: authController.login },
      { path: '/register', controller: authController.register },
      { path: '/profile', controller: profileController.index, auth: true },
      { path: '/profile/orders', controller: profileController.orders, auth: true },
      { path: '/profile/orders/:id', controller: profileController.orderDetails, auth: true },
      { path: '/admin', controller: adminController.dashboard, auth: true, admin: true },
      { path: '/admin/records', controller: adminController.records, auth: true, admin: true },
      { path: '/admin/orders', controller: adminController.orders, auth: true, admin: true },
      { path: '/about', controller: pageController.about },
      { path: '/contact', controller: pageController.contact }
    ];
  }
  
  // Initialize the router
  init() {
    // Handle initial page load
    this.navigateToUrl(window.location.pathname);
    
    // Handle navigation
    document.addEventListener('click', (e) => {
      // Only handle links with no external targets
      if (e.target.matches('a') && !e.target.getAttribute('target')) {
        const href = e.target.getAttribute('href');
        
        // Skip if it's an external link or hash link
        if (href.startsWith('http') || href.startsWith('#')) {
          return;
        }
        
        e.preventDefault();
        history.pushState(null, null, href);
        this.navigateToUrl(href);
      }
    });
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
      this.navigateToUrl(window.location.pathname);
    });
  }
  
  // Navigate to a specific URL
  navigateToUrl(url) {
    // Show page loader
    const pageLoader = document.getElementById('page-loader');
    pageLoader.style.display = 'flex';
    
    // Remove any query parameters and hash for matching
    const path = url.split('?')[0].split('#')[0];
    
    // Find the matching route
    const route = this.findRoute(path);
    
    if (route) {
      // Check if authentication is required
      if (route.auth && !authService.isAuthenticated()) {
        pageLoader.style.display = 'none';
        showToast('error', 'Authentication required', 'Please login to access this page.');
        history.replaceState(null, null, '/login');
        this.navigateToUrl('/login');
        return;
      }
      
      // Check if admin access is required
      if (route.admin && !this.isAdmin()) {
        pageLoader.style.display = 'none';
        showToast('error', 'Access denied', 'You do not have permission to access this page.');
        history.replaceState(null, null, '/');
        this.navigateToUrl('/');
        return;
      }
      
      // Extract route parameters
      const params = this.extractRouteParams(route.path, path);
      
      // Execute the controller
      route.controller(params).then(() => {
        // Hide page loader once content is loaded
        pageLoader.style.display = 'none';
        
        // Scroll to top
        window.scrollTo(0, 0);
      });
    } else {
      // Handle 404 - page not found
      this.handle404();
      pageLoader.style.display = 'none';
    }
  }
  
  // Find the matching route for a given path
  findRoute(path) {
    // First try exact match
    let route = this.routes.find(route => route.path === path);
    
    // If no exact match, try with parameters
    if (!route) {
      route = this.routes.find(route => {
        // Convert route path to regex pattern
        const pattern = this.pathToRegex(route.path);
        return pattern.test(path);
      });
    }
    
    return route;
  }
  
  // Convert route path to regex pattern
  pathToRegex(path) {
    // Replace route parameters with regex pattern
    const pattern = path
      .replace(/:\w+/g, '([^/]+)')
      .replace(/\//g, '\\/');
    
    return new RegExp(`^${pattern}$`);
  }
  
  // Extract route parameters
  extractRouteParams(routePath, path) {
    const params = {};
    
    // If no parameters in route, return empty object
    if (!routePath.includes(':')) {
      return params;
    }
    
    // Extract parameter names from route path
    const paramNames = routePath
      .split('/')
      .filter(segment => segment.startsWith(':'))
      .map(segment => segment.substring(1));
    
    // Extract parameter values from actual path
    const paramValues = path
      .split('/')
      .filter((segment, index) => {
        const routeSegment = routePath.split('/')[index];
        return routeSegment && routeSegment.startsWith(':');
      });
    
    // Combine parameter names and values
    paramNames.forEach((name, index) => {
      params[name] = paramValues[index];
    });
    
    return params;
  }
  
  // Handle 404 - page not found
  handle404() {
    const mainContent = document.getElementById('main-content');
    
    mainContent.innerHTML = `
      <div class="container section">
        <div class="text-center">
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <a href="/" class="btn btn-primary">Back to Home</a>
        </div>
      </div>
    `;
  }
  
  // Check if user is admin
  isAdmin() {
    if (!authService.isAuthenticated()) {
      return false;
    }
    
    try {
      const userData = authService.getUserData();
      return userData && userData.isAdmin;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
}

// Create router instance
const router = new Router();

export { router };