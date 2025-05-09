import { useState } from "react";
import axios from "axios";
import registerImage from "../assets/images/registerImage.png";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function LoginPage() {
  // State untuk menyimpan data input form dan error
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Menyimpan pesan error
  const [isLoading, setIsLoading] = useState(false); // Menyimpan status loading
  const navigate = useNavigate();

  // Handle submit form login
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi jika email atau password kosong
    if (!email || !password) {
      setErrorMessage("Email dan password harus diisi");
      return;
    }

    // Set loading state ke true
    setIsLoading(true);

    try {
      // Kirim data form ke backend menggunakan axios
      const response = await axios.post("http://localhost:4000/api/login", {
        email,
        password,
      });

      // Jika login berhasil, tampilkan pesan sukses
      Swal.fire({
        title: "Login Berhasil!",
        html: `Selamat datang <strong>${response.data.name}</strong>`, 
        icon: "success",
        confirmButtonText: "Ok",
      }).then(() => {
        // Redirect ke halaman dashboard setelah login sukses
        navigate("/chart");
      });

      // Simpan access token di localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("name", response.data.name);
    } catch (error) {
      // Tangani error jika login gagal
      Swal.fire({
        title: "Login Gagal",
        text: error.response ? error.response.data.msg : "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "Tutup",
      });
      setErrorMessage(error.response ? error.response.data.msg : "Terjadi kesalahan");
    } finally {
      // Set loading state ke false setelah proses selesai
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container vh-100 d-flex align-items-center justify-content-center"
      style={{ maxWidth: '900px' }}
    >
      <div className="row w-100 shadow-lg p-4 bg-white rounded">
        {/* Image Area */}
        <div className="col-md-6 d-none d-md-block pt-4 rounded">
          <img
            src={registerImage}
            alt="Register Illustration"
            className="img-fluid rounded"
            style={{ objectFit: 'cover', height: '100%' }}
          />
        </div>

        {/* Form Area */}
        <div className="col-md-6 d-flex flex-column justify-content-center">
          <h2 className="text-center fs-1 fw-bold">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Menampilkan pesan error jika ada */}
            {errorMessage && (
              <div className="alert alert-danger" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary-color w-50 d-flex justify-content-center mx-auto"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <p className="pt-5">
            Don't have an account? <NavLink to="/register">Register</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
