// Show toast notification
function showToast(type, title, message, duration = 3000) {
  // Get toast container, create if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set toast content
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${getIconForToastType(type)}"></i>
    </div>
    <div class="toast-content">
      <h4 class="toast-title">${title}</h4>
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Add event listener for close button
  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Automatically remove toast after duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
  
  return toast;
}

// Get icon for toast type
function getIconForToastType(type) {
  switch (type) {
    case 'success':
      return 'check-circle';
    case 'error':
      return 'exclamation-circle';
    case 'warning':
      return 'exclamation-triangle';
    case 'info':
    default:
      return 'info-circle';
  }
}

// Remove toast
function removeToast(toast) {
  toast.classList.add('removing');
  
  // Remove from DOM after animation completes
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Show modal
function showModal(title, content) {
  const modalContainer = document.getElementById('modal-container');
  const modalTitle = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');
  
  // Set modal content
  modalTitle.textContent = title;
  modalContent.innerHTML = content;
  
  // Show modal
  modalContainer.classList.add('active');
  
  // Add event listener for close button
  modalClose.addEventListener('click', closeModal);
  
  // Add event listener to close modal when clicking outside
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
  
  // Add event listener to close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// Close modal
function closeModal() {
  const modalContainer = document.getElementById('modal-container');
  modalContainer.classList.remove('active');
}

export { showToast, showModal, closeModal };