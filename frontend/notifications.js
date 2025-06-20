// Set global backendUrl if it doesn't exist
if (typeof window.backendUrl === 'undefined') {
  window.backendUrl = 'http://localhost:8080';
}

async function fetchNotificationSummary() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, redirecting to login');
      window.location.href = 'index.html';
      return null;
    }

    console.log('Fetching notification summary from:', `${window.backendUrl}/api/notifications/report/full`);
    const res = await fetch(`${window.backendUrl}/api/notifications/report/full`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('API Response status:', res.status);
    
    if (!res.ok) {
      console.error('API request failed:', res.status, res.statusText);
      return null;
    }
    
    const data = await res.json();
    console.log('Notification summary data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching notification summary:', error);
    return null;
  }
}

async function fetchRecentNotifications() {
  const token = localStorage.getItem('token');
  if (!token) return [];
  
  const res = await fetch(`${window.backendUrl}/api/notifications`, {
    headers: {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return [];
  const all = await res.json();
  // Sort by sentAt descending, take 10 most recent
  return all.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, 10);
}

async function fetchNotificationsByStatus(status) {
  const token = localStorage.getItem('token');
  if (!token) return [];
  
  try {
    let url;
    if (status === 'ALL') {
      // Fetch all notifications
      url = `${window.backendUrl}/api/notifications`;
    } else {
      // Fetch notifications by specific status using path parameter
      url = `${window.backendUrl}/api/notifications/status/${status}`;
    }
    
    console.log(`Fetching notifications by status: ${status} from ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch notifications by status ${status}:`, res.status, res.statusText);
      return [];
    }
    
    const notifications = await res.json();
    console.log(`Found ${notifications.length} notifications with status: ${status}`);
    return notifications;
  } catch (error) {
    console.error(`Error fetching notifications by status ${status}:`, error);
    return [];
  }
}

async function fetchNotificationsByCustomer(customerId) {
  const token = localStorage.getItem('token');
  if (!token) return [];
  
  const res = await fetch(`${window.backendUrl}/api/notifications/customer/${customerId}`, {
    headers: {
      'Authorization': `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) return [];
  return await res.json();
}

async function updateNotificationStatus(notificationId, newStatus) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found for updating notification status');
    alert('You need to be logged in to update notification status');
    return false;
  }

  try {
    console.log(`Updating notification ${notificationId} to status: ${newStatus}`);
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
    
    // First, let's test if we can fetch this specific notification (to verify the ID exists and token works)
    console.log('Testing if notification exists and token works...');
    const testUrl = `${window.backendUrl}/api/notifications`;
    const testResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Test fetch all notifications status: ${testResponse.status}`);
    
    if (!testResponse.ok) {
      console.error('Token seems invalid - cannot even fetch notifications');
      alert('Authentication failed. Please try logging out and logging back in.');
      return false;
    }
    
    // Now try to update the notification status
    const url = `${window.backendUrl}/api/notifications/${notificationId}?status=${newStatus}`;
    console.log(`Making PUT request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Update response status: ${response.status}`);

    if (!response.ok) {
      console.error('Failed to update notification status:', response.status, response.statusText);
      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        if (response.status === 401) {
          alert('Authentication failed. Please try logging out and logging back in.');
        } else if (response.status === 404) {
          alert('This notification update endpoint may not be supported by your backend.');
        } else if (response.status === 405) {
          alert('PUT method not allowed. Your backend may not support updating notification status.');
        } else {
          alert(`Failed to update notification: ${response.status} ${response.statusText}`);
        }
      } catch (e) {
        console.error('Could not read error response');
        alert(`Failed to update notification: ${response.status} ${response.statusText}`);
      }
      return false;
    }

    console.log(`Successfully updated notification ${notificationId} to ${newStatus}`);
    return true;
  } catch (error) {
    console.error('Error updating notification status:', error);
    alert('Network error while updating notification status');
    return false;
  }
}

function attachStatusDropdownListeners() {
  const dropdowns = document.querySelectorAll('.status-dropdown');
  
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('change', async function() {
      const notificationId = this.getAttribute('data-notification-id');
      const currentStatus = this.getAttribute('data-current-status');
      const newStatus = this.value;
      
      if (newStatus === currentStatus) {
        return; // No change
      }

      // Show loading state
      const originalHTML = this.innerHTML;
      this.innerHTML = '<option>Updating...</option>';
      this.disabled = true;

      // Confirm the change
      const confirmed = confirm(`Change notification status from "${currentStatus}" to "${newStatus}"?`);
      
      if (!confirmed) {
        // Revert the dropdown
        this.innerHTML = originalHTML;
        this.disabled = false;
        this.value = currentStatus;
        return;
      }

      // Attempt to update
      const success = await updateNotificationStatus(notificationId, newStatus);
      
      if (success) {
        // Update the status display in the same row
        const row = this.closest('tr');
        const statusSpan = row.querySelector('.notif-status');
        if (statusSpan) {
          statusSpan.className = `notif-status ${newStatus.toLowerCase()}`;
          statusSpan.textContent = newStatus;
        }
        
        // Update the dropdown's current status
        this.setAttribute('data-current-status', newStatus);
        this.innerHTML = originalHTML;
        this.disabled = false;
        this.value = newStatus;
        
        // Show success message
        showStatusMessage(`✅ Notification status updated to ${newStatus}`, 'success');
        
        // Refresh the current filtered view and summary numbers
        setTimeout(async () => {
          // Refresh summary numbers
          const summary = await fetchNotificationSummary();
          if (summary) {
            updateSummaryNumbers(summary);
          }
          
          // Refresh current filter view
          if (currentFilter !== 'ALL') {
            const filteredNotifications = await fetchNotificationsByStatus(currentFilter);
            renderNotificationsTable(filteredNotifications);
          }
        }, 500);
        
      } else {
        // Revert on failure
        this.innerHTML = originalHTML;
        this.disabled = false;
        this.value = currentStatus;
        showStatusMessage('❌ Failed to update notification status', 'error');
      }
    });
  });
}

function showStatusMessage(message, type) {
  // Remove existing message
  const existingMessage = document.querySelector('.status-update-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = `status-update-message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    background: ${type === 'success' ? '#22c55e' : '#ef4444'};
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(messageDiv);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 300);
    }
  }, 3000);
}

function renderSummary(summary) {
  if (!summary) return;
  document.querySelector('.notif-summary-card.delivered .notif-summary-value').textContent = summary.delivered || 0;
  document.querySelector('.notif-summary-card.failed .notif-summary-value').textContent = summary.failed || 0;
  document.querySelector('.notif-summary-card.pending .notif-summary-value').textContent = summary.pending || 0;
  // Success rate
  const percent = summary.total ? Math.round((summary.delivered / summary.total) * 100) : 0;
  document.querySelector('.notif-success-percent').textContent = percent + '%';
  // Progress ring
  const circle = document.querySelector('.notif-success-ring svg circle[stroke="#22c55e"]');
  if (circle) {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference * (1 - percent / 100));
  }
}

function renderNotificationsTable(notifications) {
  // Use the existing table in HTML instead of creating a new one
  const tableBody = document.getElementById('notificationsTableBody');
  if (!tableBody) return;
  
  // Clear existing rows and populate with new data
  tableBody.innerHTML = notifications.map(n => `
    <tr data-notification-id="${n.id || ''}">
      <td>${n.id || ''}</td>
      <td>${n.customerId || ''}</td>
      <td>${n.channel || ''}</td>
      <td class="message-cell">${n.message ? '"' + n.message.slice(0, 40) + (n.message.length > 40 ? '…' : '') + '"' : ''}</td>
      <td>
        <select class="status-dropdown" data-notification-id="${n.id || ''}" data-current-status="${n.status || ''}">
          <option value="PENDING" ${n.status === 'PENDING' ? 'selected' : ''}>Pending</option>
          <option value="DELIVERED" ${n.status === 'DELIVERED' ? 'selected' : ''}>Delivered</option>
          <option value="FAILED" ${n.status === 'FAILED' ? 'selected' : ''}>Failed</option>
        </select>
      </td>
      <td>${n.sentAt ? n.sentAt.replace('T', ' ').slice(0, 16) : ''}</td>
    </tr>
  `).join('');
  
  // Create mobile cards
  renderMobileCards(notifications);
  
  // Add event listeners to status dropdowns
  attachStatusDropdownListeners();
}

function renderMobileCards(notifications) {
  // Check if mobile cards container exists, if not create it
  let mobileContainer = document.getElementById('notificationsMobileCards');
  if (!mobileContainer) {
    const tableContainer = document.getElementById('notificationsTableContainer');
    if (tableContainer) {
      mobileContainer = document.createElement('div');
      mobileContainer.id = 'notificationsMobileCards';
      mobileContainer.className = 'notif-mobile-cards';
      tableContainer.appendChild(mobileContainer);
    } else {
      return;
    }
  }
  
  // Create mobile card HTML
  mobileContainer.innerHTML = notifications.map(n => `
    <div class="notif-card" data-notification-id="${n.id || ''}">
      <div class="notif-card-header">
        <div class="notif-card-id">ID: ${n.id || ''}</div>
        <span class="notif-card-status ${(n.status || '').toLowerCase()}">${n.status || ''}</span>
      </div>
      <div class="notif-card-body">
        <div class="notif-card-row">
          <span class="notif-card-label">Customer:</span>
          <span class="notif-card-value">${n.customerId || ''}</span>
        </div>
        <div class="notif-card-row">
          <span class="notif-card-label">Channel:</span>
          <span class="notif-card-value">${n.channel || ''}</span>
        </div>
        <div class="notif-card-row">
          <span class="notif-card-label">Sent:</span>
          <span class="notif-card-value">${n.sentAt ? n.sentAt.replace('T', ' ').slice(0, 16) : ''}</span>
        </div>
        ${n.message ? `
        <div class="notif-card-row">
          <span class="notif-card-label">Message:</span>
        </div>
        <div class="notif-card-message">"${n.message}"</div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

async function loadNotificationsDashboard() {
  console.log('Loading notifications dashboard...');
  
  // Fetch summary and details from /report/full
  const summary = await fetchNotificationSummary();
  if (!summary) {
    console.error('Failed to fetch notification summary');
    // Set default values when API fails
    const pendingNumber = document.querySelector('.notif-status-rect.pending .notif-status-number');
    const failedNumber = document.querySelector('.notif-status-rect.failed .notif-status-number');
    const deliveredNumber = document.querySelector('.notif-status-rect.delivered .notif-status-number');
    const successPercent = document.querySelector('.notif-success-percent');
    
    if (pendingNumber) pendingNumber.textContent = '0';
    if (failedNumber) failedNumber.textContent = '0';
    if (deliveredNumber) deliveredNumber.textContent = '0';
    if (successPercent) successPercent.textContent = '0%';
    return;
  }
  
  console.log('Updating UI with summary:', summary);
  
  // Update rectangles
  const pendingElement = document.querySelector('.notif-status-rect.pending .notif-status-number');
  const failedElement = document.querySelector('.notif-status-rect.failed .notif-status-number');
  const deliveredElement = document.querySelector('.notif-status-rect.delivered .notif-status-number');
  const successPercentElement = document.querySelector('.notif-success-percent');
  
  if (pendingElement) {
    pendingElement.textContent = summary.pending || 0;
    console.log('Updated pending count:', summary.pending || 0);
  }
  if (failedElement) {
    failedElement.textContent = summary.failed || 0;
    console.log('Updated failed count:', summary.failed || 0);
  }
  if (deliveredElement) {
    deliveredElement.textContent = summary.delivered || 0;
    console.log('Updated delivered count:', summary.delivered || 0);
  }
  
  // Update success rate
  const percent = summary.total ? Math.round((summary.delivered / summary.total) * 100) : 0;
  if (successPercentElement) {
    successPercentElement.textContent = percent + '%';
    console.log('Updated success rate:', percent + '%');
  }
  
  // Update progress ring
  const circle = document.getElementById('notifSuccessCircle');
  if (circle) {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference * (1 - percent / 100));
    console.log('Updated progress ring for', percent + '%');
  }
  
  // Render details table
  renderNotificationsTable(summary.details || []);
  
  // Set up filter functionality
  setupNotificationFilters();
}

let currentFilter = 'ALL'; // Track current filter

function setupNotificationFilters() {
  const filterButtons = document.querySelectorAll('.status-filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const status = this.getAttribute('data-status');
      
      // Update button states
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Update current filter
      currentFilter = status;
      
      // Show loading state
      showFilterLoading(true);
      
      // Fetch and render filtered notifications
      try {
        const notifications = await fetchNotificationsByStatus(status);
        renderNotificationsTable(notifications);
        
        // Update status message
        const statusText = status === 'ALL' ? 'all notifications' : `${status.toLowerCase()} notifications`;
        showStatusMessage(`📊 Showing ${notifications.length} ${statusText}`, 'success');
        
      } catch (error) {
        console.error('Error filtering notifications:', error);
        showStatusMessage('❌ Failed to filter notifications', 'error');
      } finally {
        showFilterLoading(false);
      }
    });
  });
}

function showFilterLoading(isLoading) {
  const activeButton = document.querySelector('.status-filter-btn.active');
  if (!activeButton) return;
  
  if (isLoading) {
    activeButton.textContent = 'Loading...';
    activeButton.disabled = true;
  } else {
    // Restore original text
    const status = activeButton.getAttribute('data-status');
    activeButton.textContent = status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase();
    activeButton.disabled = false;
  }
}

function updateSummaryNumbers(summary) {
  // Update rectangles
  const pendingElement = document.querySelector('.notif-status-rect.pending .notif-status-number');
  const failedElement = document.querySelector('.notif-status-rect.failed .notif-status-number');
  const deliveredElement = document.querySelector('.notif-status-rect.delivered .notif-status-number');
  const successPercentElement = document.querySelector('.notif-success-percent');
  
  if (pendingElement) {
    pendingElement.textContent = summary.pending || 0;
  }
  if (failedElement) {
    failedElement.textContent = summary.failed || 0;
  }
  if (deliveredElement) {
    deliveredElement.textContent = summary.delivered || 0;
  }
  
  // Update success rate
  const percent = summary.total ? Math.round((summary.delivered / summary.total) * 100) : 0;
  if (successPercentElement) {
    successPercentElement.textContent = percent + '%';
  }
  
  // Update progress ring
  const circle = document.getElementById('notifSuccessCircle');
  if (circle) {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference * (1 - percent / 100));
  }
}

async function addNotification(notificationData) {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found for adding notification');
    return false;
  }

  try {
    console.log('Adding notification:', notificationData);
    
    const response = await fetch(`${window.backendUrl}/api/notifications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });

    console.log(`Add notification response status: ${response.status}`);

    if (!response.ok) {
      console.error('Failed to add notification:', response.status, response.statusText);
      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        alert(`Failed to add notification: ${response.status} ${response.statusText}`);
      } catch (e) {
        alert(`Failed to add notification: ${response.status} ${response.statusText}`);
      }
      return false;
    }

    const newNotification = await response.json();
    console.log('Successfully added notification:', newNotification);
    return true;
  } catch (error) {
    console.error('Error adding notification:', error);
    alert('Network error while adding notification');
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Notifications.js DOM loaded');

  // Only run notifications dashboard logic if notificationsSection exists
  const notificationsSection = document.getElementById('notificationsSection');
  if (notificationsSection) {
    console.log('Notifications section found, loading dashboard...');
    
    // Load dashboard immediately if notifications section is visible
    if (notificationsSection.style.display !== 'none') {
      loadNotificationsDashboard();
    }
    
    // Also load when notifications tab is clicked
    const notificationsTab = document.getElementById('notificationsTab');
    if (notificationsTab) {
      notificationsTab.addEventListener('click', () => {
        console.log('Notifications tab clicked, loading dashboard...');
        setTimeout(() => {
          loadNotificationsDashboard();
        }, 100); // Small delay to ensure DOM updates
      });
    }
    
    // Add Notification Modal Logic
    const addNotificationBtn = document.getElementById('addNotificationBtn');
    const addNotificationModal = document.getElementById('addNotificationModal');
    const closeAddNotificationModal = document.getElementById('closeAddNotificationModal');
    const addNotificationForm = document.getElementById('addNotificationForm');

    if (addNotificationBtn && addNotificationModal) {
      addNotificationBtn.addEventListener('click', () => {
        addNotificationModal.style.display = 'block';
      });
    }

    if (closeAddNotificationModal && addNotificationModal) {
      closeAddNotificationModal.addEventListener('click', () => {
        addNotificationModal.style.display = 'none';
        if (addNotificationForm) addNotificationForm.reset();
      });
    }

    if (addNotificationModal) {
      window.addEventListener('click', (event) => {
        if (event.target === addNotificationModal) {
          addNotificationModal.style.display = 'none';
          if (addNotificationForm) addNotificationForm.reset();
        }
      });
    }

    if (addNotificationForm) {
      addNotificationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(addNotificationForm);
        const notificationData = {
          customerId: formData.get('customerId'),
          channel: formData.get('channel'),
          message: formData.get('message'),
          status: formData.get('status')
        };
        
        console.log('Submitting notification:', notificationData);
        
        const success = await addNotification(notificationData);
        if (success) {
          addNotificationModal.style.display = 'none';
          addNotificationForm.reset();
          showStatusMessage('✅ Notification added successfully!', 'success');
          
          // Refresh the notifications dashboard
          setTimeout(() => {
            loadNotificationsDashboard();
          }, 500);
        }
      });
    }
    
    // DESIGN ONLY: Add filter highlight logic
    const statusSelect = document.querySelector('.notif-filter-select:nth-of-type(1)');
    const channelSelect = document.querySelector('.notif-filter-select:nth-of-type(2)');
    const searchInput = document.querySelector('.notif-search');

    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        statusSelect.classList.toggle('active-filter', statusSelect.selectedIndex !== 0);
      });
    }
    if (channelSelect) {
      channelSelect.addEventListener('change', () => {
        channelSelect.classList.toggle('active-filter', channelSelect.selectedIndex !== 0);
      });
    }
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        searchInput.classList.toggle('active-filter', searchInput.value.trim().length > 0);
      });
    }
  } else {
    console.log('Notifications section not found on this page');
  }
}); 