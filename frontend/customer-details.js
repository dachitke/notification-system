const backendUrl = 'http://localhost:8080';

function getCustomerIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchCustomer(id) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    window.location.href = 'index.html';
    return;
  }
  try {
    const response = await fetch(`${backendUrl}/api/customers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      alert('Failed to fetch customer: ' + response.statusText);
      window.history.back();
      return;
    }
    return await response.json();
  } catch (error) {
    alert('Error fetching customer: ' + error.message);
    window.history.back();
  }
}

function fillForm(customer) {
  document.getElementById('firstName').value = customer.firstName || customer.name || '';
  document.getElementById('lastName').value = customer.lastName || '';
  document.getElementById('email').value = customer.email || '';
  document.getElementById('phone').value = customer.phone || '';
  // Use first address if available
  let addressValue = '';
  if (Array.isArray(customer.addresses) && customer.addresses.length > 0) {
    addressValue = customer.addresses[0].value || '';
  }
  document.getElementById('address').value = addressValue;
  // Fill preferences checklist and dropdown
  const pref = customer.preference || {};
  document.getElementById('smsOptIn').checked = !!pref.smsOptIn;
  document.getElementById('emailOptIn').checked = !!pref.emailOptIn;
  document.getElementById('promoOptIn').checked = !!pref.promoOptIn;
  document.getElementById('preferredChannel').value = pref.preferredChannel || '';
}

async function updateCustomer(id, data) {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await fetch(`${backendUrl}/api/customers/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      alert('Failed to update customer: ' + response.statusText);
      return;
    }
    alert('Customer updated successfully!');
  } catch (error) {
    alert('Error updating customer: ' + error.message);
  }
}

async function deleteCustomer(id) {
  const token = localStorage.getItem('token');
  if (!token) return;
  if (!confirm('Are you sure you want to delete this customer?')) return;
  try {
    const response = await fetch(`${backendUrl}/api/customers/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      alert('Failed to delete customer: ' + response.statusText);
      return;
    }
    alert('Customer deleted successfully!');
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Error deleting customer: ' + error.message);
  }
}

// Add dark mode toggle logic for update page
function setDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  const btn = document.getElementById('darkModeToggle');
  if (btn) btn.textContent = enabled ? '☀️' : '🌙';
  localStorage.setItem('darkMode', enabled ? '1' : '0');
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = getCustomerIdFromUrl();
  if (!id) {
    alert('No customer ID provided.');
    window.history.back();
    return;
  }
  const customer = await fetchCustomer(id);
  if (!customer) return;
  fillForm(customer);

  document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    // Collect preferences from checklist and dropdown
    const preference = {
      smsOptIn: document.getElementById('smsOptIn').checked,
      emailOptIn: document.getElementById('emailOptIn').checked,
      promoOptIn: document.getElementById('promoOptIn').checked,
      preferredChannel: document.getElementById('preferredChannel').value
    };
    // Build addresses array for backend
    const addresses = address ? [{ value: address, type: 'home' }] : [];
    const data = {
      firstName,
      name: firstName, // for backend compatibility
      lastName,
      email,
      phone,
      addresses,
      preference,
    };
    await updateCustomer(id, data);
  });

  document.getElementById('deleteBtn').addEventListener('click', async () => {
    await deleteCustomer(id);
  });

  // Dark mode toggle setup
  const darkBtn = document.getElementById('darkModeToggle');
  if (darkBtn) {
    setDarkMode(localStorage.getItem('darkMode') === '1');
    darkBtn.addEventListener('click', () => {
      setDarkMode(!document.body.classList.contains('dark-mode'));
    });
  }
}); 