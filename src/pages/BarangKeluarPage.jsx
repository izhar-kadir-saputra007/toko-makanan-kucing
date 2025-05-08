import AdminLayout from "../components/AdminLayout.jsx";
import Pagination from "../components/Pagination.jsx";
import { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Button,
  Form,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

function BarangKeluarPage() {
  const [showModal, setShowModal] = useState(false);
  const [barangKeluar, setBarangKeluar] = useState([]);
  const [filteredBarangKeluar, setFilteredBarangKeluar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [formData, setFormData] = useState({
    penginput: "",
    nama_barang: "",
    barang_id: "", // Tambahkan ini untuk menyimpan ID barang
    quantity: "",
    sale_price: "",
    sale_date: "",
  });
  const [currentId, setCurrentId] = useState(null); // Menyimpan ID barang keluar yang sedang diedit
  const [barangList, setBarangList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0); // State untuk halaman aktif
  const [showAll, setShowAll] = useState(false); // State untuk melihat semua data
  const itemsPerPage = 10; // Jumlah item per halaman

  // Hitung jumlah halaman
  const pageCount = Math.ceil(filteredBarangKeluar.length / itemsPerPage);

  // Filter data berdasarkan halaman saat ini atau tampilkan semua data
  const currentItems = showAll
    ? filteredBarangKeluar // Jika lihat semua, tampilkan semua barang keluar
    : filteredBarangKeluar.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
      );

  // Fungsi untuk mengubah halaman
  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
  };

  // Fungsi untuk melihat semua data
  const handleSeeAllClick = () => {
    setShowAll((prevShowAll) => !prevShowAll); // Toggle antara lihat semua dan paginasi
    setCurrentPage(0); // Reset ke halaman pertama ketika melihat semua data
  };

  const API_BASE_URL = "http://localhost:4000/api";

  const getToken = () => {
    return localStorage.getItem("accessToken");
  };

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
  const fetchBarangKeluar = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/getAllBarangKeluar`,
        axiosConfig
      );
      setBarangKeluar(response.data);
      setFilteredBarangKeluar(response.data); // Set filtered data sama seperti original data
      console.log("Data barang keluar:", response.data);
    } catch (error) {
      alert("Gagal memuat data barang keluar", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBarangList = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/getAllBarang`,
        axiosConfig
      );
      setBarangList(response.data.data);
    } catch (error) {
      alert("Gagal memuat data barang", error);
    }
  };

  useEffect(() => {
    fetchBarangKeluar();
    fetchBarangList();
  }, []);

  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      nama_barang: "",
      quantity: "",
      sale_price: "",
      sale_date: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nama_barang") {
      // Cari barang yang dipilih dari barangList
      const selectedBarang = barangList.find((barang) => barang.name === value);

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        barang_id: selectedBarang?.id || "",
        sale_price: selectedBarang?.harga_jual || "", // Auto-fill harga jual
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setFilterKeyword(keyword);

    const filteredData = barangKeluar.filter((item) => {
      // Konversi sale_date dari format DD-MM-YYYY ke Date object
      const [day, month, year] = item.sale_date.split("-");
      const itemDate = new Date(`${year}-${month}-${day}`);

      // Format tanggal ke bentuk "02 Maret 2025"
      const formattedDate = itemDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      // Filter berdasarkan kata kunci dan tanggal lengkap
      const matchesKeyword =
        item.user.toLowerCase().includes(keyword) || // Filter berdasarkan nama penginput
        item.nama_barang.toLowerCase().includes(keyword) || // Filter berdasarkan nama barang
        item.sale_price.toString().includes(keyword) || // Filter berdasarkan harga jual
        formattedDate.toLowerCase().includes(keyword) || // Filter berdasarkan tanggal yang diformat
        item.quantity.toString().includes(keyword); // Filter berdasarkan kuantitas

      return matchesKeyword;
    });

    setFilteredBarangKeluar(filteredData);
  };
  const handleEditBarangKeluar = (id) => {
    const itemToEdit = barangKeluar.find((item) => item.id === id);
    if (itemToEdit) {
      setFormData({
        nama_barang: itemToEdit.nama_barang,
        quantity: itemToEdit.quantity,
        sale_price: itemToEdit.sale_price,
        sale_date: itemToEdit.sale_date,
        barang_id: itemToEdit.barang_id || "", // Tambahkan ini
      });
      setCurrentId(id);
      setShowModal(true);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.nama_barang,
      barang_id: formData.barang_id, // Kirim ID barang
      quantity: formData.quantity,
      sale_price: formData.sale_price,
      sale_date: formData.sale_date,
    };

    try {
      setLoading(true);
      let response;

      if (currentId) {
        // Jika ada currentId, lakukan update
        response = await axios.put(
          `${API_BASE_URL}/updateBarangKeluar/${currentId}`,
          payload,
          axiosConfig
        );
        Swal.fire({
          icon: "success",
          title: "Barang keluar berhasil diperbarui!",
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
        // Update data barang keluar di state setelah update
        setBarangKeluar((prev) =>
          prev.map((item) =>
            item.id === currentId ? { ...item, ...payload } : item
          )
        );
        setFilteredBarangKeluar((prev) =>
          prev.map((item) =>
            item.id === currentId ? { ...item, ...payload } : item
          )
        );
      } else {
        // Jika tidak ada currentId, lakukan tambah data
        response = await axios.post(
          `${API_BASE_URL}/addBarangKeluar`,
          payload,
          axiosConfig
        );
        Swal.fire({
          icon: "success",
          title: "Barang berhasil ditambahkan!",
          text: response.data.message,
          showConfirmButton: false,
          timer: 1500,
        });
        setBarangKeluar((prev) => [...prev, response.data.data]);
        setFilteredBarangKeluar((prev) => [...prev, response.data.data]);
      }

      //liahat data sebelum di kirim
      console.log("Data yang dikirim:", payload);
      console.log("Response dari server:", response.data);

      fetchBarangKeluar(); // Ambil data terbaru
      handleModalClose(); // Tutup modal
    } catch (error) {
      alert(
        "Gagal menyimpan barang keluar: " +
          (error.response ? error.response.data.message : error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/downloadBarangKeluar`,
        axiosConfig,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "barang_keluar_report.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert("Gagal mengunduh laporan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBarangKeluar = async (id) => {
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
          await axios.delete(
            `${API_BASE_URL}/deleteBarangKeluar/${id}`,
            axiosConfig
          );
          Swal.fire("Berhasil", "Barang keluar berhasil dihapus.", "success");
          fetchBarangKeluar(); // Refresh data
        } catch (error) {
          Swal.fire(
            "Error",
            error.response?.data.message || "Gagal menghapus barang keluar.",
            "error"
          );
          console.error("Error deleting barang keluar:", error);
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
            width: "90vw",
          }}
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
                <h2>Barang Keluar</h2>
                <div className="d-flex flex-row gap-3">
                  <button
                    className="btn btn-primary-color-icon"
                    onClick={handleDownloadReport}
                  >
                    <i className="ri-file-download-line">unduh</i>
                  </button>
                  <button
                    className="btn btn-primary-color"
                    onClick={handleModalOpen}
                  >
                    <i className="ri-file-add-fill"> barang keluar</i>
                  </button>
                </div>
              </div>
              <div
                className="header d-flex flex-row justify-content-between mb-2"
                style={{ width: "95%", margin: "0 auto" }}
              >
                {/* Filter Input */}
                <div className="mb-3">
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search-heart"></i>
                    </InputGroup.Text>
                    <FormControl
                      type="text"
                      placeholder="Cari..."
                      value={filterKeyword}
                      onChange={handleFilterChange}
                    />
                  </InputGroup>
                </div>
                <div className="text-end">
                  <button
                    className={`btn mb-3 ${
                      showAll ? "btn-success" : "btn btn-primary-color-icon"
                    }`} // Ganti warna jika showAll aktif
                    onClick={handleSeeAllClick}
                  >
                    {showAll ? "Tampilkan Paginasi" : "Lihat Semua"}
                  </button>
                </div>
              </div>

              <div
                className="konten"
                style={{ width: "95%", margin: "0 auto" }}
              >
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Penginput</th>
                      <th>Nama Barang</th>
                      <th>Kuantiti/sak</th>
                      <th>Harga Jual</th>
                      <th>Tanggal Keluar</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => {
                      // Konversi sale_date ke format yang benar
                      const [day, month, year] = item.sale_date.split("-");
                      const itemDate = new Date(`${year}-${month}-${day}`);
                      const formattedDate = itemDate.toLocaleDateString(
                        "id-ID",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      );

                      return (
                        <tr key={item.id}>
                          <td>{currentPage * itemsPerPage + index + 1}</td>
                          <td>{item.user}</td>
                          <td>{item.nama_barang}</td>
                          <td>{item.quantity} sak</td>
                          <td>
                            Rp {parseInt(item.sale_price || 0).toLocaleString()}
                          </td>
                          <td>{formattedDate}</td>
                          <td className="d-flex gap-2 text-2xl">
                            <div>
                              <i
                                className="aksi-delete ri-delete-bin-6-line btn btn-link"
                                style={{ fontSize: "25px" }}
                                onClick={() =>
                                  handleDeleteBarangKeluar(item.id)
                                }
                              ></i>
                            </div>
                            <div
                              style={{ fontSize: "25px" }}
                              onClick={() => handleEditBarangKeluar(item.id)}
                            >
                              <i className="aksi ri-edit-fill"></i>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                {/* Menggunakan Komponen Pagination */}
                {!showAll && (
                  <Pagination
                    pageCount={pageCount}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>

      <Modal
        className="custom-modal p-5"
        show={showModal}
        onHide={handleModalClose}
      >
        <Modal.Header className="bg-p-4" closeButton>
          <Modal.Title>Tambah Barang Keluar</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body p-5 text-2xl">
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3" controlId="formNamaBarang">
              <Form.Label>Nama Barang</Form.Label>
              <Form.Control
                as="select"
                name="nama_barang"
                value={formData.nama_barang}
                onChange={handleInputChange}
                required
                className="rounded-pill"
              >
                <option value="">Pilih Nama Barang</option>
                {barangList.map((barang) => (
                  <option key={barang.id} value={barang.name}>
                    {barang.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formJumlahBarang">
              <Form.Label>Jumlah Barang</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Masukkan jumlah barang"
                required
                className="rounded-pill"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formHargaBarang">
              <Form.Label>Harga Jual</Form.Label>
              <Form.Control
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleInputChange}
                placeholder="Masukkan harga jual"
                required
                className="rounded-pill"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTanggalBarang">
              <Form.Label>Tanggal Barang</Form.Label>
              <Form.Control
                type="date"
                name="sale_date"
                value={formData.sale_date}
                onChange={handleInputChange}
                placeholder="Pilih tanggal barang"
                className="rounded-pill"
              />
            </Form.Group>
            <Button
              className="btn btn-primary-color mt-3"
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="btn danger"
            variant="danger"
            onClick={handleModalClose}
          >
            Batal
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BarangKeluarPage;
