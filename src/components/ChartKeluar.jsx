import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import { Spinner } from "react-bootstrap";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrasi komponen Chart.js yang diperlukan
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const  ChartKeluar = ({ activeTab }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("Token tidak ditemukan di localStorage!");
          return;
        }

        const response = await axios.get(
          "http://localhost:4000/api/getBarangKeluarByMonth",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const groupedData = response.data;
        const groupedByItemAndMonth = {};

        Object.keys(groupedData).forEach((month) => {
          groupedData[month].forEach((item) => {
            const itemName = item.nama_barang;

            if (!groupedByItemAndMonth[itemName]) {
              groupedByItemAndMonth[itemName] = {};
            }

            if (!groupedByItemAndMonth[itemName][month]) {
              groupedByItemAndMonth[itemName][month] = 0;
            }

            groupedByItemAndMonth[itemName][month] += parseInt(item.quantity);
          });
        });

        const labels = [];
        const datasets = [];
        const colors = [
          "rgba(76, 187, 23, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ];
        const borderColors = [
          "rgba(76, 187, 23, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ];

        Object.keys(groupedByItemAndMonth).forEach((itemName, index) => {
          const itemData = groupedByItemAndMonth[itemName];
          Object.keys(itemData).forEach((month) => {
            if (!labels.includes(month)) {
              labels.push(month);
            }
          });

          const data = labels.map((month) => itemData[month] || 0);

          datasets.push({
            label: itemName,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderColor: borderColors[index % borderColors.length],
            borderWidth: 2,
          });
        });

        setChartData({ labels, datasets });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Bulan",
        },
      },
      y: {
        title: {
          display: true,
          text: "Jumlah Barang",
        },
        beginAtZero: true,
      },
    },
  };

  if (!chartData) {
    return (
      <div className="text-center">
        <Spinner animation="border" role="status" className="mb-3" />
        <p>Loading chart...</p>
      </div>
    );
  }

  const renderChart = () => {
    // Gunakan timestamp untuk memastikan key selalu unik saat berganti tab
    const uniqueKey = `${activeTab}-${Date.now()}`;
    
    if (activeTab === "line") {
      return (
        <Line
          key={uniqueKey}
          data={chartData}
          options={chartOptions}
        />
      );
    } else if (activeTab === "bar") {
      return (
        <Bar
          key={uniqueKey}
          data={chartData}
          options={chartOptions}
        />
      );
    }
    return null;
  };

  return (
    <div style={{ height: "400px", width: "100%" }}>
      {renderChart()}
    </div>
  );
};

export default ChartKeluar;