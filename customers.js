// Set global backendUrl if it doesn't exist
if (typeof window.backendUrl === 'undefined') {
  window.backendUrl = 'http://localhost:8080';
}

let allCustomers = [];

async function fetchCustomers() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch(`${window.backendUrl}/api/customers`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      alert('Failed to fetch customers: ' + response.statusText);
      return;
    }

    const customers = await response.json();
    allCustomers = customers;
    renderCustomers(customers);

  } catch (error) {
    alert('Error fetching customers: ' + error.message);
  }
}

function getSearchParam(query) {
  if (!query) return null;
  query = query.trim();
  if (query.includes('@')) {
    return { key: 'email', value: query };
  }
  if (/^\+?\d{6,}$/.test(query.replace(/\s+/g, ''))) {
    return { key: 'phone', value: query };
  }
  // Try to match lastName from the loaded customers
  const lowerQuery = query.toLowerCase();
  const lastNameMatch = allCustomers.find(c => (c.lastName || '').toLowerCase() === lowerQuery);
  if (lastNameMatch) {
    return { key: 'lastName', value: query };
  }
  return { key: 'name', value: query };
}

async function searchCustomers(query) {
  const token = localStorage.getItem('token');
  if (!token) return;
  if (!query) {
    renderCustomers(allCustomers);
    return;
  }

  const param = getSearchParam(query);
  if (!param) {
    renderCustomers(allCustomers);
    return;
  }
  const params = new URLSearchParams();
  params.append(param.key, param.value);

  try {
    const response = await fetch(`${window.backendUrl}/api/customers/search?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      alert('Search failed: ' + response.statusText);
      return;
    }
    const customers = await response.json();
    renderCustomers(customers);
  } catch (error) {
    alert('Error searching customers: ' + error.message);
  }
}

function renderCustomers(customers) {
  const container = document.getElementById('customers-container');
  container.innerHTML = '';

  const table = document.createElement('table');

  const headerRow = document.createElement('tr');
  ['ID', 'First Name', 'Last Name', 'Email', 'Phone'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  customers.forEach(customer => {
    const row = document.createElement('tr');
    row.classList.add('clickable-row');
    row.addEventListener('click', () => {
      window.location.href = `customer-details.html?id=${encodeURIComponent(customer.id)}`;
    });
    [
      customer.id,
      customer.firstName || customer.name || '',
      customer.lastName || '',
      customer.email || '',
      customer.phone || ''
    ].forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  container.appendChild(table);
}

function setupSearchBar() {
  const input = document.getElementById('customerSearchInput');
  const btn = document.getElementById('customerSearchBtn');
  if (!input || !btn) return;

  btn.addEventListener('click', () => {
    const query = input.value.trim();
    searchCustomers(query);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchCustomers(input.value.trim());
    }
  });

  input.addEventListener('input', () => {
    if (!input.value.trim()) {
      renderCustomers(allCustomers);
    }
  });
}

// Add Customer Modal Logic
function setupAddCustomerModal() {
  const addBtn = document.getElementById('addCustomerBtn');
  const modal = document.getElementById('addCustomerModal');
  const closeBtn = document.getElementById('closeAddCustomerModal');
  const form = document.getElementById('addCustomerForm');

  if (!addBtn || !modal || !closeBtn || !form) return;

  addBtn.onclick = () => { modal.style.display = 'flex'; };
  closeBtn.onclick = () => { modal.style.display = 'none'; };
  window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('addFirstName').value.trim(),
      firstName: document.getElementById('addFirstName').value.trim(),
      lastName: document.getElementById('addLastName').value.trim(),
      email: document.getElementById('addEmail').value.trim(),
      phone: document.getElementById('addPhone').value.trim(),
    };
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${window.backendUrl}/api/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add customer');
      modal.style.display = 'none';
      form.reset();
      fetchCustomers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };
}

fetchCustomers();
window.addEventListener('DOMContentLoaded', setupSearchBar);
window.addEventListener('DOMContentLoaded', setupAddCustomerModal);
