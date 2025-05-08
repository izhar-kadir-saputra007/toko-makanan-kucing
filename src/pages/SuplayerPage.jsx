import AdminLayout from "../components/AdminLayout";
import { useState, useEffect } from "react";
import { Table, Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2

const SuplayerPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    id: null, // Tambahkan ID untuk mendukung edit
    name: "",
    alamat: "",
    kontak: "",
  });
  const [isEditing, setIsEditing] = useState(false); // State untuk mengetahui apakah dalam mode edit
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("accessToken");

  const handleModalOpen = () => {
    setFormData({ id: null, name: "", alamat: "", kontak: "" }); // Reset form
    setIsEditing(false); // Pastikan bukan mode edit
    setShowModal(true);
  };
  const handleModalClose = () => setShowModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/getSuppliers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuppliers(response.data.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      Swal.fire("Gagal!", "Gagal mengambil data supplier.", "error");
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [token]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing
        ? `http://localhost:4000/api/updateSupplierById/${formData.id}`
        : "http://localhost:4000/api/registersupplier";
      const method = isEditing ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (isEditing) {
        // Update supplier di state
        setSuppliers((prev) =>
          prev.map((supplier) =>
            supplier.id === formData.id ? response.data.data : supplier
          )
        );
        Swal.fire("Berhasil!", "Supplier berhasil diperbarui.", "success");
      } else {
        // Tambahkan supplier baru ke state
        setSuppliers((prev) => [...prev, response.data.data]);
        Swal.fire("Berhasil!", "Supplier berhasil ditambahkan.", "success");
      }
      handleModalClose();
      fetchSuppliers();
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire("Gagal!", "Gagal menyimpan supplier.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setFormData(supplier); // Isi form dengan data supplier yang akan diedit
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Anda yakin?",
      text: "Supplier akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:4000/api/deleteSupplierById/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSuppliers((prev) => prev.filter((supplier) => supplier.id !== id));
          Swal.fire("Berhasil!", "Supplier berhasil dihapus.", "success");
          fetchSuppliers();
        } catch (error) {
          console.error("Error deleting supplier:", error);
          Swal.fire("Gagal!", "Gagal menghapus supplier.", "error");
        }
      }
    });
  };

  return (
    <>
      <AdminLayout>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            paddingTop: "100px",
            margin: "0",
            width: "93vw",
          }}
        >
          <div
            className="d-flex flex-column p-4 shadow bg-white"
            style={{
              minWidth: "100%",
            }}
          >
            <div className="d-flex flex-column rounded bg-white p-4 shadow-lg m-2">
              <div
                className="header p-2 d-flex flex-row justify-content-between border-bottom border-secondary mb-2"
                style={{
                  width: "95%",
                  margin: "0 auto",
                }}
              >
                <h2>Data Supplier</h2>
                <button
                  className="btn btn-primary-color"
                  onClick={handleModalOpen}
                >
                  <i className="ri-file-add-fill"> Tambah Supplier</i>
                </button>
              </div>
              <div
                className="konten pt-4"
                style={{ width: "95%", margin: "0 auto" }}
              >
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nama</th>
                      <th>Alamat</th>
                      <th>Kontak</th>
                      <th
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier, index) => (
                      <tr key={supplier.id}>
                        <td>{index + 1}</td>
                        <td>{supplier.name}</td>
                        <td>{supplier.alamat}</td>
                        <td>{supplier.kontak}</td>
                        <td>
                          <i
                            className="aksi-delete ri-delete-bin-6-line btn btn-link"
                            style={{ fontSize: "25px" }} 
                            onClick={() => handleDelete(supplier.id)}
                          ></i>
                          <i
                            className="aksi ri-edit-fill btn btn-link"
                            style={{ fontSize: "25px" }} 
                            onClick={() => handleEdit(supplier)}
                          ></i>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>

      <Modal className="custom-modal p-5" show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Supplier" : "Tambah Supplier"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body p-5 text-2xl">
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nama Supplier</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama supplier"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Alamat Supplier</Form.Label>
              <Form.Control
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                placeholder="Masukkan alamat supplier"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Kontak Supplier</Form.Label>
              <Form.Control
                type="text"
                name="kontak"
                value={formData.kontak}
                onChange={handleInputChange}
                placeholder="Masukkan kontak supplier"
                required
              />
            </Form.Group>
            <Button className="btn btn-primary-color mt-3" variant="primary" type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="" variant="secondary" onClick={handleModalClose}>
            Batal
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SuplayerPage;
