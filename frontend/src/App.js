import React, { useState, useEffect } from "react";
import axios from "axios";
import VitalsChart from "./VitalsChart";

function App() {
  // Report and Form States
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    date: "",
    heartRate: "",
    sugar: "",
    bp: "",
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Auth States
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [authData, setAuthData] = useState({
    username: "",
    password: "",
    role: "Viewer",
  });

  // 1. Authentication Handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === "login" ? "login" : "register";
    try {
      const res = await axios.post(
        `http://localhost:5000/api/${endpoint}`,
        authData
      );

      if (authMode === "login") {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("username", res.data.username);
        setToken(res.data.token);
        setUserRole(res.data.role);
        setUsername(res.data.username);
      } else {
        alert("Registration successful! Please login.");
        setAuthMode("login");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserRole(null);
    setUsername(null);
  };

  // 2. Fetch data (Authenticated)
  const fetchReports = async () => {
    try {
      const url = `http://localhost:5000/api/reports?start=${startDate}&end=${endDate}&category=${categorySearch}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports(res.data);
    } catch (err) {
      console.error("Filter Error:", err);
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [token]);

  // 3. Upload Handler (Role Protected)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a file!");

    const data = new FormData();
    data.append("report", file);
    data.append("type", formData.type);
    data.append("date", formData.date);
    data.append("heartRate", formData.heartRate);
    data.append("sugar", formData.sugar);
    data.append("bp", formData.bp);

    try {
      await axios.post("http://localhost:5000/api/upload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Report Saved Successfully!");
      setFile(null);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    }
  };

  // 5. Share Handler (Specific Access Control)
  const handleShare = async (reportId) => {
    const targetUser = prompt(
      "Enter the username of the Doctor/Family member to share with:"
    );
    if (!targetUser) return;
    try {
      await axios.post(
        "http://localhost:5000/api/share",
        { reportId, targetUsername: targetUser },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Shared successfully!");
    } catch (err) {
      alert("Sharing failed: User might not exist.");
    }
  };

  // --- AUTHENTICATION UI ---
  if (!token) {
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        <h2>🏥 Health Wallet {authMode === "login" ? "Login" : "Register"}</h2>
        <form
          onSubmit={handleAuth}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Username"
            required
            onChange={(e) =>
              setAuthData({ ...authData, username: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setAuthData({ ...authData, password: e.target.value })
            }
          />

          {authMode === "register" && (
            <select
              onChange={(e) =>
                setAuthData({ ...authData, role: e.target.value })
              }
            >
              <option value="Viewer">Viewer</option>
              <option value="Owner">Owner</option>
            </select>
          )}

          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {authMode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
        <p
          onClick={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
          style={{ cursor: "pointer", color: "#3498db" }}
        >
          {authMode === "login"
            ? "Need an account? Register"
            : "Have an account? Login"}
        </p>
      </div>
    );
  }

  // --- DASHBOARD UI ---
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      {/* 1. Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ color: "#2c3e50", margin: 0 }}>
          🏥 Digital Health Wallet
        </h1>
        <div>
          <span>
            Welcome, <b>{username}</b> ({userRole}){" "}
          </span>
          <button
            onClick={handleLogout}
            style={{ padding: "5px 10px", cursor: "pointer" }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* 2. DATE FILTER SECTION (ADD THIS HERE) */}
      {/* Unified Search & Filter Bar */}
      <div
        style={{
          marginBottom: "20px",
          padding: "20px",
          backgroundColor: "#f1f2f6",
          borderRadius: "10px",
          display: "flex",
          gap: "15px",
          alignItems: "center",
          flexWrap: "wrap",
          border: "1px solid #dcdde1",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold" }}>
            Category
          </label>
          <input
            type="text"
            placeholder="e.g. Blood Test"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            style={{ padding: "5px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold" }}>From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: "12px", fontWeight: "bold" }}>To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          onClick={fetchReports}
          style={{
            marginTop: "15px",
            padding: "10px 25px",
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🔍 Search Reports
        </button>

        <button
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setCategorySearch("");
          }}
          style={{
            marginTop: "15px",
            padding: "10px",
            cursor: "pointer",
            background: "none",
            border: "none",
            color: "#7f8c8d",
          }}
        >
          Reset
        </button>
      </div>

      {/* 3. Upload Section: Only visible to Owners */}
      {userRole === "Owner" ? (
        <div
          style={{
            border: "2px solid #3498db",
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            marginBottom: "30px",
          }}
        >
          <h3>Upload New Health Report</h3>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: "10px" }}>
              <label>
                <b>Select Report: </b>
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <input
                type="text"
                placeholder="Report Type"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                required
              />
              <input
                type="date"
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Heart Rate (bpm)"
                onChange={(e) =>
                  setFormData({ ...formData, heartRate: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Sugar Level (mg/dL)"
                onChange={(e) =>
                  setFormData({ ...formData, sugar: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Blood Pressure (e.g., 120/80)"
                onChange={(e) =>
                  setFormData({ ...formData, bp: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Upload to Wallet
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#e8f4fd",
            borderRadius: "10px",
            marginBottom: "30px",
            border: "1px solid #3498db",
          }}
        >
          <p style={{ margin: 0 }}>
            ℹ️ <b>Viewer Mode:</b> You can view history and trends but do not
            have permission to upload new reports.
          </p>
        </div>
      )}

      {/* 4. Chart Section */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Health Vitals Trend</h3>
        <div
          style={{
            height: "300px",
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ddd",
          }}
        >
          <VitalsChart reports={reports} />
        </div>
      </div>

      {/* 5. History Table */}
      <div>
        <h3>Medical History & Files</h3>
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead style={{ backgroundColor: "#34495e", color: "white" }}>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Heart Rate</th>
              <th>Sugar</th>
              <th>Blood Pressure</th>
              <th>Report File</th>
              <th>Status / Actions</th> {/* Combined header */}
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? (
              reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.report_date}</td>
                  <td>{r.report_type}</td>
                  <td>{r.heart_rate} bpm</td>
                  <td>{r.sugar_level} mg/dL</td>
                  <td>{r.blood_pressure || "N/A"}</td>
                  <td>
                    <a
                      href={`http://localhost:5000/uploads/${r.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#2980b9", fontWeight: "bold" }}
                    >
                      View File
                    </a>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px", // Adds space between the buttons
                      }}
                    >
                      {r.is_owner === 1 ? (
                        <>
                          <button
                            onClick={() => handleShare(r.id)}
                            style={{
                              backgroundColor: "#9b59b6",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              padding: "8px 12px",
                            }}
                          >
                            Share
                          </button>
                        </>
                      ) : (
                        <span
                          style={{
                            color: "#27ae60",
                            fontWeight: "bold",
                            fontSize: "12px",
                            backgroundColor: "#eafaf1",
                            padding: "6px 12px",
                            borderRadius: "15px",
                            border: "1px solid #27ae60",
                          }}
                        >
                          👤 Shared with you
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
