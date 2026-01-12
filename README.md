🏥 2Care.ai - Digital Health Wallet
2Care.ai is a secure, full-stack Digital Health Wallet that allows users to store, track, and share medical records and health vitals. The application provides a central hub for patients to manage their data while allowing granular access for doctors and family members.

✨ Features
1. Secure Authentication & Authorization
JWT-based Login: Secure sessions using JSON Web Tokens.

Role-Based Access (RBAC):

Owners: Full control to upload, delete, and share records.

Viewers (Doctors/Family): Read-only access to specific shared records.

2. Vitals Tracking & Visualization
Manual Entry: Store Heart Rate, Blood Sugar, and Blood Pressure.

Trend Analysis: Interactive line charts powered by Chart.js to visualize health changes over time.

3. Medical Report Management
File Uploads: Securely store PDF and Image reports.

Categorization: Tag reports by type (e.g., Blood Test, X-Ray).

4. Advanced Report Retrieval
Date Range Filtering: Search for records within specific timeframes.

Category Search: Filter by report type or category name.

5. Access Control (Sharing)
Granular Sharing: Owners can share specific reports with other users by username.

Status Badges: Shared users see a "Shared with you" badge and cannot delete records.

🛠️ Tech Stack
Frontend: React.js, Axios, Chart.js, React-ChartJS-2

Backend: Node.js, Express.js, JWT, Multer (File Uploads)

Database: SQLite3 (Local, lightweight relational database)

🚀 Getting Started
Prerequisites
Node.js installed on your machine.

Git for version control.

Installation
Clone the repository:

Bash

git clone https://github.com/your-username/2care-ai.git
cd 2care-ai
Setup Backend:

Bash

cd backend
npm install
mkdir uploads  # Create the folder for storing uploaded files
node server.js
Setup Frontend:

Bash

cd ../frontend
npm install
npm start
📂 Project Structure
Plaintext

2care-ai/
├── backend/
│   ├── uploads/          # Stored medical files
│   ├── server.js         # Express API & Routes
│   ├── db.js             # SQLite Database Schema
│   └── health.db         # Local Database file
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main Dashboard UI
│   │   └── VitalsChart.js # Trend Visualization Component
│   └── package.json
└── README.md
🔧 Troubleshooting
Authentication Failed / Route Not Responding?

Ensure the backend server is running on port 5000.

Delete node_modules and run npm install again if moving code between different operating systems.

Clear your browser's Local Storage (Inspect -> Application -> Clear Storage).

Delete health.db and restart the server to refresh the database schema.

📄 License
Distributed under the MIT License. See LICENSE for more information.
