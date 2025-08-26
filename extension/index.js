const authContainer = document.getElementById('auth-container');
const mainContainer = document.getElementById('main-container');

// Check if user is already logged in (token in localStorage)
const token = localStorage.getItem('authToken');
if (token) {
    authContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    loadTabsFromBackend(); // Load tabs automatically
}

// --- Login/register event handlers ---
document.getElementById('register-btn').addEventListener('click', async () => {
    const username = document.getElementById('username-el').value.trim();
    const password = document.getElementById('password-el').value.trim();
    if (!username || !password) return alert("Enter username and password");

    try {
        const res = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            alert("Registered! Now log in.");
        } else {
            alert(data.error || "Registration failed");
        }
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('login-btn').addEventListener('click', async () => {
    const username = document.getElementById('username-el').value.trim();
    const password = document.getElementById('password-el').value.trim();
    if (!username || !password) return alert("Enter username and password");

    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);

            // Show main extension UI
            authContainer.style.display = 'none';
            mainContainer.style.display = 'block';

            loadTabsFromBackend();
        } else {
            alert(data.error || "Login failed");
        }
    } catch (err) {
        console.error(err);
    }
});

const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken'); // remove token
    mainContainer.style.display = 'none';
    authContainer.style.display = 'block';
});

let researchLinks = [];

const inputEl = document.getElementById("input-el");
const noteEl = document.getElementById("note-el");
const tagEl = document.getElementById("tag-el");
const exportBtn = document.getElementById("export-btn");
const inputBtn = document.getElementById("input-btn");
const ulEl = document.getElementById("ul-el");
const deleteBtn = document.getElementById("delete-btn");
const tabBtn = document.getElementById("tab-btn");

const usernameEl = document.getElementById("username-el");
const passwordEl = document.getElementById("password-el");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

const API_BASE = 'http://localhost:3000';
let authToken = localStorage.getItem("authToken") || null;

// --- Utility: auth headers ---
function authHeaders() {
  return authToken ? {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${authToken}`
  } : { "Content-Type": "application/json" };
}

// --- Save a single tab to backend ---
function saveToBackend(tab) {
  if (!authToken) return alert("Login first!");
  fetch(`${API_BASE}/save-tab`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(tab)
  })
  .then(res => res.json())
  .then(data => console.log('Saved to backend:', data))
  .catch(err => console.error('Error saving to backend:', err));
}

// --- Load all tabs from backend ---
async function loadTabsFromBackend() {
  if (!authToken) return;
  try {
    const res = await fetch(`${API_BASE}/tabs`, { headers: authHeaders() });
    const data = await res.json();

    researchLinks = data.map(t => ({
      url: t.url,
      note: t.note || "",
      tag: t.tag || "General",
      date: t.date || new Date(t.createdAt).toLocaleDateString()
    }));

    localStorage.setItem("researchLinks", JSON.stringify(researchLinks));
    render(researchLinks);
  } catch (err) {
    console.error('Error fetching tabs from backend:', err);
    const savedLinks = JSON.parse(localStorage.getItem("researchLinks")) || [];
    researchLinks = savedLinks;
    render(researchLinks);
  }
}

// --- Register ---
registerBtn.addEventListener("click", async () => {
  const username = usernameEl.value.trim();
  const password = passwordEl.value.trim();
  if (!username || !password) return alert("Enter username & password");

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    alert(data.success ? "Registered! Now log in." : data.error);
  } catch (err) {
    console.error(err);
  }
});

// --- Login ---
loginBtn.addEventListener("click", async () => {
  const username = usernameEl.value.trim();
  const password = passwordEl.value.trim();
  if (!username || !password) return alert("Enter username & password");

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.token) {
      authToken = data.token;
      localStorage.setItem("authToken", authToken);
      alert("Logged in!");
      loadTabsFromBackend();
    } else {
      alert("Login failed");
    }
  } catch (err) {
    console.error(err);
  }
});

// --- Save current tab ---
tabBtn.addEventListener("click", function(){    
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    const linkData = {
      url: tabs[0].url,
      note: noteEl.value || "",
      tag: tagEl.value || "General",
      date: new Date().toLocaleDateString()
    };
    researchLinks.push(linkData);

    saveToBackend(linkData);
    localStorage.setItem("researchLinks", JSON.stringify(researchLinks));

    noteEl.value = "";
    render(researchLinks);
  });
});

// --- Add custom URL manually ---
inputBtn.addEventListener("click", function() {
  if (inputEl.value.trim() === "") return;

  const linkData = {
    url: inputEl.value,
    note: noteEl.value || "",
    tag: tagEl.value || "General",
    date: new Date().toLocaleDateString()
  };

  researchLinks.push(linkData);

  saveToBackend(linkData);
  localStorage.setItem("researchLinks", JSON.stringify(researchLinks));

  inputEl.value = "";
  noteEl.value = "";
  render(researchLinks);
});

// --- Render links ---
function render(links) {
  let listItems = "";
  for (let i = 0; i < links.length; i++) {
    listItems += `
      <li>
        <a target='_blank' href='${links[i].url}'>${links[i].url}</a><br>
        <small>
          Note: ${links[i].note || "None"} |
          Tag: ${links[i].tag} |
          Saved: ${links[i].date}
        </small>
      </li>
    `;
  }
  ulEl.innerHTML = listItems;
}

// --- Delete all ---
deleteBtn.addEventListener("dblclick", async function() {
  if (!authToken) return alert("Login first!");
  try {
    await fetch(`${API_BASE}/tabs`, { method: "DELETE", headers: authHeaders() });
    localStorage.clear();
    researchLinks = [];
    render(researchLinks);
    console.log("Deleted all tabs");
  } catch (err) {
    console.error(err);
  }
});

// --- Export as JSON ---
exportBtn.addEventListener("click", function() {
  const dataStr = JSON.stringify(researchLinks, null, 2);
  const blob = new Blob([dataStr], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "research_links.json";
  a.click();
  URL.revokeObjectURL(url);
});

// --- Load tabs on popup open ---
document.addEventListener("DOMContentLoaded", loadTabsFromBackend);
