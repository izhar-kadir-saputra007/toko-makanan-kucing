import { useState, useEffect } from "react";
import { Table, Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Swal from "sweetalert2";

const DataBarangPage = () => {
  const [showModal, setShowModal] = useState(false); // State untuk modal
  const [barangs, setBarangs] = useState([]); // State untuk menyimpan data barang
  const [selectedBarang, setSelectedBarang] = useState(null); // State untuk barang yang dipilih
  const [loading, setLoading] = useState(false); // State untuk loading
  const [isEdit, setIsEdit] = useState(false); // State untuk membedakan tambah/edit barang
  const [eoqData, setEoqData] = useState([]);
  const [suppliers, setSuppliers] = useState([]); // State untuk menyimpan data supplier
  const [selectedFile, setSelectedFile] = useState(null); // State untuk file gambar
  const [previewImage, setPreviewImage] = useState(null); // State untuk preview gambar

  // Fungsi untuk mengambil data dari localStorage
  const getEoqDataFromLocalStorage = () => {
    try {
      const savedData = JSON.parse(localStorage.getItem('eoqData')) || [];
      setEoqData(savedData);
      return savedData;
    } catch (err) {
      console.error('Error reading from localStorage:', err);
      return [];
    }
  };

  // Fungsi untuk mendapatkan ROP dan Safety Stock berdasarkan data_barang_id
  const getEoqInfoByBarangId = (barangId) => {
    // Cari data yang memiliki data_barang_id sama dengan barangId
    const foundData = eoqData.find(item => item.data_barang_id == barangId);
    
    return {
      rop: foundData?.Rop !== undefined ? foundData.Rop : '-',
      safetyStock: foundData?.safetyStock !== undefined ? foundData.safetyStock : '-'
    };
  };

  // Fungsi untuk membuka modal tambah/edit barang
  const handleModalOpen = (barang = null) => {
    setSelectedBarang(barang || {}); // Jika barang null, inisialisasi objek kosong
    setIsEdit(!!barang); // Tentukan apakah ini edit atau tambah barang
    setSelectedFile(null); // Reset file yang dipilih
    
    // Set preview image jika edit dan ada gambar
    if (barang && barang.gambar) {
      setPreviewImage(`http://localhost:4000${barang.gambar}`);
    } else {
      setPreviewImage(null);
    }
    
    setShowModal(true); // Buka modal
  };

  // Fungsi untuk menutup semua modal
  const handleModalClose = () => {
    setSelectedBarang(null); // Reset barang yang dipilih
    setSelectedFile(null); // Reset file yang dipilih
    setPreviewImage(null); // Reset preview image
    setShowModal(false); // Tutup modal
  };

  // Fungsi untuk handle perubahan file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (maksimal 2MB)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File terlalu besar!",
          text: "Ukuran gambar maksimal 2MB",
          showConfirmButton: false,
          timer: 2000,
        });
        e.target.value = '';
        return;
      }

      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Format file tidak valid!",
          text: "Hanya file JPEG, PNG, dan JPG yang diperbolehkan",
          showConfirmButton: false,
          timer: 2000,
        });
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      
      // Buat preview image
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch data barang dari server
  const fetchDataBarang = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("Token tidak ditemukan");
        return;
      }

      const response = await axios.get("http://localhost:4000/api/getAllBarang", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBarangs(response.data.data);
      console.log("Barang fetched successfully:", response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token tidak ditemukan");
        return;
      }

      const response = await axios.get("http://localhost:4000/api/getSuppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuppliers(response.data.data);
      console.log("Suppliers fetched successfully:", response.data.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  // Submit data barang (tambah/edit)
  const handleSubmitBarang = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("Token tidak ditemukan");
        return;
      }

      // Buat FormData untuk mengirim file
      const formData = new FormData();
      
      // Tambahkan data barang ke FormData
      Object.keys(selectedBarang).forEach(key => {
        if (selectedBarang[key] !== null && selectedBarang[key] !== undefined) {
          formData.append(key, selectedBarang[key]);
        }
      });

      // Tambahkan file gambar jika ada
      if (selectedFile) {
        formData.append('gambar', selectedFile);
      }

      const url = isEdit
        ? `http://localhost:4000/api/updateBarang/${selectedBarang.id}`
        : `http://localhost:4000/api/addBarang`;

      const method = isEdit ? "put" : "post";

      const response = await axios({
        method,
        url,
        data: formData,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      // Tampilkan SweetAlert sukses
      Swal.fire({
        icon: "success",
        title: isEdit
          ? "Barang berhasil diperbarui!"
          : "Barang baru berhasil ditambahkan!",
        text: response.data.message,
        showConfirmButton: false,
        timer: 1500,
      });

      fetchDataBarang(); // Refresh data barang
      handleModalClose(); // Tutup modal
      console.log("Barang berhasil disimpan:", response.data);
    } catch (error) {
      console.error("Error submitting barang:", error);

      // Tampilkan SweetAlert error
      Swal.fire({
        icon: "error",
        title: "Terjadi kesalahan!",
        text: error.response?.data?.message || "Gagal menyimpan data barang. Silakan coba lagi.",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  };

  // Menghandle perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedBarang((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteBarang = async (id) => {
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

          const response = await axios.delete(`http://localhost:4000/api/deleteBarang/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          Swal.fire({
            icon: "success",
            title: "Barang berhasil dihapus!",
            text: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          });

          fetchDataBarang();
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
    fetchDataBarang();
    fetchSuppliers();
    getEoqDataFromLocalStorage();
  }, []);

  return (
    <div>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ paddingTop: "10px", margin: "0", width: "90vw" }}
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
              <h2>Data Barang</h2>
              <button
                className="btn btn-primary-color"
                onClick={() => handleModalOpen()}
              >
                <i className="ri-file-add-fill"> Tambah Barang</i>
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
                      <th>Gambar</th>
                      <th>Nama Barang</th>
                      <th>Supplier</th>
                      {/* <th>Harga Beli/Unit</th>
                      <th>Harga jual/Unit</th> */}
                      {/* <th>Stock Akhir</th> */}
                      <th>ROP</th>
                      <th>Safety Stock</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barangs.map((barang, index) => {
                      const formattedDate = new Date(barang.updatedAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      });
                      
                      // Dapatkan ROP dan Safety Stock untuk barang ini
                      const eoqInfo = getEoqInfoByBarangId(barang.id);
                      
                      return (
                        <tr key={barang.id}>
                          <td>{index + 1}</td>
                          <td>
                            {barang.gambar ? (
                              <img 
                                src={`http://localhost:4000${barang.gambar}`} 
                                alt={barang.name}
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  objectFit: 'cover',
                                  borderRadius: '5px'
                                }}
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                                }}
                              />
                            ) : (
                              <div 
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  backgroundColor: '#f8f9fa',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '5px',
                                  border: '1px solid #dee2e6'
                                }}
                              >
                                <i className="ri-image-line" style={{ color: '#6c757d' }}></i>
                              </div>
                            )}
                          </td>
                          <td>{barang.name}</td>
                          <td>{barang.Supplier?.name || '-'}</td>
                          {/* <td>
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(barang.unit_price)}
                          </td>
                          <td>
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(barang.harga_jual)}
                          </td> */}
                          {/* <td>{barang.total_quantity} sak</td> */}
                          <td>{eoqInfo.rop}</td>
                          <td>{eoqInfo.safetyStock}</td>
                          <td className="d-flex">
                            <div>
                              <i 
                                className="aksi-delete ri-delete-bin-6-line text-danger btn btn-link"
                                style={{ fontSize: "25px" }}
                                onClick={() => handleDeleteBarang(barang.id)}
                              >
                              </i>
                            </div>
                            <div 
                              className="btn btn-link"
                              onClick={() => handleModalOpen(barang)}
                            >
                              <i className="aksi btn btn-link ri-edit-fill"></i>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Barang */}
      <Modal className="custom-modal p-5" show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit ? "Ubah Barang" : "Tambah Barang Baru"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body p-5 text-2xl">
          <Form onSubmit={handleSubmitBarang}>
            
            {/* Input Gambar */}
            <Form.Group className="mb-3">
              <Form.Label>Gambar Barang</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                Format yang diperbolehkan: JPEG, PNG, JPG. Maksimal 2MB.
              </Form.Text>
              
              {/* Preview Gambar */}
              {previewImage && (
                <div className="mt-3">
                  <p className="mb-2">Preview:</p>
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }} 
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nama Barang</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={selectedBarang?.name || ""}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Supplier</Form.Label>
              <Form.Select
                name="supplier_id"
                value={selectedBarang?.supplier_id || ""}
                onChange={handleInputChange}
              >
                <option value="">Pilih Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Harga Beli</Form.Label>
              <Form.Control
                type="number"
                name="unit_price"
                value={selectedBarang?.unit_price || ""}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Harga Jual</Form.Label>
              <Form.Control
                type="number"
                name="harga_jual"
                value={selectedBarang?.harga_jual || ""}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Jumlah Barang</Form.Label>
              <Form.Control
                type="number"
                name="total_quantity"
                value={selectedBarang?.total_quantity || ""}
                onChange={handleInputChange}
                required
              />
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
    </div>
  );
};

export default DataBarangPage;