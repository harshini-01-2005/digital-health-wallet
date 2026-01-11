import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function VitalsChart({ reports }) {
  const data = {
    labels: reports.map(r => r.report_date),
    datasets: [
      { label: 'Heart Rate', data: reports.map(r => r.heart_rate), borderColor: 'red' },
      { label: 'Sugar Level', data: reports.map(r => r.sugar_level), borderColor: 'blue' }
    ]
  };
  return <Line data={data} />;
}