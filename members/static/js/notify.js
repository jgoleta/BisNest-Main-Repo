// Global notification utility used across pages
// Usage: showNotification(message, error=false, type='')
(function () {
  function showNotification(message, error = false, type = '') {
    const notification = document.getElementById('notification');
    if (!notification) {
      // Fallback: if no notification element exists, use alert
      alert(message);
      return;
    }

    notification.textContent = message;
    notification.classList.remove('error', 'warning', 'info');
    if (error) notification.classList.add('error');
    if (type) notification.classList.add(type);

    notification.style.display = '';
    // Trigger reflow to restart animation if needed
    void notification.offsetWidth;
    notification.classList.add('show');
    // Remove show after duration
    const duration = 3000;
    setTimeout(() => {
      notification.classList.remove('show');
      // hide after animation
      setTimeout(() => {
        if (!notification.classList.contains('show')) notification.style.display = 'none';
      }, 300);
    }, duration);
  }

  // Expose globally
  window.showNotification = showNotification;
})();
