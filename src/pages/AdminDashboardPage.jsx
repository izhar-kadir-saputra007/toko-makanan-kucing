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
  Card,
  Collapse,
  Dropdown,
  DropdownButton,
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
  
  // State untuk tampilan baru (collapsed/expanded)
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [detailPages, setDetailPages] = useState({});
  const [showAllDetails, setShowAllDetails] = useState({});
  const [dateSort, setDateSort] = useState({});
  const [lastAddedBarang, setLastAddedBarang] = useState(null);
  const [filteredBarangMasuk, setFilteredBarangMasuk] = useState([]);
  
  const itemsPerPage = 10;
  const detailItemsPerPage = 5;

  const API_BASE_URL = "http://localhost:4000/api"; // Base URL API
  const token = localStorage.getItem("accessToken"); // Ambil token dari localStorage

  // Fungsi untuk mengelompokkan data berdasarkan ID barang
  const groupBarangById = (data) => {
    const groupedData = {};
    
    data.forEach(item => {
      const barangId = item.Barang?.id;
      const barangName = item.Barang?.name;
      
      if (!barangId) return; // Skip jika tidak ada ID barang
      
      if (!groupedData[barangId]) {
        groupedData[barangId] = {
          id: barangId,
          name: barangName || "Barang tidak tersedia",
          total_quantity: 0,
          items: []
        };
      }
      
      // Tambahkan item ke dalam grup
      groupedData[barangId].items.push(item);
      
      // Tambahkan quantity ke total
      groupedData[barangId].total_quantity += parseInt(item.quantity || 0);
    });
    
    return Object.values(groupedData);
  };

  // Data yang dikelompokkan berdasarkan ID barang
  const groupedBarangMasuk = groupBarangById(filteredBarangMasuk);
  
  const pageCount = Math.ceil(groupedBarangMasuk.length / itemsPerPage);

  const currentItems = showAll
    ? groupedBarangMasuk
    : groupedBarangMasuk.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
      );

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
      setFilteredBarangMasuk(response.data);
      console.log("barang masuk", response.data);
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
  
  // Inisialisasi state pagination detail ketika data diload atau difilter
  useEffect(() => {
    const initDetailPagination = () => {
      const newDetailPages = {};
      const newShowAllDetails = {};
      const newDateSort = {};
      
      groupedBarangMasuk.forEach(group => {
        newDetailPages[group.id] = 0;
        newShowAllDetails[group.id] = false;
        newDateSort[group.id] = "newest"; // Default sort newest
      });
      
      setDetailPages(newDetailPages);
      setShowAllDetails(newShowAllDetails);
      setDateSort(newDateSort);
    };
    
    initDetailPagination();
  }, [filteredBarangMasuk]);
  
  // Efek untuk auto-expand barang yang baru ditambahkan
  useEffect(() => {
    if (lastAddedBarang) {
      setExpandedRows(prev => ({
        ...prev,
        [lastAddedBarang]: true
      }));
      // Reset lastAddedBarang setelah expand
      setTimeout(() => {
        setLastAddedBarang(null);
      }, 500);
    }
  }, [lastAddedBarang, groupedBarangMasuk]);

  // Fungsi untuk mengupdate harga beli saat barang dipilih
  const handleBarangChange = (e) => {
    const selectedBarangName = e.target.value;
    const selectedBarang = barangData.find(item => item.name === selectedBarangName);
    
    setFormData(prev => ({
      ...prev,
      name: selectedBarangName,
      purchase_price: selectedBarang ? selectedBarang.unit_price : "" 
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
  
  // Fungsi untuk toggle row expansion
  const toggleRowExpansion = (barangId) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [barangId]: !prevState[barangId],
    }));
    
    // Reset pagination detail ketika baris di-expand
    if (!expandedRows[barangId]) {
      setDetailPages(prev => ({
        ...prev,
        [barangId]: 0
      }));
      setShowAllDetails(prev => ({
        ...prev,
        [barangId]: false
      }));
    }
  };
  
  // Handle perubahan halaman
  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
  };
  
  // Pagination untuk detail barang
  const handleDetailPageChange = (barangId, selected) => {
    setDetailPages({
      ...detailPages,
      [barangId]: selected
    });
  };
  
  // Toggle tampilkan semua di detail barang
  const toggleShowAllDetails = (barangId) => {
    setShowAllDetails(prev => ({
      ...prev,
      [barangId]: !prev[barangId]
    }));
    // Reset halaman detail ke 0
    setDetailPages(prev => ({
      ...prev,
      [barangId]: 0
    }));
  };
  
  // Fungsi untuk melihat semua data
  const handleSeeAllClick = () => {
    setShowAll((prevShowAll) => !prevShowAll);
    setCurrentPage(0);
  };
  
  // Handle perubahan sorting tanggal
  const handleDateSortChange = (barangId, sortOrder) => {
    setDateSort(prev => ({
      ...prev,
      [barangId]: sortOrder
    }));
  };
  
  // Fungsi untuk memfilter data barang masuk
  const handleFilterChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setFilterKeyword(keyword);

    const filteredData = barangMasuk.filter((item) => {
      // Format received_date ke bentuk "02 Januari 2025"
      const itemDate = new Date(item.received_date || item.createdAt);
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

      return (
        (item.user?.name || "").toLowerCase().includes(keyword) || // Filter berdasarkan nama penginput
        (item.Supplier?.name || "").toLowerCase().includes(keyword) || // Filter berdasarkan nama supplier
        (item.Barang?.name || "").toLowerCase().includes(keyword) || // Filter berdasarkan nama barang
        (item.quantity || "").toString().includes(keyword) || // Filter berdasarkan kuantitas
        (item.purchase_price || "").toString().includes(keyword) || // Filter berdasarkan harga beli
        formattedDate.includes(keyword) // Filter berdasarkan tanggal lengkap
      );
    });

    setFilteredBarangMasuk(filteredData);
    setCurrentPage(0);
    
    // Koleksi ID barang yang cocok dengan filter
    const matchedBarangIds = [];
    filteredData.forEach(item => {
      if (item.Barang?.id && !matchedBarangIds.includes(item.Barang.id)) {
        matchedBarangIds.push(item.Barang.id);
      }
    });
    
    // Buka detail barang yang cocok dengan filter (jika ada)
    const newExpandedRows = {};
    matchedBarangIds.forEach(id => {
      newExpandedRows[id] = true;
    });
    
    // Jika filter kosong, tutup semua detail
    if (keyword === '') {
      setExpandedRows({});
    } else {
      setExpandedRows(newExpandedRows);
    }
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
        supplier_name: barangMasukItem.supplier_name || barangMasukItem.Supplier?.name || "",
        name: barangMasukItem.name || barangMasukItem.Barang?.name || "",
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

  // Fungsi untuk mengurutkan detail barang berdasarkan tanggal
  const getSortedDetails = (items, barangId) => {
    if (!items || !dateSort[barangId]) return items;
    
    return [...items].sort((a, b) => {
      const dateA = new Date(a.received_date || a.createdAt);
      const dateB = new Date(b.received_date || b.createdAt);
      
      if (dateSort[barangId] === "newest") {
        return dateB - dateA; // Terbaru dulu (descending)
      } else {
        return dateA - dateB; // Terlama dulu (ascending)
      }
    });
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

        // Set lastAddedBarang untuk auto-expand
        // Temukan ID barang berdasarkan nama
        const selectedBarang = barangData.find(item => item.name === formData.name);
        if (selectedBarang) {
          setLastAddedBarang(selectedBarang.id);
        }
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
      Swal.fire({
        icon: "error",
        title: "Terjadi Kesalahan",
        text: err.response?.data?.message || err.message || "Silakan coba lagi."
      });
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
          Swal.fire("Berhasil", "Barang masuk berhasil dihapus.", "success");
          fetchBarangMasuk(); // Refresh data
        } catch (error) {
          Swal.fire(
            "Error",
            error.response?.data.message || "Gagal menghapus barang masuk.",
            "error"
          );
          console.error("Error deleting barang masuk:", error);
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
                      onChange={handleFilterChange}
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
{/* card ecommerce */}


     {loading ? (
  <div className="text-center">
    <Spinner animation="border" variant="primary" />
  </div>
) : (
  <div className="row">
    {currentItems.length === 0 ? (
      <div className="col-12">
        <div className="text-center p-5">
          <i className="ri-inbox-line" style={{ fontSize: "4rem", color: "#ccc" }}></i>
          <h4 className="mt-3 text-muted">Tidak ada data yang sesuai</h4>
          <p className="text-muted">Coba ubah kata kunci pencarian Anda</p>
        </div>
      </div>
    ) : (
      currentItems.map((group, index) => (
        <div key={`group-${group.id}`} className="col-lg-4 col-md-6 col-sm-12 mb-4">
          <div className="card h-100 shadow-sm border-0 position-relative overflow-hidden">
            {/* Badge untuk nomor urut */}
            <div className="position-absolute top-0 start-0 z-3">
              <span className="badge bg-primary rounded-0 rounded-end-2 px-3 py-2">
                #{currentPage * itemsPerPage + index + 1}
              </span>
            </div>
            
{/* Gambar produk dari API */}
            <div className="position-relative overflow-hidden" style={{ height: "200px" }}>
              <img
                src={
                  group.items[0]?.Barang?.gambar 
                    ? `http://localhost:4000${group.items[0].Barang.gambar}` 
                    : `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&crop=center&auto=format&q=80`
                }
                className="card-img-top w-100 h-100 object-fit-cover"
                alt={group.name}
                style={{
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
                onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                onError={(e) => {
                  // Fallback ke gambar default jika gambar API gagal dimuat
                  e.target.src = `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&crop=center&auto=format&q=80`;
                }}
              />
              
              {/* Overlay gradient */}
              <div 
                className="position-absolute bottom-0 start-0 w-100 h-50"
                style={{
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                }}
              ></div>

  
  {/* Total quantity badge di atas gambar */}
  <div className="position-absolute bottom-0 end-0 m-3">
    <span className="badge bg-success fs-6 px-3 py-2 rounded-pill">
      <i className="ri-archive-line me-1"></i>
      {group.total_quantity} sak
    </span>
  </div>
</div>

            <div className="card-body d-flex flex-column">
              {/* Nama barang */}
              <h5 className="card-title fw-bold mb-3 text-truncate" title={group.name}>
                <i className="ri-box-3-line text-primary me-2"></i>
                {group.name}
              </h5>
              
              {/* Info ringkas */}
              <div className="mb-3">
                     <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">
                     <i className="ri-truck-line me-1"></i>
                   Supplier
                  </span>
                    {group.items[0]?.Supplier?.name && (
  
      <span className="text-info fs-6 px-3 py-2 rounded-pill">
       
        {group.items[0].Supplier.name}
      
      </span>

  )}
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted small">
                    <i className="ri-stack-line me-1"></i>
                    Total Stok
                  </span>
                  <span className="fw-semibold text-success">
                    {group.total_quantity} sak
                  </span>
                </div>
           
                
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    <i className="ri-file-list-3-line me-1"></i>
                 harga
                  </span>
                  <span className="fw-semibold text-info">
                  <span className="fw-bold text-success">
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                    }).format(group.items[0]?.purchase_price)}
                                  </span>
                  </span>
                </div>
              </div>

              {/* Tombol detail */}
              <div className="mt-auto">
                <Button
                  variant={expandedRows[group.id] ? "success" : "outline-primary"}
                  className="w-100 fw-semibold"
                  onClick={() => toggleRowExpansion(group.id)}
                  aria-expanded={expandedRows[group.id]}
                >
                  <i className={`${expandedRows[group.id] ? "ri-eye-off-line" : "ri-eye-line"} me-2`}></i>
                  {expandedRows[group.id] ? "Tutup Detail" : "Lihat Detail"}
                </Button>
              </div>
            </div>

            {/* Detail collapse - akan muncul di bawah card */}
            <Collapse in={expandedRows[group.id]}>
              <div className="border-top bg-light">
                <div className="p-3">
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap">
                      <div className="d-flex align-items-center mb-2 mb-md-0">
                        <strong className="text-primary">
                          <i className="ri-list-check-2 me-2"></i>
                          Detail Transaksi {group.name}
                        </strong>
                        <DropdownButton 
                          id={`date-sort-${group.id}`}
                          title={
                            <span>
                              <i className="ri-sort-desc me-1"></i>
                              {dateSort[group.id] === "newest" ? "Terbaru" : "Terlama"}
                            </span>
                          } 
                          variant="outline-secondary"
                          size="sm"
                          className="ms-3"
                        >
                          <Dropdown.Item 
                            onClick={() => handleDateSortChange(group.id, "newest")}
                            active={dateSort[group.id] === "newest"}
                          >
                            <i className="ri-sort-desc me-2"></i>Terbaru
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => handleDateSortChange(group.id, "oldest")}
                            active={dateSort[group.id] === "oldest"}
                          >
                            <i className="ri-sort-asc me-2"></i>Terlama
                          </Dropdown.Item>
                        </DropdownButton>
                      </div>
                      
                      <Button
                        variant={showAllDetails[group.id] ? "success" : "outline-primary"}
                        size="sm"
                        onClick={() => toggleShowAllDetails(group.id)}
                        className="d-flex align-items-center"
                      >
                        <i className={`${showAllDetails[group.id] ? "ri-list-unordered" : "ri-apps-2-line"} me-1`}></i>
                        {showAllDetails[group.id] ? "Tampilkan Paginasi" : "Lihat Semua Data"}
                      </Button>
                    </Card.Header>
                    
                    <Card.Body className="p-0">
                      {/* Tampilan responsif untuk detail transaksi */}
                      <div className="table-responsive">
                        <Table striped bordered hover size="sm" className="mb-0">
                          <thead className="bg-primary text-white">
                            <tr>
                              <th className="text-center">#</th>
                              {/* <th><i className="ri-user-line me-1"></i>Penginput</th>
                              <th><i className="ri-truck-line me-1"></i>Supplier</th>
                              <th><i className="ri-money-dollar-circle-line me-1"></i>Harga</th> */}
                              <th><i className="ri-archive-line me-1"></i>Kuantiti</th>
                              <th><i className="ri-calendar-line me-1"></i>Tanggal Masuk</th>
                              <th className="text-center"><i className="ri-settings-3-line me-1"></i>Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(showAllDetails[group.id] 
                              ? getSortedDetails(group.items, group.id) 
                              : getSortedDetails(group.items, group.id).slice(
                                  (detailPages[group.id] || 0) * detailItemsPerPage,
                                  ((detailPages[group.id] || 0) + 1) * detailItemsPerPage
                                )
                            ).map((item, idx) => (
                              <tr key={`detail-${item.id}`} className="align-middle">
                                <td className="text-center fw-semibold">
                                  {showAllDetails[group.id] 
                                    ? idx + 1 
                                    : (detailPages[group.id] || 0) * detailItemsPerPage + idx + 1}
                                </td>
                                {/* <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                         style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                                      <i className="ri-user-line text-white"></i>
                                    </div>
                                    <span className="fw-medium">
                                      {item.user?.name || "Tidak tersedia"}
                                    </span>
                                  </div>
                                </td> */}
                                {/* <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-info rounded-circle d-flex align-items-center justify-content-center me-2" 
                                         style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                                      <i className="ri-truck-line text-white"></i>
                                    </div>
                                    <span className="fw-medium">
                                      {item.Supplier?.name || "Supplier tidak tersedia"}
                                    </span>
                                  </div>
                                </td> */}
                                {/* <td>
                                  <span className="fw-bold text-success">
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                    }).format(item.purchase_price)}
                                  </span>
                                </td> */}
                                <td>
                                  <span className="badge bg-warning text-dark px-3 py-2">
                                    <i className="ri-archive-line me-1"></i>
                                    {item.quantity} sak
                                  </span>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {/* <i className="ri-calendar-line text-muted me-2"></i> */}
                                    <span className="small">
                                      {formatDate(item.received_date || item.createdAt)}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex justify-content-center gap-2">
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDeleteBarangMasuk(item.id)}
                                      className="d-flex align-items-center"
                                      title="Hapus"
                                    >
                                      <i className="ri-delete-bin-6-line"></i>
                                    </Button>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleEditBarangMasuk(item.id)}
                                      className="d-flex align-items-center"
                                      title="Edit"
                                    >
                                      <i className="ri-edit-fill"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      
                      {/* Pagination untuk detail */}
                      {!showAllDetails[group.id] && group.items.length > detailItemsPerPage && (
                        <div className="mt-3 d-flex justify-content-center p-3 bg-light">
                          <Pagination
                            pageCount={Math.ceil(group.items.length / detailItemsPerPage)}
                            onPageChange={(data) => handleDetailPageChange(group.id, data.selected)}
                            forcePage={detailPages[group.id] || 0}
                          />
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Collapse>
          </div>
        </div>
      ))
    )}
  </div>
)}

{/* Pagination utama */}
{!showAll && pageCount > 1 && (
  <div className="d-flex justify-content-center mt-4">
    <Pagination
      pageCount={pageCount}
      onPageChange={handlePageChange}
      forcePage={currentPage}
    />
  </div>
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
            {isEditMode ? "Ubah Barang Masuk" : "Tambah Barang Masuk"}
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
