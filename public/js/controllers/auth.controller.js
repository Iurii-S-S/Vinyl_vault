import { authService } from '../services/auth.service.js';
import { showToast } from '../ui/notifications.js';
import { updateAuthMenu, updateCartCounter } from '../app.js';

// Authentication controller
const authController = {
  // Login page
  async login() {
    const mainContent = document.getElementById('main-content');
    
    // Update page title
    document.title = 'Login | Vinyl Vault';
    
    // Render page content
    mainContent.innerHTML = `
      <div class="container section">
        <div class="auth-container">
          <h1>Login to Your Account</h1>
          <form id="login-form" class="auth-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" class="form-control" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block">Login</button>
            </div>
          </form>
          <div class="auth-links">
            <p>Don't have an account? <a href="/register">Register</a></p>
          </div>
        </div>
      </div>
    `;
    
    // Add form submission listener
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
          // Show loading state
          const submitButton = loginForm.querySelector('button[type="submit"]');
          submitButton.disabled = true;
          submitButton.textContent = 'Logging in...';
          
          // Attempt login
          const user = await authService.login(email, password);
          
          // Show success message
          showToast('success', 'Login Successful', `Welcome back, ${user.firstName}!`);
          
          // Update auth menu and cart counter
          await updateAuthMenu();
          await updateCartCounter();
          
          // Redirect to home page
          window.location.href = '/';
        } catch (error) {
          // Show error message
          showToast('error', 'Login Failed', error.message || 'Invalid email or password.');
          
          // Reset form button
          const submitButton = loginForm.querySelector('button[type="submit"]');
          submitButton.disabled = false;
          submitButton.textContent = 'Login';
        }
      });
    }
  },
  
  // Register page
  async register() {
    const mainContent = document.getElementById('main-content');
    
    // Update page title
    document.title = 'Register | Vinyl Vault';
    
    // Render page content
    mainContent.innerHTML = `
      <div class="container section">
        <div class="auth-container">
          <h1>Create an Account</h1>
          <form id="register-form" class="auth-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName" class="form-label">First Name</label>
                <input type="text" id="firstName" class="form-control" required>
              </div>
              <div class="form-group">
                <label for="lastName" class="form-label">Last Name</label>
                <input type="text" id="lastName" class="form-control" required>
              </div>
            </div>
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" class="form-control" required minlength="6">
              <small class="form-text">Password must be at least 6 characters</small>
            </div>
            <div class="form-group">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input type="password" id="confirmPassword" class="form-control" required>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary btn-block">Register</button>
            </div>
          </form>
          <div class="auth-links">
            <p>Already have an account? <a href="/login">Login</a></p>
          </div>
        </div>
      </div>
    `;
    
    // Add CSS for auth pages
    addAuthStyles();
    
    // Add form submission listener
    const registerForm = document.getElementById('register-form');
    
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
          showToast('error', 'Registration Failed', 'Passwords do not match.');
          return;
        }
        
        try {
          // Show loading state
          const submitButton = registerForm.querySelector('button[type="submit"]');
          submitButton.disabled = true;
          submitButton.textContent = 'Creating account...';
          
          // Attempt registration
          const user = await authService.register({
            firstName,
            lastName,
            email,
            password
          });
          
          // Show success message
          showToast('success', 'Registration Successful', `Welcome, ${user.firstName}!`);
          
          // Update auth menu and cart counter
          await updateAuthMenu();
          await updateCartCounter();
          
          // Redirect to home page
          window.location.href = '/';
        } catch (error) {
          // Show error message
          showToast('error', 'Registration Failed', error.message || 'An error occurred during registration.');
          
          // Reset form button
          const submitButton = registerForm.querySelector('button[type="submit"]');
          submitButton.disabled = false;
          submitButton.textContent = 'Register';
        }
      });
    }
  }
};

// Add auth styles
function addAuthStyles() {
  // Check if styles already added
  if (document.getElementById('auth-styles')) {
    return;
  }
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'auth-styles';
  
  // Add CSS
  style.textContent = `
    .auth-container {
      max-width: 50rem;
      margin: 0 auto;
      padding: var(--spacing-4);
      background-color: var(--color-white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
    }
    
    .auth-container h1 {
      text-align: center;
      margin-bottom: var(--spacing-4);
    }
    
    .auth-form {
      margin-bottom: var(--spacing-3);
    }
    
    .form-text {
      display: block;
      margin-top: 0.5rem;
      font-size: 1.4rem;
      color: var(--color-gray-600);
    }
    
    .form-actions {
      margin-top: var(--spacing-3);
    }
    
    .btn-block {
      display: block;
      width: 100%;
    }
    
    .auth-links {
      text-align: center;
      font-size: 1.4rem;
    }
    
    .auth-links a {
      color: var(--color-primary);
      text-decoration: underline;
    }
    
    .auth-links a:hover {
      color: var(--color-secondary);
    }
  `;
  
  // Add to document head
  document.head.appendChild(style);
}

export { authController };