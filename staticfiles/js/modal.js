/**
 * Centralized Modal Management System
 * Handles all modal operations across all pages
 */

(function() {
  'use strict';

  // ============================================
  // Modal State Management
  // ============================================

  /**
   * Check if any modal is currently open
   * @returns {boolean}
   */
  function isModalOpen() {
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modals = document.querySelectorAll('.modal');
    const formContainers = document.querySelectorAll(
      '.customer-form-container, .employee-form-container, .order-form-container, ' +
      '.supply-form-container, .delivery-form-container, .payment-form-container, ' +
      '.customer-profile-container, .employee-profile-container'
    );

    // Check modal overlays
    for (const overlay of modalOverlays) {
      const style = window.getComputedStyle(overlay);
      if (style.display === 'block' || style.display !== 'none') {
        return true;
      }
    }

    // Check modals (for product page)
    for (const modal of modals) {
      const style = window.getComputedStyle(modal);
      if (style.display === 'block' || modal.classList.contains('show')) {
        return true;
      }
    }

    // Check form containers
    for (const container of formContainers) {
      const style = window.getComputedStyle(container);
      if (style.display === 'block' || 
          style.display !== 'none' || 
          container.classList.contains('active')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Update body class based on modal state
   */
  function updateModalState() {
    if (isModalOpen()) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }
  }

  // ============================================
  // Universal Modal Functions
  // ============================================

  /**
   * Open a modal
   * @param {HTMLElement|string} modal - Modal element or selector
   * @param {HTMLElement|string} overlay - Overlay element or selector (optional)
   */
  window.openModal = function(modal, overlay = null) {
    const modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
    if (!modalEl) return;

    modalEl.style.display = 'block';
    if (modalEl.classList) {
      modalEl.classList.add('show');
    }

    // Handle overlay
    if (overlay) {
      const overlayEl = typeof overlay === 'string' ? document.querySelector(overlay) : overlay;
      if (overlayEl) {
        overlayEl.style.display = 'block';
      }
    } else {
      // Try to find associated overlay
      const associatedOverlay = modalEl.closest('.modal')?.querySelector('.modal-overlay') ||
                                document.getElementById('modalOverlay') ||
                                document.getElementById('paymentModalOverlay') ||
                                document.querySelector('.modal-overlay');
      if (associatedOverlay) {
        if (associatedOverlay.id === 'paymentModalOverlay') {
          associatedOverlay.classList.add('active');
        } else {
          associatedOverlay.style.display = 'block';
        }
      }
    }

    updateModalState();
  };

  /**
   * Close a modal
   * @param {HTMLElement|string} modal - Modal element or selector
   * @param {HTMLElement|string} overlay - Overlay element or selector (optional)
   */
  window.closeModal = function(modal, overlay = null) {
    const modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
    if (!modalEl) return;

    modalEl.style.display = 'none';
    if (modalEl.classList) {
      modalEl.classList.remove('show');
    }

    // Handle overlay
    if (overlay) {
      const overlayEl = typeof overlay === 'string' ? document.querySelector(overlay) : overlay;
      if (overlayEl) {
        if (overlayEl.classList && overlayEl.id === 'paymentModalOverlay') {
          overlayEl.classList.remove('active');
        } else {
          overlayEl.style.display = 'none';
        }
      }
    } else {
      // Try to find associated overlay
      const associatedOverlay = modalEl.closest('.modal')?.querySelector('.modal-overlay') ||
                                document.getElementById('modalOverlay') ||
                                document.getElementById('paymentModalOverlay') ||
                                document.querySelector('.modal-overlay');
      if (associatedOverlay) {
        if (associatedOverlay.id === 'paymentModalOverlay') {
          associatedOverlay.classList.remove('active');
        } else {
          associatedOverlay.style.display = 'none';
        }
      }
    }

    updateModalState();
  };

  /**
   * Toggle a modal
   * @param {HTMLElement|string} modal - Modal element or selector
   * @param {HTMLElement|string} overlay - Overlay element or selector (optional)
   * @param {boolean} forceState - Force open (true) or close (false), optional
   */
  window.toggleModal = function(modal, overlay = null, forceState = null) {
    const modalEl = typeof modal === 'string' ? document.querySelector(modal) : modal;
    if (!modalEl) return;

    const style = window.getComputedStyle(modalEl);
    const isCurrentlyOpen = style.display === 'block' || 
                           style.display !== 'none' || 
                           modalEl.classList.contains('show') ||
                           modalEl.classList.contains('active');

    if (forceState !== null) {
      if (forceState) {
        window.openModal(modalEl, overlay);
      } else {
        window.closeModal(modalEl, overlay);
      }
    } else {
      if (isCurrentlyOpen) {
        window.closeModal(modalEl, overlay);
      } else {
        window.openModal(modalEl, overlay);
      }
    }
  };

  // ============================================
  // Modal State Observer
  // ============================================

  // Use MutationObserver to watch for style changes
  const observer = new MutationObserver(() => {
    updateModalState();
  });

  /**
   * Observe all modal elements for changes
   */
  function observeModals() {
    const modalElements = document.querySelectorAll(
      '.modal-overlay, .modal, .customer-form-container, .employee-form-container, ' +
      '.order-form-container, .supply-form-container, .delivery-form-container, ' +
      '.payment-form-container, .customer-profile-container, .employee-profile-container'
    );

    modalElements.forEach(element => {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        childList: false,
        subtree: false
      });
    });
  }

  // ============================================
  // Close Modal on Overlay Click
  // ============================================

  /**
   * Setup overlay click to close modals
   */
  function setupOverlayClose() {
    document.addEventListener('click', function(e) {
      // Check if clicking on overlay
      if (e.target.classList.contains('modal-overlay') || 
          (e.target.classList.contains('modal') && e.target === e.currentTarget)) {
        // Find associated modal/content
        const overlay = e.target;
        const modal = overlay.nextElementSibling || 
                     overlay.parentElement?.querySelector('.modal-content') ||
                     overlay.parentElement?.querySelector('.customer-form-container') ||
                     overlay.parentElement?.querySelector('.employee-form-container') ||
                     overlay.parentElement?.querySelector('.order-form-container') ||
                     overlay.parentElement?.querySelector('.supply-form-container') ||
                     overlay.parentElement?.querySelector('.delivery-form-container') ||
                     overlay.parentElement?.querySelector('.payment-form-container') ||
                     overlay.parentElement?.querySelector('.customer-profile-container') ||
                     overlay.parentElement?.querySelector('.employee-profile-container');

        if (modal) {
          const modalStyle = window.getComputedStyle(modal);
          if (modalStyle.display === 'block' || modalStyle.display !== 'none' || modal.classList.contains('active')) {
            window.closeModal(modal, overlay);
          }
        } else {
          // Close the overlay itself if it's a modal
          if (overlay.classList.contains('modal')) {
            window.closeModal(overlay);
          }
        }
      }
    });
  }

  // ============================================
  // Close Modal on Escape Key
  // ============================================

  /**
   * Setup escape key to close modals
   */
  function setupEscapeClose() {
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isModalOpen()) {
        // Close the most recently opened modal
        const openModals = document.querySelectorAll(
          '.modal-overlay[style*="display: block"], ' +
          '.modal[style*="display: block"], ' +
          '.customer-form-container[style*="display: block"], ' +
          '.employee-form-container[style*="display: block"], ' +
          '.order-form-container[style*="display: block"], ' +
          '.supply-form-container[style*="display: block"], ' +
          '.delivery-form-container[style*="display: block"], ' +
          '.payment-form-container.active, ' +
          '.customer-profile-container[style*="display: block"], ' +
          '.employee-profile-container[style*="display: block"]'
        );

        if (openModals.length > 0) {
          const lastModal = openModals[openModals.length - 1];
          window.closeModal(lastModal);
        }
      }
    });
  }

  // ============================================
  // Initialize
  // ============================================

  function init() {
    observeModals();
    setupOverlayClose();
    setupEscapeClose();
    updateModalState();
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also check periodically as a fallback
  setInterval(updateModalState, 100);
})();

