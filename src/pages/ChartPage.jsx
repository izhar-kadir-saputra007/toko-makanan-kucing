import React, { useState, useCallback } from "react";
import { Container, Tabs, Tab } from "react-bootstrap"; 
import ChartContainer from "../components/ChartContainer.jsx";
import ChartKeluar from "../components/ChartKeluar.jsx";
import ChartCard from "../components/Chartcard.jsx";
import AdminLayout from "../components/AdminLayout.jsx";
import DataBarangPage from "./DataBarangPage.jsx";
import { RiLineChartLine, RiDatabase2Line } from "react-icons/ri";
import "./ChartPage.css"; // Buat file CSS untuk animasi tambahan

const BarangMasukChart = React.memo(({ activeTab }) => {
  return <ChartContainer activeTab={activeTab} />;
});

const BarangKeluarChart = React.memo(({ activeTab }) => {
  return <ChartKeluar activeTab={activeTab} />;
});

BarangMasukChart.displayName = "BarangMasukChart";
BarangKeluarChart.displayName = "BarangKeluarChart";

const ChartPage = () => {
  const [activeTabMasuk, setActiveTabMasuk] = useState("line");
  const [activeTabKeluar, setActiveTabKeluar] = useState("line");
  const [key, setKey] = useState("grafik"); // State untuk active tab

  const handleTabMasukChange = useCallback((tab) => {
    setActiveTabMasuk(tab);
  }, []);

  const handleTabKeluarChange = useCallback((tab) => {
    setActiveTabKeluar(tab);
  }, []);

  return (
    <AdminLayout>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          paddingTop: "100px",
          margin: 0,
          width: "90vw",
          transition: "width 0.3s ease, margin-left 0.3s ease",
        }}
      >
        <div
          className="main d-flex flex-column w-100 p-4 shadow bg-white"
          style={{
            borderRadius: "8px",
            paddingRight: "20px",
          }}
        >
          {/* Header dengan Tab Navigation - DIUBAH */}
          <div className="header p-3 d-flex flex-column border-bottom mb-3">
            <h2>Dashboard Inventori</h2>
            <Tabs
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="mt-3 custom-tabs"
            >
              <Tab
                eventKey="grafik"
                title={
                  <span className="d-flex align-items-center">
                    <RiLineChartLine className="me-2" size={20} />
                    Grafik Statistik
                  </span>
                }
              >
                <Container fluid className="py-4 animate__animated animate__fadeIn" 
                  style={{ paddingLeft: "0", paddingRight: "0" }}>
                  <div className="d-flex flex-wrap gap-4" style={{ justifyContent: "space-between" }}>
                    <div style={{ flex: "1 1 300px" }} className="mb-4">
                      <ChartCard
                        title="Barang Masuk"
                        activeTab={activeTabMasuk}
                        setActiveTab={handleTabMasukChange}
                        ChartComponent={BarangMasukChart}
                      />
                    </div>
                    <div style={{ flex: "1 1 300px" }} className="mb-4">
                      <ChartCard
                        title="Barang Keluar"
                        activeTab={activeTabKeluar}
                        setActiveTab={handleTabKeluarChange}
                        ChartComponent={BarangKeluarChart}
                      />
                    </div>
                  </div>
                </Container>
              </Tab>
              <Tab
                eventKey="data"
                title={
                  <span className="d-flex align-items-center">
                    <RiDatabase2Line className="me-2" size={20} />
                    Data Barang
                  </span>
                }
              >
                <div className="animate__animated animate__fadeIn">
                  <DataBarangPage />
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ChartPage;