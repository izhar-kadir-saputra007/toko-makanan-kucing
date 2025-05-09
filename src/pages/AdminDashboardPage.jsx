import AdminLayout from "../components/AdminLayout";
import Pagination from "../components/Pagination.jsx";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Table,
  Modal,
  Button,
  Form,
  Spinner,
  Alert,
  InputGroup,
  FormControl,
} from "react-bootstrap";

function AdminDashboardPage() {
  const [barangMasuk, setBarangMasuk] = useState([]); // State untuk data barang masuk
  const [loading, setLoading] = useState(true); // Status loading untuk fetch data
  const [error, setError] = useState(null); // State untuk menangani error
  const [showModal, setShowModal] = useState(false); // State modal
  const [barangOptions, setBarangOptions] = useState([]); // State untuk opsi barang
  const [supplierOptions, setSupplierOptions] = useState([]); // State untuk opsi supplier
  const [filterKeyword, setFilterKeyword] = useState(""); // State untuk filter keyword
  const [formData, setFormData] = useState({
    supplier_name: "",
    name: "",
    quantity: "",
    purchase_price: "",
    received_date: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [barangData, setBarangData] = useState([]);

  const API_BASE_URL = "http://localhost:4000/api"; // Base URL API
  const token = localStorage.getItem("accessToken"); // Ambil token dari localStorage

  // Fungsi untuk mengunduh laporan barang masuk
  const handleDownloadReport = async () => {
    try {
      if (!token) {
        alert("Token tidak ditemukan. Anda perlu login terlebih dahulu.");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/downloadBarangMasukReportByMonth`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", // File PDF
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "laporan_barang_masuk.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Gagal mengunduh laporan:", error);
      alert("Gagal mengunduh laporan. Silakan coba lagi.");
    }
  };

  const fetchBarangMasuk = async () => {
    try {
      setLoading(true);
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/getBarangMasuk`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBarangMasuk(response.data);
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching barang masuk:", err);
      setError("Gagal memuat data barang masuk.");
    } finally {
      setLoading(false);
    }
  };

  // Ambil data barang masuk dari API
  useEffect(() => {
    fetchBarangMasuk();
  }, []);

  // Fetch opsi barang dan supplier
 // Modifikasi fetchOptions untuk menyimpan data barang lengkap
useEffect(() => {
  const fetchOptions = async () => {
    try {
      if (!token) {
        setError("Token tidak ditemukan di localStorage!");
        return;
      }

      const [supplierResponse, barangResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/getSuppliers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/getAllBarang`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSupplierOptions(
        supplierResponse.data.data.map((supplier) => supplier.name)
      );
      
      // Simpan data barang lengkap
      setBarangData(barangResponse.data.data);
      
      // Buat opsi nama barang
      setBarangOptions(barangResponse.data.data.map((item) => item.name));
    } catch (error) {
      console.error("Error fetching options:", error);
      setError("Gagal memuat opsi barang dan supplier.");
    }
  };

  fetchOptions();
}, [token]);

// Fungsi untuk mengupdate harga beli saat barang dipilih
const handleBarangChange = (e) => {
  const selectedBarangName = e.target.value;
  const selectedBarang = barangData.find(item => item.name === selectedBarangName);
  
  setFormData(prev => ({
    ...prev,
    name: selectedBarangName,
    purchase_price: selectedBarang ? selectedBarang.unit_price : "" // Ambil harga_jual bukan unit_price
  }));
};

  // Handle perubahan pada input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditBarangMasuk = async (id) => {
    try {
      const barangMasukItem = barangMasuk.find((item) => item.id === id);
  
      if (!barangMasukItem) {
        alert("Data barang masuk tidak ditemukan.");
        return;
      }
  
      // Cari data barang lengkap untuk mendapatkan harga_jual
      const barangInfo = barangData.find(item => item.name === barangMasukItem.name);
  
      setFormData({
        supplier_name: barangMasukItem.supplier_name,
        name: barangMasukItem.name,
        quantity: barangMasukItem.quantity,
        purchase_price: barangInfo?.unit_price || barangMasukItem.purchase_price, // Prioritaskan harga_jual
        received_date: barangMasukItem.received_date,
      });
  
      setShowModal(true);
      setIsEditMode(id);
    } catch (error) {
      console.error("Error fetching barang masuk for edit:", error);
      alert("Terjadi kesalahan saat memuat data untuk diedit.");
    }
  };

  // Fungsi untuk submit data form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.supplier_name ||
      !formData.name ||
      !formData.quantity ||
      !formData.purchase_price
    ) {
      alert("Semua kolom harus diisi!");
      return; // Hentikan proses jika validasi gagal
    }

    try {
      setLoading(true); // Mulai loading

      // Konversi nilai input
      const payload = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        purchase_price: Number(formData.purchase_price) || 0,
      };

      let response;
      if (isEditMode) {
        // Update barang masuk
        response = await axios.put(
          `${API_BASE_URL}/updateBarangMasuk/${isEditMode}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Perbarui data di state
        setBarangMasuk((prev) =>
          prev.map((item) =>
            item.id === isEditMode ? { ...item, ...payload } : item
          )
        );
      } else {
        // Tambah barang masuk baru
        response = await axios.post(`${API_BASE_URL}/barangmasuk`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Tambahkan data baru ke state
        setBarangMasuk((prev) => [
          ...prev,
          { ...payload, id: response.data.id },
        ]);
      }

      Swal.fire({
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        title: isEditMode
          ? "Barang masuk berhasil diperbarui."
          : "Barang masuk berhasil ditambahkan.",
        text: response.data.message || "Barang masuk berhasil disimpan.",
      });
      fetchBarangMasuk();
      handleModalClose(); // Tutup modal setelah berhasil
    } catch (err) {
      console.error("Error saving barang masuk:", err);
      alert(
        "Terjadi kesalahan saat menyimpan barang masuk. " +
          (err.response?.data?.message || err.message || "Silakan coba lagi.")
      );
    } finally {
      setLoading(false); // Matikan loading
    }
  };

  const handleModalOpen = () => {
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsEditMode(false);
    setFormData({
      supplier_name: "",
      name: "",
      quantity: "",
      purchase_price: "",
      received_date: "",
    });
  };

  // Fungsi untuk memfilter data barang masuk
  const filteredBarangMasuk = barangMasuk.filter((item) => {
    const lowerCaseKeyword = filterKeyword.toLowerCase();

    // Format received_date ke bentuk "02 Januari 2025"
    const itemDate = new Date(item.received_date);
    const day = String(itemDate.getDate()).padStart(2, "0"); // Ambil hari (2 digit)
    const monthNames = [
      "januari",
      "februari",
      "maret",
      "april",
      "mei",
      "juni",
      "juli",
      "agustus",
      "september",
      "oktober",
      "november",
      "desember",
    ];
    const month = monthNames[itemDate.getMonth()]; // Ambil nama bulan
    const year = itemDate.getFullYear(); // Ambil tahun
    const formattedDate = `${day} ${month} ${year}`; // Format tanggal lengkap

    // Filter berdasarkan kata kunci dan tanggal lengkap
    return (
      item.user?.name.toLowerCase().includes(lowerCaseKeyword) || // Filter berdasarkan nama penginput
      item.Supplier?.name.toLowerCase().includes(lowerCaseKeyword) || // Filter berdasarkan nama supplier
      item.Barang?.name.toLowerCase().includes(lowerCaseKeyword) || // Filter berdasarkan nama barang
      item.quantity.toString().includes(lowerCaseKeyword) || // Filter berdasarkan kuantitas
      item.purchase_price.toString().includes(lowerCaseKeyword) || // Filter berdasarkan harga beli
      formattedDate.includes(lowerCaseKeyword) // Filter berdasarkan tanggal lengkap
    );
  });

  const [currentPage, setCurrentPage] = useState(0); // State untuk halaman aktif
  const [showAll, setShowAll] = useState(false); // State untuk melihat semua data
  const itemsPerPage = 10; // Jumlah item per halaman

  // Hitung jumlah halaman
  const pageCount = Math.ceil(filteredBarangMasuk.length / itemsPerPage);

  // Filter data berdasarkan halaman saat ini atau tampilkan semua data
  const currentItems = showAll
    ? filteredBarangMasuk // Jika lihat semua, tampilkan semua barang keluar
    : filteredBarangMasuk.slice(
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

  //delete barang masuk
  const handleDeleteBarangMasuk = async (id) => {
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
          await axios.delete(`${API_BASE_URL}/deleteBarangMasuk/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Berhasil", "Barang keluar berhasil dihapus.", "success");
          fetchBarangMasuk(); // Refresh data
        } catch (error) {
          Swal.fire(
            "Error",
            error.response?.data.message || "Gagal menghapus barang Masuk.",
            "error"
          );
          console.error("Error deleting barang Masuk:", error);
        }
      }
    });
  };

  // Fungsi helper untuk memformat tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ paddingTop: "100px", width: "93vw" }}
      >
        <div
          className="d-flex flex-column p-4 shadow bg-white"
          style={{ minWidth: "100%" }}
        >
          <div className="d-flex flex-column rounded bg-white p-4 shadow-lg m-2">
            <div
              className="header p-2 d-flex flex-row justify-content-between border-bottom border-secondary"
              style={{ width: "95%", margin: "0 auto" }}
            >
              <h2>Barang Masuk</h2>
              <div className="d-flex flex-row gap-3">
                <button
                  className="btn btn-primary-color-icon"
                  onClick={handleDownloadReport}
                >
                  <i className="ri-file-download-line"></i> Unduh
                </button>

                <button
                  className="btn btn-primary-color"
                  onClick={handleModalOpen}
                >
                  <i className="ri-file-add-fill"> barang baru</i>
                </button>
              </div>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div
              className="konten pt-4"
              style={{ width: "95%", margin: "0 auto" }}
            >
              <div className="header d-flex flex-row justify-content-between mb-2">
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
                      onChange={(e) => setFilterKeyword(e.target.value)}
                    />
                  </InputGroup>
                </div>
                <div className="text-end">
                  <button
                    className={`btn mb-3 ${
                      showAll ? "btn-success" : "btn-primary-color-icon"
                    }`} // Ganti warna jika showAll aktif
                    onClick={handleSeeAllClick}
                  >
                    {showAll ? "Tampilkan Paginasi" : "Lihat Semua"}
                  </button>
                </div>
              </div>
              {loading ? (
                <div className="text-center">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table striped bordered hover>
                  <thead className="">
                    <tr>
                      <th className="">#</th>
                      <th className="">Penginput</th>
                      <th className="">Supplier</th>
                      <th className="">Nama Barang</th>
                      <th className="">Harga</th>
                      <th className="">Kuantiti</th>
                      <th className="">Tanggal Masuk</th>
                    
                      <th className="">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          Tidak ada data yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      currentItems.map((item, index) => {
                        // Gunakan received_date jika ada, jika tidak gunakan createdAt
                        const dateToDisplay =
                          item.received_date || item.createdAt;

                        return (
                          <tr key={item.id}>
                            <td>{index + 1}</td>
                            <td>
                              {item.user?.name || "Supplier tidak tersedia"}
                            </td>
                            <td>
                              {item.Supplier?.name || "Supplier tidak tersedia"}
                            </td>
                            <td>
                              {item.Barang?.name ||
                                "Nama barang tidak tersedia"}
                            </td>
                            <td>
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(item.purchase_price)}
                            </td>
                            <td>{item.quantity} sak</td>
                            <td>{formatDate(dateToDisplay)}</td>
                        
                            <td className="d-flex flex-row gap-2 text-center">
                              <div
                                onClick={() => handleDeleteBarangMasuk(item.id)}
                              >
                                <i
                                  className="aksi-delete ri-delete-bin-6-line btn btn-link"
                                  style={{ fontSize: "25px" }}
                                ></i>
                              </div>
                              <div
                                className="btn btn-link aksi"
                                style={{ fontSize: "25px" }}
                                onClick={() => handleEditBarangMasuk(item.id)}
                              >
                                <i className="ri-edit-fill"></i>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              )}
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

      <Modal
        className="custom-modal p-5"
        show={showModal}
        onHide={handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? "Edit Barang Masuk" : "Tambah Barang Masuk"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body p-5 text-2xl">
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3" controlId="formSupplierName">
              <Form.Label>Nama Supplier</Form.Label>
              <Form.Select
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleInputChange}
                required
              >
                <option value="">Pilih Supplier</option>
                {supplierOptions.map((supplier, index) => (
                  <option key={index} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNamaBarang">
  <Form.Label>Nama Barang</Form.Label>
  <Form.Select
    name="name"
    value={formData.name}
    onChange={handleBarangChange} // Gunakan fungsi baru
    required
  >
    <option value="">Pilih Barang</option>
    {barangOptions.map((barang, index) => (
      <option key={index} value={barang}>
        {barang}
      </option>
    ))}
  </Form.Select>
</Form.Group>

            <Form.Group className="mb-3" controlId="formQuantity">
              <Form.Label>Kuantiti</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: Number(e.target.value),
                  })
                }
                required
              />
              
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPurchasePrice">
  <Form.Label>Harga Beli</Form.Label>
  <Form.Control
    type="number"
    name="purchase_price"
    value={formData.purchase_price}
    onChange={(e) =>
      setFormData({
        ...formData,
        purchase_price: Number(e.target.value),
      })
    }
    required
    readOnly // Tambahkan readOnly jika harga tidak boleh diubah manual
  />
</Form.Group>
            <Form.Group className="mb-3" controlId="formReceivedDate">
              <Form.Label>Tanggal Diterima</Form.Label>
              <Form.Control
                type="date"
                name="received_date"
                value={formData.received_date}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button
              className="btn btn-primary-color mt-3"
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Tambah"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </AdminLayout>
  );
}

export default AdminDashboardPage;
