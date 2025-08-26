# 📚 Research Tab Collector (Chrome Extension + Backend)

A Chrome extension + Node.js backend to **save, tag, and organize research links** with notes.  
Includes **authentication** so each user has their own saved tabs.

---

## 🚀 Features
- 🔖 Save **current tab** or **manual URL** with notes & tags  
- 🗂️ Organize links by tag (General, Project, Assignment, Thesis)  
- 🔐 Authentication (Register / Login / Logout)  
- ☁️ Links are stored **in MongoDB** (per user)  
- 📤 Export saved research links to JSON  
- 🧹 Clear all saved links (per user)  

---

## 🛠️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| **Frontend** | Vanilla JS, HTML, CSS (Chrome Extension popup) |
| **Backend**  | Node.js, Express |
| **Database** | MongoDB + Mongoose |
| **Auth**     | JWT + bcrypt |

---

## 📂 Project Structure
```bash
research-tab-collector/
│
├── extension/         # Chrome extension popup UI
│   ├── index.html
│   ├── index.css
│   ├── index.js
│   └── manifest.json
│
├── server/            # Node.js + Express backend
│   ├── index.js
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── .env.example   # Example env file
│   └── ...
│
├── .gitignore
├── README.md
└── ...
```
## ⚙️ Setup Instructions
### 🔧 1. Clone the repo 
```bash
git clone https://github.com/YOUR_USERNAME/research-tab-collector.git
cd research-tab-collector
```

### 🔧 2. Backend Setup
```bash
cd server
npm install
```

Create a .env file inside /server:
```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
```

Start the backend server:
```bash
npm run dev   # or: node index.js
```

👉 Server runs at http://localhost:3000

### 🔧 3. Chrome Extension Setup
1. Open Chrome and go to: chrome://extensions/
2. Enable Developer Mode
3. Click Load unpacked
4. Select the extension/ folder
✅ The extension should now appear in your browser!

### 🧪 Usage
1. Register / Login inside the extension popup
2. Save current tab or paste a link manually
3. Add notes and tags for better organization
4. Export or clear links whenever needed

### 🔐 Authentication Flow

Users register with username + password
Passwords are stored securely using bcrypt hashing
On login, backend issues a JWT token

Token is stored in localStorage and used for API calls

All tab operations (/tabs, /save-tab, etc.) require authentication

### 📝 Future Improvements

- 🔎 Search & filter by tag or note
- 🎨 UI polish (dark mode, better styling)
- 🌍 Deploy backend (Heroku / Render / Railway)
- 🔄 Sync across devices

### 👨‍💻 Author
Built with ❤️ by Pranav Somwanshi
