import { useState } from "react";
import axios from "axios";
import registerImage from "../assets/images/registerImage.png";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function RegisterPage() {
  // State untuk menyimpan data input form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Menyimpan pesan error
  const [isLoading, setIsLoading] = useState(false); // Menyimpan status loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi jika password dan konfirmasi password tidak cocok
    if (password !== confPassword) {
      setErrorMessage("Password dan konfirmasi password tidak cocok");
      return;
    }

    // Validasi jika email dan nama kosong
    if (!name || !email || !password) {
      setErrorMessage("Semua kolom harus diisi");
      return;
    }

    // Set loading state ke true
    setIsLoading(true);

    try {
      // Kirim data form ke backend menggunakan axios
      const response = await axios.post("http://localhost:4000/api/register", {
        name,
        email,
        password,
        confPassword,
      });

      // Jika registrasi sukses, tampilkan pesan menggunakan SweetAlert2
      Swal.fire({
        title: "Registrasi Berhasil!",
        text: response.data.msg,
        icon: "success",
        confirmButtonText: "Ok",
      }).then(() => {
        // Redirect ke halaman login setelah sukses
        navigate("/login");
      });
    } catch (error) {
      // Tangani jika terjadi error menggunakan SweetAlert2
      Swal.fire({
        title: "Terjadi Kesalahan",
        text: error.response ? error.response.data.msg : "Terjadi kesalahan",
        icon: "error",
        confirmButtonText: "Tutup",
      });
      // Tangani error dan tampilkan pesan
      setErrorMessage(error.response ? error.response.data.msg : "Terjadi kesalahan");
    } finally {
      // Set loading state ke false setelah proses selesai
      setIsLoading(false);
    }
  };

  return (
    <div
      className="container vh-100 d-flex align-items-center justify-content-center"
      style={{ maxWidth: "900px" }}
    >
      <div className="row w-100 shadow-lg p-4 bg-white rounded">
        {/* Form Area */}
        <div className="col-md-6 d-flex flex-column justify-content-center">
          <h2 className="text-center fw-bold fs-2">Register</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="form-control"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                placeholder="Confirm your password"
                value={confPassword}
                onChange={(e) => setConfPassword(e.target.value)}
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
              className="btn-primary-color w-50 d-flex justify-content-center mx-auto"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="pt-5">
            Already have an account? <NavLink to="/login">Login</NavLink>
          </p>
        </div>

        {/* Image Area */}
        <div className="col-md-6 d-none d-md-block pt-4 rounded">
          <img
            src={registerImage}
            alt="Register Illustration"
            className="img-fluid rounded"
            style={{ objectFit: "cover", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
