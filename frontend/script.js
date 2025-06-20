// Set global backendUrl if it doesn't exist
if (typeof window.backendUrl === 'undefined') {
  window.backendUrl = 'http://localhost:8080';
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const response = await fetch(`${window.backendUrl}/api/admins/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      alert('Login failed: ' + response.statusText);
      return;
    }

    const data = await response.json();

    if (!data.token) {
      alert('Login failed: No token received');
      return;
    }

    localStorage.setItem('token', data.token.trim());
    alert('Login successful!');
    window.location.href = 'dashboard.html';  

  } catch (err) {
    alert('Error: ' + err.message);
  }
});
