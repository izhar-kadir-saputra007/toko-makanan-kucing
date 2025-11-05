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
  Card,
  Collapse,
  Dropdown,
  DropdownButton,
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
    barang_id: "",
    quantity: "",
    sale_price: "",
    sale_date: "",
  });
  const [currentId, setCurrentId] = useState(null);
  const [barangList, setBarangList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  // State untuk pagination detail barang
  const [detailPages, setDetailPages] = useState({});
  const [showAllDetails, setShowAllDetails] = useState({});
  const [dateSort, setDateSort] = useState({}); // State untuk filter tanggal per barang
  const [lastAddedBarang, setLastAddedBarang] = useState(null); // Untuk melacak barang yang baru ditambahkan
  const itemsPerPage = 10;
  const detailItemsPerPage = 5; // Item per halaman untuk detail barang

  // Fungsi untuk mengelompokkan data berdasarkan nama_barang
  const groupBarangByName = (data) => {
    const groupedData = {};

    data.forEach((item) => {
      // Gunakan nama_barang sebagai kunci untuk mengelompokkan
      if (!groupedData[item.nama_barang]) {
        groupedData[item.nama_barang] = {
          nama_barang: item.nama_barang,
          total_quantity: 0,
          items: [],
        };
      }

      // Tambahkan item ke dalam grup
      groupedData[item.nama_barang].items.push(item);

      // Tambahkan quantity ke total
      groupedData[item.nama_barang].total_quantity += parseInt(
        item.quantity || 0
      );
    });

    return Object.values(groupedData);
  };

  // Data yang dikelompokkan berdasarkan nama barang
  const groupedBarangKeluar = groupBarangByName(filteredBarangKeluar);

  const pageCount = Math.ceil(groupedBarangKeluar.length / itemsPerPage);

  const currentItems = showAll
    ? groupedBarangKeluar
    : groupedBarangKeluar.slice(
        currentPage * itemsPerPage,
        currentPage * itemsPerPage + itemsPerPage
      );

  const handlePageChange = (data) => {
    setCurrentPage(data.selected);
  };

  // Pagination untuk detail barang
  const handleDetailPageChange = (barangName, selected) => {
    setDetailPages({
      ...detailPages,
      [barangName]: selected,
    });
  };

  const handleSeeAllClick = () => {
    setShowAll((prevShowAll) => !prevShowAll);
    setCurrentPage(0);
  };

  // Toggle tampilkan semua di detail barang
  const toggleShowAllDetails = (barangName) => {
    setShowAllDetails((prev) => ({
      ...prev,
      [barangName]: !prev[barangName],
    }));
    // Reset halaman detail ke 0
    setDetailPages((prev) => ({
      ...prev,
      [barangName]: 0,
    }));
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
      setFilteredBarangKeluar(response.data);
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

  // Inisialisasi state pagination detail ketika data diload atau difilter
  useEffect(() => {
    const initDetailPagination = () => {
      const newDetailPages = {};
      const newShowAllDetails = {};
      const newDateSort = {};

      groupedBarangKeluar.forEach((group) => {
        newDetailPages[group.nama_barang] = 0;
        newShowAllDetails[group.nama_barang] = false;
        newDateSort[group.nama_barang] = "newest"; // Default sort newest
      });

      setDetailPages(newDetailPages);
      setShowAllDetails(newShowAllDetails);
      setDateSort(newDateSort);
    };

    initDetailPagination();
  }, [filteredBarangKeluar]);

  // Efek untuk auto-expand barang yang baru ditambahkan
  useEffect(() => {
    if (lastAddedBarang) {
      setExpandedRows((prev) => ({
        ...prev,
        [lastAddedBarang]: true,
      }));
      // Reset lastAddedBarang setelah expand
      setTimeout(() => {
        setLastAddedBarang(null);
      }, 500);
    }
  }, [lastAddedBarang, groupedBarangKeluar]);

  const handleModalOpen = () => setShowModal(true);
  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      nama_barang: "",
      quantity: "",
      sale_price: "",
      sale_date: "",
    });
    setCurrentId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "nama_barang") {
      const selectedBarang = barangList.find((barang) => barang.name === value);

      setFormData((prev) => ({
        ...prev,
        [name]: value,
        barang_id: selectedBarang?.id || "",
        sale_price: selectedBarang?.harga_jual || "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e) => {
    const keyword = e.target.value.toLowerCase();
    setFilterKeyword(keyword);

    const filteredData = barangKeluar.filter((item) => {
      const [day, month, year] = item.sale_date.split("-");
      const itemDate = new Date(`${year}-${month}-${day}`);

      const formattedDate = itemDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const matchesKeyword =
        item.user?.toLowerCase().includes(keyword) ||
        item.nama_barang?.toLowerCase().includes(keyword) ||
        (item.sale_price && item.sale_price.toString().includes(keyword)) ||
        formattedDate.toLowerCase().includes(keyword) ||
        (item.quantity && item.quantity.toString().includes(keyword));

      return matchesKeyword;
    });

    setFilteredBarangKeluar(filteredData);

    // Reset pagination ketika filter berubah
    setCurrentPage(0);

    // Koleksi nama barang yang cocok dengan filter
    const matchedBarangNames = [];
    filteredData.forEach((item) => {
      if (!matchedBarangNames.includes(item.nama_barang)) {
        matchedBarangNames.push(item.nama_barang);
      }
    });

    // Buka detail barang yang cocok dengan filter (jika ada)
    const newExpandedRows = {};
    matchedBarangNames.forEach((name) => {
      newExpandedRows[name] = true;
    });

    // Jika filter kosong, tutup semua detail
    if (keyword === "") {
      setExpandedRows({});
    } else {
      setExpandedRows(newExpandedRows);
    }
  };

  const toggleRowExpansion = (barangName) => {
    setExpandedRows((prevState) => ({
      ...prevState,
      [barangName]: !prevState[barangName],
    }));

    // Reset pagination detail ketika baris di-expand
    if (!expandedRows[barangName]) {
      setDetailPages((prev) => ({
        ...prev,
        [barangName]: 0,
      }));
      setShowAllDetails((prev) => ({
        ...prev,
        [barangName]: false,
      }));
    }
  };

  const handleEditBarangKeluar = (id) => {
    const itemToEdit = barangKeluar.find((item) => item.id === id);
    if (itemToEdit) {
      setFormData({
        nama_barang: itemToEdit.nama_barang,
        quantity: itemToEdit.quantity,
        sale_price: itemToEdit.sale_price,
        sale_date: itemToEdit.sale_date,
        barang_id: itemToEdit.barang_id || "",
      });
      setCurrentId(id);
      setShowModal(true);
    }
  };

  // Handle perubahan sorting tanggal
  const handleDateSortChange = (barangName, sortOrder) => {
    setDateSort((prev) => ({
      ...prev,
      [barangName]: sortOrder,
    }));
  };

  // Fungsi untuk mengurutkan detail barang berdasarkan tanggal
  const getSortedDetails = (items, barangName) => {
    if (!items || !dateSort[barangName]) return items;

    return [...items].sort((a, b) => {
      // Format tanggal dari string DD-MM-YYYY menjadi objek Date
      const parseDate = (dateString) => {
        const [day, month, year] = dateString.split("-").map(Number);
        return new Date(year, month - 1, day); // Bulan dalam JS dimulai dari 0
      };

      const dateA = parseDate(a.sale_date);
      const dateB = parseDate(b.sale_date);

      if (dateSort[barangName] === "newest") {
        return dateB - dateA; // Terbaru dulu (descending)
      } else {
        return dateA - dateB; // Terlama dulu (ascending)
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.nama_barang,
      barang_id: formData.barang_id,
      quantity: formData.quantity,
      sale_price: formData.sale_price,
      sale_date: formData.sale_date,
    };

    try {
      setLoading(true);
      let response;

      if (currentId) {
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
      } else {
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

        // Set barang yang baru ditambahkan untuk di-expand secara otomatis
        setLastAddedBarang(formData.nama_barang);
      }

      console.log("Data yang dikirim:", payload);
      console.log("Response dari server:", response.data);

      fetchBarangKeluar();
      handleModalClose();
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
          fetchBarangKeluar();
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

  // Format tanggal untuk ditampilkan
  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    const itemDate = new Date(`${year}-${month}-${day}`);
    return itemDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
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
                    <i className="ri-file-download-line">Unduh</i>
                  </button>
                  <button
                    className="btn btn-primary-color"
                    onClick={handleModalOpen}
                  >
                    <i className="ri-file-add-fill"> Barang Keluar</i>
                  </button>
                </div>
              </div>
              <div
                className="header d-flex flex-row justify-content-between mb-2"
                style={{ width: "95%", margin: "0 auto" }}
              >
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
                    }`}
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
                {/* Ganti bagian Table dengan tampilan card ecommerce */}
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {currentItems.length === 0 ? (
                      <div className="col-12">
                        <div className="text-center p-5">
                          <i
                            className="ri-inbox-line"
                            style={{ fontSize: "4rem", color: "#ccc" }}
                          ></i>
                          <h4 className="mt-3 text-muted">
                            Tidak ada data yang sesuai
                          </h4>
                          <p className="text-muted">
                            Coba ubah kata kunci pencarian Anda
                          </p>
                        </div>
                      </div>
                    ) : (
                      currentItems.map((group, index) => (
                        <div
                          key={`group-${group.nama_barang}`}
                          className="col-lg-4 col-md-6 col-sm-12 mb-4"
                        >
                          <div className="card h-100 shadow-sm border-0 position-relative overflow-hidden">
                            {/* Badge untuk nomor urut */}
                            <div className="position-absolute top-0 start-0 z-3">
                              <span className="badge bg-primary rounded-0 rounded-end-2 px-3 py-2">
                                #{currentPage * itemsPerPage + index + 1}
                              </span>
                            </div>

                            {/* Gambar produk dari Unsplash - gambar sak/karung */}

                            <div
                              className="position-relative overflow-hidden"
                              style={{ height: "200px" }}
                            >
                              <img
                                src={
                                  group.items[0]?.gambar
                                    ? `http://localhost:4000${group.items[0].gambar}`
                                    : `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&crop=center&auto=format&q=80`
                                }
                                className="card-img-top w-100 h-100 object-fit-cover"
                                alt={group.nama_barang}
                                style={{
                                  objectFit: "cover",
                                  transition: "transform 0.3s ease",
                                }}
                                onMouseOver={(e) =>
                                  (e.target.style.transform = "scale(1.05)")
                                }
                                onMouseOut={(e) =>
                                  (e.target.style.transform = "scale(1)")
                                }
                                onError={(e) => {
                                  // Fallback ke gambar Unsplash jika gambar dari API gagal dimuat
                                  e.target.src =
                                    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=200&fit=crop&crop=center&auto=format&q=80";
                                }}
                              />
                              {/* Overlay gradient */}
                              <div
                                className="position-absolute bottom-0 start-0 w-100 h-50"
                                style={{
                                  background:
                                    "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                }}
                              ></div>

                              {/* Total quantity badge di atas gambar */}
                              <div className="position-absolute bottom-0 end-0 m-3">
                                <span className="badge bg-danger fs-6 px-3 py-2 rounded-pill">
                                  <i className="ri-truck-line me-1"></i>
                                  {group.total_quantity} sak keluar
                                </span>
                              </div>
                            </div>

                            <div className="card-body d-flex flex-column">
                              {/* Nama barang */}
                              <h5
                                className="card-title fw-bold mb-3 text-truncate"
                                title={group.nama_barang}
                              >
                                <i className="ri-box-3-line text-primary me-2"></i>
                                {group.nama_barang}
                              </h5>

                              {/* Info ringkas */}
                              <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="text-muted small">
                                    <i className="ri-truck-line me-1"></i>
                                    Total Keluar
                                  </span>
                                  <span className="fw-semibold text-danger">
                                    {group.total_quantity} sak
                                  </span>
                                </div>

                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="text-muted small">
                                    <i className="ri-file-list-3-line me-1"></i>
                                    harga
                                  </span>
                                  <span className="fw-bold text-success">
                                    Rp{" "}
                                    {parseInt(
                                      group.items[0]?.sale_price || 0
                                    ).toLocaleString()}
                                  </span>
                                </div>

                                {/* Tampilkan total nilai penjualan */}
                                {/* <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">
                    <i className="ri-money-dollar-circle-line me-1"></i>
                    Total Nilai
                  </span>
                  <span className="fw-semibold text-success">
                    Rp {group.items.reduce((total, item) => 
                      total + (parseInt(item.sale_price || 0) * parseInt(item.quantity || 0)), 0
                    ).toLocaleString()}
                  </span>
                </div> */}
                              </div>

                              {/* Tombol detail */}
                              <div className="mt-auto">
                                <Button
                                  variant={
                                    expandedRows[group.nama_barang]
                                      ? "success"
                                      : "outline-primary"
                                  }
                                  className="w-100 fw-semibold"
                                  onClick={() =>
                                    toggleRowExpansion(group.nama_barang)
                                  }
                                  aria-expanded={
                                    expandedRows[group.nama_barang]
                                  }
                                >
                                  <i
                                    className={`${
                                      expandedRows[group.nama_barang]
                                        ? "ri-eye-off-line"
                                        : "ri-eye-line"
                                    } me-2`}
                                  ></i>
                                  {expandedRows[group.nama_barang]
                                    ? "Tutup Detail"
                                    : "Lihat Detail"}
                                </Button>
                              </div>
                            </div>

                            {/* Detail collapse - akan muncul di bawah card */}
                            <Collapse in={expandedRows[group.nama_barang]}>
                              <div className="border-top bg-light">
                                <div className="p-3">
                                  <Card className="border-0 shadow-sm">
                                    <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap">
                                      <div className="d-flex align-items-center mb-2 mb-md-0">
                                        <strong className="text-primary">
                                          <i className="ri-list-check-2 me-2"></i>
                                          Detail Transaksi {group.nama_barang}
                                        </strong>
                                        <DropdownButton
                                          id={`date-sort-${group.nama_barang}`}
                                          title={
                                            <span>
                                              <i className="ri-sort-desc me-1"></i>
                                              {dateSort[group.nama_barang] ===
                                              "newest"
                                                ? "Terbaru"
                                                : "Terlama"}
                                            </span>
                                          }
                                          variant="outline-secondary"
                                          size="sm"
                                          className="ms-3"
                                        >
                                          <Dropdown.Item
                                            onClick={() =>
                                              handleDateSortChange(
                                                group.nama_barang,
                                                "newest"
                                              )
                                            }
                                            active={
                                              dateSort[group.nama_barang] ===
                                              "newest"
                                            }
                                          >
                                            <i className="ri-sort-desc me-2"></i>
                                            Terbaru
                                          </Dropdown.Item>
                                          <Dropdown.Item
                                            onClick={() =>
                                              handleDateSortChange(
                                                group.nama_barang,
                                                "oldest"
                                              )
                                            }
                                            active={
                                              dateSort[group.nama_barang] ===
                                              "oldest"
                                            }
                                          >
                                            <i className="ri-sort-asc me-2"></i>
                                            Terlama
                                          </Dropdown.Item>
                                        </DropdownButton>
                                      </div>

                                      <Button
                                        variant={
                                          showAllDetails[group.nama_barang]
                                            ? "success"
                                            : "outline-primary"
                                        }
                                        size="sm"
                                        onClick={() =>
                                          toggleShowAllDetails(
                                            group.nama_barang
                                          )
                                        }
                                        className="d-flex align-items-center"
                                      >
                                        <i
                                          className={`${
                                            showAllDetails[group.nama_barang]
                                              ? "ri-list-unordered"
                                              : "ri-apps-2-line"
                                          } me-1`}
                                        ></i>
                                        {showAllDetails[group.nama_barang]
                                          ? "Tampilkan Paginasi"
                                          : "Lihat Semua Data"}
                                      </Button>
                                    </Card.Header>

                                    <Card.Body className="p-0">
                                      {/* Tampilan responsif untuk detail transaksi */}
                                      <div className="table-responsive">
                                        <Table
                                          striped
                                          bordered
                                          hover
                                          size="sm"
                                          className="mb-0"
                                        >
                                          <thead className="bg-danger text-white">
                                            <tr>
                                              <th className="text-center">#</th>
                                              {/* <th><i className="ri-hashtag me-1"></i>ID Transaksi</th>
                              <th><i className="ri-user-line me-1"></i>Penginput</th> */}
                                              <th>
                                                <i className="ri-archive-line me-1"></i>
                                                Kuantiti
                                              </th>
                                              {/* <th><i className="ri-money-dollar-circle-line me-1"></i>Harga Jual</th> */}
                                              <th>
                                                <i className="ri-calendar-line me-1"></i>
                                                Tanggal Keluar
                                              </th>
                                              <th className="text-center">
                                                <i className="ri-settings-3-line me-1"></i>
                                                Aksi
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {(showAllDetails[group.nama_barang]
                                              ? getSortedDetails(
                                                  group.items,
                                                  group.nama_barang
                                                )
                                              : getSortedDetails(
                                                  group.items,
                                                  group.nama_barang
                                                ).slice(
                                                  (detailPages[
                                                    group.nama_barang
                                                  ] || 0) * detailItemsPerPage,
                                                  ((detailPages[
                                                    group.nama_barang
                                                  ] || 0) +
                                                    1) *
                                                    detailItemsPerPage
                                                )
                                            ).map((item, idx) => (
                                              <tr
                                                key={`detail-${item.id}`}
                                                className="align-middle"
                                              >
                                                <td className="text-center fw-semibold">
                                                  {showAllDetails[
                                                    group.nama_barang
                                                  ]
                                                    ? idx + 1
                                                    : (detailPages[
                                                        group.nama_barang
                                                      ] || 0) *
                                                        detailItemsPerPage +
                                                      idx +
                                                      1}
                                                </td>
                                                {/* <td>
                                  <span className="badge bg-secondary">
                                    #{item.id}
                                  </span>
                                </td> */}
                                                {/* <td>
                                  <div className="d-flex align-items-center">
                                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                         style={{ width: "32px", height: "32px", fontSize: "14px" }}>
                                      <i className="ri-user-line text-white"></i>
                                    </div>
                                    <span className="fw-medium">
                                      {item.user || "Tidak tersedia"}
                                    </span>
                                  </div>
                                </td> */}
                                                <td>
                                                  <span className="badge bg-warning text-dark px-3 py-2">
                                                    <i className="ri-archive-line me-1"></i>
                                                    {item.quantity} sak
                                                  </span>
                                                </td>
                                                {/* <td>
                                  <span className="fw-bold text-success">
                                    Rp {parseInt(item.sale_price || 0).toLocaleString()}
                                  </span>
                                </td> */}
                                                <td>
                                                  <div className="d-flex align-items-center">
                                                    <span className="small">
                                                      {formatDate(
                                                        item.sale_date
                                                      )}
                                                    </span>
                                                  </div>
                                                </td>
                                                <td>
                                                  <div className="d-flex justify-content-center gap-2">
                                                    <Button
                                                      variant="outline-danger"
                                                      size="sm"
                                                      onClick={() =>
                                                        handleDeleteBarangKeluar(
                                                          item.id
                                                        )
                                                      }
                                                      className="d-flex align-items-center"
                                                      title="Hapus"
                                                    >
                                                      <i className="ri-delete-bin-6-line"></i>
                                                    </Button>
                                                    <Button
                                                      variant="outline-primary"
                                                      size="sm"
                                                      onClick={() =>
                                                        handleEditBarangKeluar(
                                                          item.id
                                                        )
                                                      }
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
                                      {!showAllDetails[group.nama_barang] &&
                                        group.items.length >
                                          detailItemsPerPage && (
                                          <div className="mt-3 d-flex justify-content-center p-3 bg-light">
                                            <Pagination
                                              pageCount={Math.ceil(
                                                group.items.length /
                                                  detailItemsPerPage
                                              )}
                                              onPageChange={(data) =>
                                                handleDetailPageChange(
                                                  group.nama_barang,
                                                  data.selected
                                                )
                                              }
                                              forcePage={
                                                detailPages[
                                                  group.nama_barang
                                                ] || 0
                                              }
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
      </AdminLayout>

      <Modal
        className="custom-modal p-5"
        show={showModal}
        onHide={handleModalClose}
      >
        <Modal.Header className="bg-p-4" closeButton>
          <Modal.Title>
            {currentId ? "Edit Barang Keluar" : "Tambah Barang Keluar"}
          </Modal.Title>
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
