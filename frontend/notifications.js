const backendUrl = 'http://localhost:8080';

async function fetchNotificationSummary() {
  const res = await fetch(`${backendUrl}/api/notifications/report/full`);
  if (!res.ok) return null;
  return await res.json();
}

async function fetchRecentNotifications() {
  const res = await fetch(`${backendUrl}/api/notifications`);
  if (!res.ok) return [];
  const all = await res.json();
  // Sort by sentAt descending, take 10 most recent
  return all.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).slice(0, 10);
}

async function fetchNotificationsByStatus(status) {
  const res = await fetch(`${backendUrl}/api/notifications/status/${status}`);
  if (!res.ok) return [];
  return await res.json();
}

async function fetchNotificationsByCustomer(customerId) {
  const res = await fetch(`${backendUrl}/api/notifications/customer/${customerId}`);
  if (!res.ok) return [];
  return await res.json();
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
  // Remove old table if exists
  let oldTable = document.getElementById('notifDetailsTable');
  if (oldTable) oldTable.remove();
  // Create new table
  const section = document.getElementById('notificationsSection');
  if (!section) return;
  const table = document.createElement('table');
  table.id = 'notifDetailsTable';
  table.className = 'notif-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Customer ID</th>
        <th>Channel</th>
        <th>Status</th>
        <th>Date/Time</th>
        <th>Message</th>
      </tr>
    </thead>
    <tbody>
      ${notifications.map(n => `
        <tr>
          <td>${n.customerId || ''}</td>
          <td>${n.channel || ''}</td>
          <td><span class="notif-status ${n.status ? n.status.toLowerCase() : ''}">${n.status || ''}</span></td>
          <td>${n.sentAt ? n.sentAt.replace('T', ' ').slice(0, 16) : ''}</td>
          <td>${n.message ? '"' + n.message.slice(0, 40) + (n.message.length > 40 ? '…' : '') + '"' : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
  section.appendChild(table);
}

async function loadNotificationsDashboard() {
  // Fetch summary and details from /report/full
  const summary = await fetchNotificationSummary();
  if (!summary) return;
  // Update rectangles
  document.querySelector('.notif-status-rect.pending').textContent = summary.pending || 0;
  document.querySelector('.notif-status-rect.failed').textContent = summary.failed || 0;
  document.querySelector('.notif-status-rect.delivered').textContent = summary.delivered || 0;
  // Update success rate
  const percent = summary.total ? Math.round((summary.delivered / summary.total) * 100) : 0;
  document.querySelector('.notif-success-percent').textContent = percent + '%';
  const circle = document.getElementById('notifSuccessCircle');
  if (circle) {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    circle.setAttribute('stroke-dasharray', circumference);
    circle.setAttribute('stroke-dashoffset', circumference * (1 - percent / 100));
  }
  // Render details table
  renderNotificationsTable(summary.details || []);
}

// Dark mode toggle logic
function setDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  const btn = document.getElementById('darkModeToggle');
  if (btn) btn.textContent = enabled ? '☀️' : '🌙';
  localStorage.setItem('darkMode', enabled ? '1' : '0');
}

document.addEventListener('DOMContentLoaded', () => {
  // Always set up dark mode toggle
  const darkBtn = document.getElementById('darkModeToggle');
  if (darkBtn) {
    // Set initial state from localStorage
    setDarkMode(localStorage.getItem('darkMode') === '1');
    darkBtn.addEventListener('click', () => {
      setDarkMode(!document.body.classList.contains('dark-mode'));
    });
  }

  // Only run notifications dashboard logic if notificationsSection exists
  if (document.getElementById('notificationsSection')) {
    loadNotificationsDashboard();
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
  }
}); 