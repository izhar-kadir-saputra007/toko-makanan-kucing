import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 

function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // State untuk kontrol sidebar
  const navigate = useNavigate(); // Hook untuk melakukan redirect setelah logout

  // Fungsi untuk logout
  const handleLogout = async () => {
    try {
      // Menampilkan SweetAlert untuk konfirmasi logout
      const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: 'Anda akan keluar dari akun ini!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Logout',
        cancelButtonText: 'Batal',
      });

      // Jika user menekan tombol "Logout", lanjutkan dengan logout
      if (result.isConfirmed) {
        // Menghapus accessToken dari localStorage
        localStorage.removeItem("accessToken");

        // Mengirimkan request ke API logout untuk menghapus refreshToken
        const response = await axios.delete("http://localhost:4000/api/logout", {}, {
          withCredentials: true, // Mengirimkan cookie dengan request
        });

        if (response.status === 204) {
          // Jika logout berhasil, redirect ke halaman login
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Gagal logout:", error);
      alert("Terjadi kesalahan saat logout");
    }
  };

  // Fungsi untuk toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen); // Toggle state sidebar
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div
        className={`sidebar sidebar-shadow text-white p-4 vh-100 pt-5 mt-5 ${isSidebarOpen ? "d-block" : "d-none"}`}
        style={{
          width: isSidebarOpen ? "200px" : "0",
          height: "100vh",
          position: "fixed",
          top: "44px",
          transition: "width 0.5s ease, opacity 0.5s ease",
          opacity: isSidebarOpen ? "1" : "0",
        }}
      >
        <div>
          <h4 className="text-center mb-4 border-bottom p-2">Admin Dashboard</h4>
          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "bg-secondary text-light" : ""}`
                }
                to="/chart"
              >
                Dashboard
              </NavLink>
            </li>
            {/* <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "bg-secondary text-light" : ""}`
                }
                to="/databarang"
              >
                Data Barang
              </NavLink>
            </li> */}
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "bg-secondary text-light" : ""}`
                }
                to="/admindashboard"
              >
                Barang Masuk
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "bg-secondary text-light" : ""}`
                }
                to="/barangkeluar"
              >
                Barang Keluar
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "bg-secondary text-light" : ""}`
                }
                to="/dataEoq"
              >
                Data EOQ
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "bg-secondary text-light" : ""}`
                }
                to="/suplayer"
              >
                Suplayer
              </NavLink>
            </li>
            <li className="nav-item mb-5">
              <NavLink
                className={({ isActive }) =>
                  `nav-link text-white ${isActive ? "bg-secondary text-light" : ""}`
                }
                to="/user"
              >
                Users
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Logout button */}
        <div className="border-top pt-3">
          <button className="btn btn-danger w-100" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="ms-250"
        style={{
          marginLeft: isSidebarOpen ? "200px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top p-4 shadow-lg mb-5">
          <div className="container-fluid">
            {/* Tombol Toggle Sidebar */}
            <button
              className="btn btn-outline-secondary"
              onClick={toggleSidebar}
              style={{
                marginRight: "10px",
                border: "none",
                background: "transparent",
                color: "black",
                fontSize: "24px",
              }}
            >
              <i className={isSidebarOpen ? "fas fa-times" : "fas fa-bars"}></i>
            </button>
            <a className="navbar-brand" href="#">
              Admin Panel
            </a>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link active" href="#">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Profile
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Notifications
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Children */}
        <main>{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
