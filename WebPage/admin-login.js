document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUsername', data.username);
        alert('✅ Admin login successful! Redirecting...');
        window.location.href = 'admin.html';
      } else {
        alert('❌ Login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ Server error. Is the server running? Check console.');
    }
  });
});
