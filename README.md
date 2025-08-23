# 👩‍💻 Realtime Collaborative Code Editor

A  **Realtime Collaborative Code Editor** that allows multiple users to join a room, write and edit code together in real time, run it using the **Piston API**, and communicate seamlessly.  
It features avatars, live updates, toast notifications, and a clean dark-themed UI.

https://github.com/user-attachments/assets/0afa468c-b369-4ae6-89e2-8d121b0ec6a0

## 🚀 Features

- 🔗 **Realtime Collaboration** – Multiple users can edit the same code in sync using **Socket.IO**.
- 💻 **Multi-language Support** – Run code in JavaScript, Python, Java, C#, PHP, and TypeScript via **Piston API**.
- 🧑‍🤝‍🧑 **User Management** – Unique username & avatar generated for each connected user.
- 🎨 **Modern UI** – Built with **React**, **Chakra UI**, **TailwindCSS**, and **Monaco Editor**.
- 🌙 **Dark Mode** – Sleek coding environment with dark theme.
- 🔔 **Toast Notifications** – Alerts when users join or leave rooms.


## 🛠️ Tech Stack

### Frontend (`/realtime-editor`)
- React 18
- Chakra UI + TailwindCSS
- Monaco Editor
- Socket.IO Client
- React Hot Toast
- React Avatar + UI Avatars API

### Backend (`/server`)
- Node.js + Express.js
- Socket.IO Server
- CORS + dotenv
- Serves frontend build in production

project-root/
│
├── realtime-editor/ # Frontend (React App)
│ ├── src/
│ ├── package.json
│ └── ...
│
├── server/ # Backend (Express + Socket.IO)
│ ├── server.js
│ ├── package.json
│ └── ...
│
└── README.md # Documentation



🖥️ Usage Guide

Open http://localhost:5173.

Enter a room ID (new or existing).

Share the room ID with others to collaborate.

Start typing code → changes sync in real time.

Select language → Run code via Piston API.

Users joining/leaving trigger toast notifications with avatars.

Close tab → automatically removed from the room.

📡 Socket.IO Events

join-room → User joins with room ID, username, and avatar.

send → User sends updated code.

receive → Other users receive latest code.

user-joined → Broadcast when a new user joins.

user-left → Broadcast when a user disconnects.

✨ Future Improvements

Integrated chat system inside rooms.

Code execution output panel with error handling.

Support for saving sessions to database.

Role-based features (Owner/Guest).

🤝 Contributing

Fork the repo 🍴

Create a new branch: git checkout -b feature-name

Commit changes: git commit -m "Added feature"

Push branch: git push origin feature-name

Open a Pull Request


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Vvnu/codeeditor.git
cd codeeditor


2️⃣ Setup Backend
cd server
npm install

Create a .env file:

PORT=5000
CLIENTURL=http://localhost:5173

Run server in development:

npm run dev or npm start

3️⃣ Setup Frontend
cd ../realtime-editor
npm install
npm run dev


Frontend will start on:
👉 http://localhost:5173

Backend will run on:
👉 http://localhost:5000



🚢 Production Build

Build the frontend:

cd realtime-editor
npm run build


Copy build to server:

cd ../server
npm run build


Start the server:

npm start





