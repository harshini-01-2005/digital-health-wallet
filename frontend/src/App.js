import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VitalsChart from './VitalsChart';

function App() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ type: '', date: '', heartRate: '', sugar: '' });

  // 1. Fetch data from the backend
  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reports');
      setReports(res.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => { 
    fetchReports(); 
  }, []);

  // 2. Handle the file and data upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    // Creating FormData object to send file + text
    const data = new FormData();
    data.append('report', file); // Matches upload.single('report') in backend
    data.append('type', formData.type);
    data.append('date', formData.date);
    data.append('heartRate', formData.heartRate);
    data.append('sugar', formData.sugar);

    try {
      await axios.post('http://localhost:5000/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' } // Crucial for file transfer
      });
      alert("Report Saved Successfully!");
      setFile(null); // Clear file input
      fetchReports(); // Refresh the list and chart
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Failed to upload. Make sure backend is running on port 5000!");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>🏥 Digital Health Wallet</h1>
      
      {/* Upload Section */}
      <div style={{ border: '2px solid #3498db', padding: '20px', borderRadius: '10px', backgroundColor: '#f9f9f9', marginBottom: '30px' }}>
        <h3>Upload New Health Report</h3>
        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '10px' }}>
            <label><b>Select Report (.txt/image): </b></label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input type="text" placeholder="Report Type (e.g. Sugar Test)" 
              onChange={(e) => setFormData({...formData, type: e.target.value})} required />
            <input type="date" onChange={(e) => setFormData({...formData, date: e.target.value})} required />
            <input type="number" placeholder="Heart Rate (bpm)" 
              onChange={(e) => setFormData({...formData, heartRate: e.target.value})} required />
            <input type="number" placeholder="Sugar Level (mg/dL)" 
              onChange={(e) => setFormData({...formData, sugar: e.target.value})} required />
          </div>
          
          <button type="submit" style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
            Upload to Wallet
          </button>
        </form>
      </div>

      {/* Chart Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3>Health Vitals Trend</h3>
        <div style={{ height: '300px', backgroundColor: '#fff', padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }}>
          <VitalsChart reports={reports} />
        </div>
      </div>

      {/* History Table */}
      <div>
        <h3>Medical History & Files</h3>
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#34495e', color: 'white' }}>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Heart Rate</th>
              <th>Sugar</th>
              <th>Report File</th>
            </tr>
          </thead>
          <tbody>
            {reports.length > 0 ? reports.map((r) => (
              <tr key={r.id}>
                <td>{r.report_date}</td>
                <td>{r.report_type}</td>
                <td>{r.heart_rate} bpm</td>
                <td>{r.sugar_level} mg/dL</td>
                <td>
                  <a 
                    href={`http://localhost:5000/uploads/${r.file_path}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: '#2980b9', fontWeight: 'bold' }}
                  >
                    View File
                  </a>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No reports uploaded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;