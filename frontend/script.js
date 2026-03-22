const API = "http://localhost:5000/api";

// Helper: Get headers with auth token
function getHeaders() {
  const stored = JSON.parse(localStorage.getItem("auth") || '{}');
  const headers = { "Content-Type": "application/json" };
  if (stored.token) headers.Authorization = `Bearer ${stored.token}`;
  return headers;
}

// 1. INITIALIZE PAGE
document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    showMessage();
    
    const path = window.location.pathname;
    if (path.includes("index.html") || path.endsWith("/")) {
        checkAuth();
        loadDashboardData();
    } else if (path.includes("admin.html")) {
        checkAuth();
        loadAdminData();
    }
});

// 2. NAVBAR
function loadNavbar() {
    const stored = JSON.parse(localStorage.getItem("auth") || '{}');
    const user = stored.user;
    const navDiv = document.getElementById("nav");
    if (navDiv) {
        navDiv.innerHTML = `
            <nav class="navbar">
                <div class="logo">🍲 CareConnect</div>
                <div class="nav-links">
                    <a href="index.html">Home</a>
                    <a href="request.html">Request</a>
                    <a href="donate.html">Donate</a>
                    <a href="profile.html">Profile</a>
                    ${user && user.role === 'admin' ? '<a href="admin.html" style="color:#f39c12; font-weight:bold;">Admin</a>' : ''}
                    <a href="#" onclick="logout(); return false;" style="color:#ff4b2b">Logout</a>
                </div>
            </nav>`;
    }
}

// 3. AUTH
async function registerUser(e) {
    e.preventDefault();
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const res = await fetch(`${API}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("auth", JSON.stringify(data)); // {user, token}
            localStorage.setItem("msg", "Registration Successful!");
            window.location.href = "login.html";
        } else {
            const err = await res.json();
            alert(err.msg || "Registration Failed.");
        }
    } catch (err) {
        alert("Network error.");
    }
}

async function loginUser(e) {
    e.preventDefault();
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const res = await fetch(`${API}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem("auth", JSON.stringify(data)); // {user, token}
            window.location.href = "index.html";
        } else {
            const err = await res.json();
            alert(err.msg || "Invalid Login Credentials.");
        }
    } catch (err) {
        alert("Network error.");
    }
}

// 4. SUBMIT REQUEST
async function submitRequest(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        location: document.getElementById("location").value,
        food: document.getElementById("food").value
    };

    try {
        const res = await fetch(`${API}/requests`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            localStorage.setItem("msg", "Request submitted successfully!");
            window.location.href = "index.html";
        } else {
            const err = await res.json();
            alert(err.msg || "Failed to submit request.");
        }
    } catch (err) {
        alert("Network error. Server running?");
    }
}

// 5. SUBMIT DONATION
async function submitDonation(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        foodType: document.getElementById("foodType").value,
        quantity: document.getElementById("quantity").value,
        location: document.getElementById("location").value
    };

    try {
        const res = await fetch(`${API}/donations`, {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            localStorage.setItem("msg", "Donation posted successfully!");
            window.location.href = "index.html";
        } else {
            const err = await res.json();
            alert(err.msg || "Failed to submit donation.");
        }
    } catch (err) {
        alert("Network error. Server running?");
    }
}

// 6. DATA & ACTIONS
async function loadDashboardData() {
  try {
    const res = await fetch(`${API}/admin`);
    const data = await res.json();

    document.getElementById("requestsList").innerHTML = data.unfulfilledRequests.map(r => `
      <div class="glass-card" style="margin-bottom:15px; padding:1.5rem;">
        <div style="font-weight:bold; color:#4facfe;">🍱 ${r.food}</div>
        <div style="font-size:12px; opacity:0.7; margin:8px 0;">📍 ${r.location}</div>
        <button onclick="handleAction('request', '${r._id}', 'fulfill', '${r.phone}')" 
          style="background:rgba(79,172,254,0.1)">
          Fulfill
        </button>
      </div>`).join("");

    document.getElementById("donationsList").innerHTML = data.unclaimedDonations.map(d => `
      <div class="glass-card" style="margin-bottom:15px; padding:1.5rem;">
        <div style="font-weight:bold; color:#43e97b;">🍲 ${d.foodType}</div>
        <div style="font-size:12px; opacity:0.7; margin:8px 0;">📍 ${d.location}</div>
        <button onclick="handleAction('donation', '${d._id}', 'claim', '${d.phone}')" 
          style="background:rgba(67,233,123,0.1)">
          Claim
        </button>
      </div>`).join("");
  } catch (e) {
    document.getElementById("requestsList").innerHTML = '<p style="text-align:center;opacity:0.5;">Loading failed. Start backend server?</p>';
    document.getElementById("donationsList").innerHTML = '';
    console.error("Data failed to load", e);
  }
}

async function loadAdminData() {
  try {
    const res = await fetch(`${API}/admin`);
    const data = await res.json();

    // Update admin.html stat cards only
    if (data.stats && document.getElementById('users')) {
      document.getElementById('users').textContent = data.stats.totalUsers;
      document.getElementById('requests').textContent = data.stats.totalRequests;
      document.getElementById('donations').textContent = data.stats.totalDonations;
    }
  } catch (e) {
    console.error("Admin data failed to load", e);
  }
}

window.handleAction = async (type, id, action, phone = "") => {
    if (confirm(`Confirm ${action}?`)) {
        try {
            const res = await fetch(`${API}/${type}s/${id}`, { 
                method: "DELETE",
                headers: getHeaders()
            });
            if (res.ok) {
                if (phone && action !== 'delete') alert(`Contact: ${phone}`);
                loadAllData();
            } else {
                alert("Action failed. Check console.");
            }
        } catch (e) {
            alert("Network error.");
        }
    }
};

// Upload profile image
async function uploadImage() {
  const imageInput = document.getElementById('image');
  const file = imageInput.files[0];
  if (!file) {
    alert('Please select an image');
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const stored = JSON.parse(localStorage.getItem("auth") || '{}');
    const res = await fetch(`${API}/users/profile-pic`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stored.token}`
      },
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("auth", JSON.stringify({ user: data.user, token: stored.token }));
      document.getElementById("profileImg").src = `http://localhost:5000/uploads/${data.user.profilePic}?t=${Date.now()}`;
      alert('Profile photo updated!');
    } else {
      const err = await res.json();
      alert(err.msg || 'Upload failed');
    }
  } catch (err) {
    alert('Network error');
  }
}

// Utils
function logout() { 
    localStorage.removeItem("auth"); 
    localStorage.removeItem("msg");
    window.location.href = "login.html"; 
}
function checkAuth() { 
    if (!localStorage.getItem("auth")) window.location.href = "login.html"; 
}
function showMessage() {
    const msg = localStorage.getItem("msg");
    if (msg && document.getElementById("message")) {
        document.getElementById("message").innerText = msg;
        localStorage.removeItem("msg");
    }
}
