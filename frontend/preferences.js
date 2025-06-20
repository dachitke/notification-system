// Set global backendUrl if it doesn't exist
if (typeof window.backendUrl === 'undefined') {
  window.backendUrl = 'http://localhost:8080';
}

async function fetchPreferencesSummary() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login');
      window.location.href = 'index.html';
      return null;
    }

    console.log('Fetching preferences summary from:', `${window.backendUrl}/api/notifications/preferences-summary`);
    const res = await fetch(`${window.backendUrl}/api/notifications/preferences-summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Preferences API Response status:', res.status);
    
    if (!res.ok) {
      console.error('Preferences API request failed:', res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    console.log('Preferences summary data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching preferences summary:', error);
    return null;
  }
}

async function loadPreferencesSummary() {
  console.log('Loading preferences summary...');
  
  // Show loading state
  showPreferencesLoading(true);
  
  try {
    const summary = await fetchPreferencesSummary();
    if (!summary) {
      console.error('Failed to fetch preferences summary');
      showPreferencesError();
      return;
    }
    
    console.log('Updating UI with preferences summary:', summary);
    updatePreferencesUI(summary);
    showPreferencesSuccess();
    
  } catch (error) {
    console.error('Error in loadPreferencesSummary:', error);
    showPreferencesError();
  } finally {
    showPreferencesLoading(false);
  }
}

function updatePreferencesUI(summary) {
  // Update the count values
  const emailCount = document.getElementById('emailOptInCount');
  const smsCount = document.getElementById('smsOptInCount');
  const promoCount = document.getElementById('promoOptInCount');
  
  if (emailCount) {
    emailCount.textContent = summary.emailOptedInCount || 0;
    console.log('Updated email opt-in count:', summary.emailOptedInCount || 0);
  }
  
  if (smsCount) {
    smsCount.textContent = summary.smsOptedInCount || 0;
    console.log('Updated SMS opt-in count:', summary.smsOptedInCount || 0);
  }
  
  if (promoCount) {
    promoCount.textContent = summary.promoOptedInCount || 0;
    console.log('Updated promo opt-in count:', summary.promoOptedInCount || 0);
  }
  
  // Add animation effect to the cards
  animateCards();
}

function animateCards() {
  const cards = document.querySelectorAll('.preferences-summary-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 150);
  });
}

function showPreferencesLoading(isLoading) {
  const refreshBtn = document.getElementById('refreshPreferencesBtn');
  if (!refreshBtn) return;
  
  if (isLoading) {
    refreshBtn.textContent = 'Loading...';
    refreshBtn.disabled = true;
    refreshBtn.style.opacity = '0.6';
  } else {
    refreshBtn.textContent = 'Refresh Data';
    refreshBtn.disabled = false;
    refreshBtn.style.opacity = '1';
  }
}

function showPreferencesSuccess() {
  showStatusMessage('✅ Preferences data refreshed successfully!', 'success');
}

function showPreferencesError() {
  showStatusMessage('❌ Failed to load preferences data. Please try again.', 'error');
  
  // Set default values on error
  const emailCount = document.getElementById('emailOptInCount');
  const smsCount = document.getElementById('smsOptInCount');
  const promoCount = document.getElementById('promoOptInCount');
  
  if (emailCount) emailCount.textContent = '0';
  if (smsCount) smsCount.textContent = '0';
  if (promoCount) promoCount.textContent = '0';
}

function showStatusMessage(message, type) {
  // Remove any existing status messages
  const existingMessage = document.querySelector('.preferences-status-message');
  if (existingMessage) {
    existingMessage.remove();
  }
  
  // Create new status message
  const statusDiv = document.createElement('div');
  statusDiv.className = `preferences-status-message ${type}`;
  statusDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${type === 'success' ? 
      'background: #dcfce7; color: #16a34a; border: 1px solid #22c55e;' : 
      'background: #fee2e2; color: #ef4444; border: 1px solid #f87171;'
    }
  `;
  statusDiv.textContent = message;
  
  document.body.appendChild(statusDiv);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    statusDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => statusDiv.remove(), 300);
  }, 3000);
}

// Setup refresh button functionality
function setupPreferencesRefresh() {
  const refreshBtn = document.getElementById('refreshPreferencesBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadPreferencesSummary);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupPreferencesRefresh();
});

// Global function for tab navigation
window.loadPreferencesSummary = loadPreferencesSummary; 