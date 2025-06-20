// Set global backendUrl if it doesn't exist
if (typeof window.backendUrl === 'undefined') {
  window.backendUrl = 'http://localhost:8080';
}

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
    const response = await fetch(`${window.backendUrl}/api/customers/${id}`, {
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

async function fetchCustomerAddress(id) {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const response = await fetch(`${window.backendUrl}/api/addresses/customer/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.log('No address found for customer:', id);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer address:', error);
    return null;
  }
}

async function fetchCustomerPreferences(id) {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const response = await fetch(`${window.backendUrl}/api/preferences/customer/${id}`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.log('No preferences found for customer:', id);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer preferences:', error);
    return null;
  }
}

function fillForm(customer) {
  // Fill basic customer info
  document.getElementById('firstName').value = customer.firstName || customer.name || '';
  document.getElementById('lastName').value = customer.lastName || '';
  document.getElementById('email').value = customer.email || '';
  document.getElementById('phone').value = customer.phone || '';
  
  // Fill address fields - prioritize the latest address with actual data
  let addressToUse = null;
  
  if (Array.isArray(customer.addresses) && customer.addresses.length > 0) {
    // Find the most recent address that has city or country data
    addressToUse = customer.addresses.reverse().find(addr => addr.city || addr.country);
    
    // If no address with city/country, use the last one
    if (!addressToUse) {
      addressToUse = customer.addresses[customer.addresses.length - 1];
    }
  }
  
  if (addressToUse) {
    document.getElementById('street').value = addressToUse.street || addressToUse.value || '';
    document.getElementById('city').value = addressToUse.city || '';
    document.getElementById('country').value = addressToUse.country || '';
  } else {
    document.getElementById('street').value = '';
    document.getElementById('city').value = '';
    document.getElementById('country').value = '';
  }
  
  // Fill preferences from customer preference object
  const pref = customer.preference || {};
  document.getElementById('emailOptIn').checked = !!pref.emailOptIn;
  document.getElementById('smsOptIn').checked = !!pref.smsOptIn;
  document.getElementById('promoOptIn').checked = !!pref.promoOptIn;
  document.getElementById('preferredChannel').value = pref.preferredChannel || '';
}

async function updateCustomer(id, data) {
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    const response = await fetch(`${window.backendUrl}/api/customers/${id}`, {
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

async function updateCustomerPreferences(id, preferences) {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    console.log('Updating preferences for customer:', id, preferences);
    const response = await fetch(`${window.backendUrl}/api/preferences/customer/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });
    if (!response.ok) {
      console.error('Failed to update preferences:', response.status, response.statusText);
      alert('Failed to update preferences: ' + response.statusText);
      return false;
    }
    console.log('Preferences updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating preferences:', error);
    alert('Error updating preferences: ' + error.message);
    return false;
  }
}

async function addOrUpdateCustomerAddress(customerId, addressData) {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    console.log('Adding/updating address for customer:', customerId, addressData);
    
    // First get existing addresses to see if we should update or create
    const existingAddresses = await fetchCustomerAddresses(customerId);
    
    if (existingAddresses && existingAddresses.length > 0) {
      // Update the most recent address that has data, or the last one
      const addressToUpdate = existingAddresses.reverse().find(addr => addr.city || addr.country) || existingAddresses[existingAddresses.length - 1];
      
      console.log('Updating existing address:', addressToUpdate.id);
      const response = await fetch(`${window.backendUrl}/api/addresses/${addressToUpdate.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });
      
      if (!response.ok) {
        console.error('Failed to update address:', response.status, response.statusText);
        return false;
      }
      console.log('Address updated successfully');
      return true;
    } else {
      // Create new address
      console.log('Creating new address for customer');
      const response = await fetch(`${window.backendUrl}/api/addresses/customer/${customerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });
      
      if (!response.ok) {
        console.error('Failed to create address:', response.status, response.statusText);
        return false;
      }
      console.log('Address created successfully');
      return true;
    }
  } catch (error) {
    console.error('Error with address operation:', error);
    return false;
  }
}

async function fetchCustomerAddresses(customerId) {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const response = await fetch(`${window.backendUrl}/api/addresses/customer/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.log('No addresses found for customer:', customerId);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching customer addresses:', error);
    return null;
  }
}

async function deleteCustomer(id) {
  const token = localStorage.getItem('token');
  if (!token) return;
  if (!confirm('Are you sure you want to delete this customer?')) return;
  try {
    const response = await fetch(`${window.backendUrl}/api/customers/${id}`, {
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
  
  console.log('Loading customer data for ID:', id);
  
  // Fetch customer data (includes addresses and preferences)
  const customer = await fetchCustomer(id);
  
  if (!customer) return;
  
  console.log('Customer data:', customer);
  console.log('Addresses:', customer.addresses);
  console.log('Preferences:', customer.preference);
  
  fillForm(customer);

  document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const street = document.getElementById('street').value.trim();
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();
    
    // Collect preferences from checklist and dropdown
    const preferences = {
      emailOptIn: document.getElementById('emailOptIn').checked,
      smsOptIn: document.getElementById('smsOptIn').checked,
      promoOptIn: document.getElementById('promoOptIn').checked
    };
    
    // Collect address data
    const address = {
      city: city,
      country: country
    };
    
    // Add street if provided (optional field)
    if (street) {
      address.street = street;
    }
    
    // Customer data (basic info only, no preferences - we'll update those separately)
    const customerData = {
      firstName,
      name: firstName, // for backend compatibility
      lastName,
      email,
      phone,
      preference: {
        preferredChannel: document.getElementById('preferredChannel').value
      }
    };
    
    try {
      let results = [];
      
      // Update customer basic info first
      await updateCustomer(id, customerData);
      results.push('Customer info updated');
      
      // Update preferences using the correct endpoint
      const preferencesSuccess = await updateCustomerPreferences(id, preferences);
      if (preferencesSuccess) {
        results.push('Preferences updated');
      }
      
      // Update address if any address data provided
      if (city || country || street) {
        const addressData = {
          street: street || null,
          city: city || null, 
          country: country || null,
          type: 'home'
        };
        
        const addressSuccess = await addOrUpdateCustomerAddress(id, addressData);
        if (addressSuccess) {
          results.push('Address updated');
        }
      }
      
      alert('Success: ' + results.join(', ') + '!');
      
    } catch (error) {
      console.error('Error in form submission:', error);
      alert('Error updating customer information.');
    }
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