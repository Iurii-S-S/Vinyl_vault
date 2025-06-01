// Setup header interactions
function setupHeaderInteractions() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navList = document.getElementById('nav-list');
  
  if (mobileMenuBtn && navList) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navList.classList.toggle('active');
    });
  }
  
  // Search toggle
  const searchToggle = document.getElementById('search-toggle');
  const searchContainer = document.getElementById('search-container');
  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  
  if (searchToggle && searchContainer) {
    searchToggle.addEventListener('click', () => {
      searchContainer.classList.toggle('active');
      if (searchContainer.classList.contains('active') && searchInput) {
        searchInput.focus();
      }
    });
    
    // Close search when clicking outside
    document.addEventListener('click', (e) => {
      if (searchContainer.classList.contains('active') && 
          !searchContainer.contains(e.target) && 
          e.target !== searchToggle) {
        searchContainer.classList.remove('active');
      }
    });
    
    // Handle search form submission
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchValue = searchInput.value.trim();
        
        if (searchValue) {
          window.location.href = `/shop?search=${encodeURIComponent(searchValue)}`;
        }
      });
    }
  }
  
  // User menu toggle
  const userMenuBtn = document.getElementById('user-menu-btn');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', () => {
      userDropdown.classList.toggle('active');
    });
    
    // Close user menu when clicking outside
    document.addEventListener('click', (e) => {
      if (userDropdown.classList.contains('active') && 
          !userDropdown.contains(e.target) && 
          e.target !== userMenuBtn) {
        userDropdown.classList.remove('active');
      }
    });
  }
  
  // Header scroll behavior
  const header = document.getElementById('header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

export { setupHeaderInteractions };