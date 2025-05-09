/**
 * Class Whisper - Main JavaScript
 */

// Initialize Bootstrap components
document.addEventListener('DOMContentLoaded', function() {
    // Enable tooltips everywhere
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Enable popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Auto-dismiss alerts
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert:not(.alert-important)');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);
    
    // Add active class to current navigation item
    var currentLocation = window.location.pathname;
    var navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(function(link) {
        var linkPath = link.getAttribute('href');
        if (linkPath && currentLocation.startsWith(linkPath) && linkPath !== '/') {
            link.classList.add('active');
            
            // If in dropdown, also set dropdown active
            var dropdown = link.closest('.dropdown');
            if (dropdown) {
                dropdown.querySelector('.dropdown-toggle').classList.add('active');
            }
        }
    });
    
    // Handle anonymous tracking code form
    var trackForm = document.getElementById('anonymousTrackForm');
    if (trackForm) {
        trackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var hashCode = document.getElementById('hashCode').value.trim();
            if (hashCode) {
                window.location.href = '/feedback/detail/' + hashCode + '/';
            }
        });
    }
    
    // Setup copy to clipboard functionality
    var clipboardButtons = document.querySelectorAll('.btn-clipboard');
    clipboardButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var text = this.getAttribute('data-clipboard-text');
            if (text) {
                navigator.clipboard.writeText(text).then(function() {
                    // Change button text temporarily
                    var originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check me-1"></i> Copied!';
                    setTimeout(function() {
                        button.innerHTML = originalText;
                    }, 2000);
                });
            }
        });
    });
});

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    var options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Format date and time for display
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date and time string
 */
function formatDateTime(dateString) {
    var options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Show confirmation dialog
 * @param {string} message - Message to display
 * @param {function} callback - Function to call if confirmed
 */
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

/**
 * Handle AJAX errors
 * @param {object} xhr - XMLHttpRequest object
 * @param {string} status - Status text
 * @param {string} error - Error text
 */
function handleAjaxError(xhr, status, error) {
    console.error('AJAX Error:', status, error);
    let errorMessage = 'An error occurred while processing your request.';
    
    if (xhr.responseJSON && xhr.responseJSON.error) {
        errorMessage = xhr.responseJSON.error;
    }
    
    alert(errorMessage);
}

/**
 * Check if string is valid JSON
 * @param {string} str - String to check
 * @returns {boolean} - True if valid JSON
 */
function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}