import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { Table, Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

const EditUserPage = () => {
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const [users, setUsers] = useState([]); // State untuk menyimpan data pengguna
  const [selectedUser, setSelectedUser] = useState(null); // State untuk pengguna yang dipilih
  const [loading, setLoading] = useState(false); // State untuk loading
  const [isEdit, setIsEdit] = useState(false); // State untuk membedakan tambah/edit pengguna

  // Fungsi untuk membuka modal tambah/edit pengguna
  const handleModalOpen = (user = null) => {
    setSelectedUser(user || {}); // Jika user null, inisialisasi objek kosong
    setIsEdit(!!user); // Tentukan apakah ini edit atau tambah pengguna
    setShowModal(true); // Buka modal
  };

  // Fungsi untuk menutup semua modal
  const handleModalClose = () => {
    setSelectedUser(null); // Reset user yang dipilih
    setShowModal(false); // Tutup modal
  };

  // Fetch data pengguna dari server
  const fetchDataUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("Token tidak ditemukan");
        return;
      }

      const response = await axios.get(
        "http://localhost:4000/api/getAllUsers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(response.data.data); // Simpan data pengguna
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Submit data pengguna (tambah/edit)
  const handleSubmitUser = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token tidak ditemukan");
        return;
      }

      // Tentukan apakah ini create atau update
      const url = isEdit
        ? `http://localhost:4000/api/updateUser/${selectedUser.id}`
        : `http://localhost:4000/api/createUser`;

      const method = isEdit ? "put" : "post";

      // Data yang akan dikirim
      const data = { ...selectedUser };

      // Jika tambah pengguna, sertakan `confPassword`
      if (!isEdit) {
        if (!data.password || data.password !== data.confPassword) {
          Swal.fire({
            icon: "error",
            title: "Kesalahan Validasi",
            text: "Password dan konfirmasi password tidak sesuai.",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }
      } else {
        // Jika edit pengguna, hapus field password agar tidak dikirim
        delete data.password;
        delete data.confPassword;
      }

      const response = await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });

      // Tampilkan SweetAlert sukses
      Swal.fire({
        icon: "success",
        title: isEdit
          ? "Pengguna berhasil diperbarui!"
          : "Pengguna baru berhasil ditambahkan!",
        text: response.data.msg,
        showConfirmButton: false,
        timer: 1500,
      });

      fetchDataUsers(); // Refresh data pengguna
      handleModalClose(); // Tutup modal
    } catch (error) {
      console.error("Error submitting user:", error);

      // Tampilkan SweetAlert error
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan!",
        text: "Gagal menyimpan data pengguna. Silakan coba lagi.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  // Menghandle perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({ ...prev, [name]: value }));
  };

  // Menghapus pengguna dengan konfirmasi SweetAlert
  const handleDeleteUser = async (id) => {
    Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data ini akan dihapus dan tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("accessToken");
          if (!token) {
            console.error("Token tidak ditemukan");
            return;
          }

          const response = await axios.delete(
            `http://localhost:4000/api/deleteUser/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          Swal.fire({
            icon: "success",
            title: "Pengguna berhasil dihapus!",
            text: response.data.msg,
            showConfirmButton: false,
            timer: 1500,
          });

          fetchDataUsers(); // Refresh data pengguna
        } catch (error) {
          console.error("Error deleting user:", error);

          Swal.fire({
            icon: "error",
            title: "Terjadi kesalahan!",
            text: "Gagal menghapus data pengguna. Silakan coba lagi.",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      }
    });
  };

  useEffect(() => {
    fetchDataUsers();
  }, []);

  return (
    <AdminLayout>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ paddingTop: "100px", margin: "0", width: "92vw" }}
      >
        <div
          className="d-flex flex-column p-4 shadow bg-white"
          style={{ minWidth: "100%" }}
        >
          <div className="d-flex flex-column rounded bg-white p-4 shadow-lg m-2">
            <div
              className="header p-2 d-flex flex-row justify-content-between border-bottom border-secondary mb-2"
              style={{ width: "95%", margin: "0 auto" }}
            >
              <h2>Data Pengguna</h2>
              <button
                className="btn btn-primary-color"
                onClick={() => handleModalOpen()}
              >
                <i className="ri-file-add-fill"> Tambah Pengguna</i>
              </button>
            </div>

            <div
              className="konten pt-4"
              style={{ width: "95%", margin: "0 auto" }}
            >
              {loading ? (
                <p>Loading...</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nama Pengguna</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <div className="d-flex flex-row gap-4">
                            <button
                              className="btn btn-warning"
                              onClick={() => handleModalOpen(user)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Pengguna */}
      <Modal
        className="custom-modal p-5"
        show={showModal}
        onHide={handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body p-5 text-2xl">
          <Form onSubmit={handleSubmitUser}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Pengguna</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={selectedUser?.name || ""}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={selectedUser?.email || ""}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {!isEdit && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={selectedUser?.password || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Konfirmasi Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confPassword"
                    value={selectedUser?.confPassword || ""}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={selectedUser?.role || ""}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>
                  Pilih Role
                </option>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </Form.Select>
            </Form.Group>

            <Button className="btn btn-primary-color mt-3" variant="primary" type="submit">
              Simpan
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleModalClose}>
            Batal
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default EditUserPage;
