import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Table, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import AdminLayout from '../components/AdminLayout';
import  ModalsEOQ from '../components/ModalsEOQ';

const DataEOQ = () => {
  const [dataEoq, setDataEoq] = useState([]);
  const [showEOQModal, setShowEOQModal] = useState(false);
  const [selectedEOQId, setSelectedEOQId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [barangOptions, setBarangOptions] = useState([]); 
  const [formData, setFormData] = useState({
    name: "",
    barang_id: "",
    costCCHijau: "",
    costCCPink: "",
    ongkosKirim: "",
    costKaryawan: "",
    costGudang: "",
    costListrik: "",
    eoq: "",
    frekuensiPemesanan: "",
    LeadTime: "",
    hariKerja: "",
    biayaKehabisan: "",
    StanderDeviasi: ""
  });

  const fetchBarangOptions = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get("http://localhost:4000/api/getAllBarang", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBarangOptions(response.data.data);
    } catch (err) {
      console.error("Error fetching barang options:", err);
    }
  };

  const calculateBarangKeluar = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(
        `http://localhost:4000/api/calculateBarangKeluar/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchDataEoq();
    } catch (err) {
      console.error("Error calculating barang keluar:", err);
    }
  };

  const calculatePemakaianTahunanMasuk = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
   await axios.patch(
        `http://localhost:4000/api/calculatePemakaianTahunanMasuk/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchDataEoq();

    } catch (err) {
      console.error("Error calculating pemakaian tahunan:", err);
    }
  };

  const calculateStandarDeviasi = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        `http://localhost:4000/api/barang-keluar/deviasi/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        console.log("Standar deviasi berhasil dihitung:", response.data.data);
        fetchDataEoq();
      } else {
        console.error("Gagal menghitung standar deviasi:", response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Unauthorized! Silakan login ulang.");
        // Tambahkan mekanisme logout atau redirect ke halaman login
      } else {
        console.error("Error calculating standar deviasi:", err);
      }
    }
  };
  const calculateCost = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        `http://localhost:4000/api/calculateCostCC/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("Response:", response.data);
  
      // Periksa apakah respons memiliki pesan yang menunjukkan keberhasilan
      if (response.data.message.includes("calculated and updated successfully")) {
        console.log("Biaya berhasil dihitung:", response.data.data);
        fetchDataEoq(); // Memperbarui data
      } else {
        console.error("Gagal menghitung biaya:", response.data.message);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.error("Unauthorized! Silakan login ulang.");
        // Tambahkan mekanisme logout atau redirect ke halaman login
      } else {
        console.error("Error calculating biaya:", err);
      }
    }
  };
    const handleEOQModalOpen = async (id) => {
    setSelectedEOQId(id);
    setShowEOQModal(true);
    await calculateBarangKeluar(id);
    await calculatePemakaianTahunanMasuk(id);
    await calculateStandarDeviasi(id); // Tambahkan pemanggilan API standar deviasi
    await calculateCost(id);
  };

  const handleEOQModalClose = () => {
    setShowEOQModal(false);
    setSelectedEOQId(null);
  };

  const fetchDataEoq = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "http://localhost:4000/api/getAllDataEoq",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDataEoq(response.data.data);
      } else {
        throw new Error(response.data.message || "Gagal mengambil data");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (item = null) => {
    if (item) {
      setFormData({
        barang_id: item.barang_id,
        costCCHijau: item.costCCHijau,
        costCCPink: item.costCCPink,
        ongkosKirim: item.ongkosKirim,
        costKaryawan: item.costKaryawan,
        costGudang: item.costGudang,
        costListrik: item.costListrik,
        eoq: item.eoq,
        frekuensiPemesanan: item.frekuensiPemesanan,
        LeadTime: item.LeadTime,
        hariKerja: item.hariKerja,
        biayaKehabisan: item.biayaKehabisan,
        StanderDeviasi: item.StanderDeviasi
      });
    } else {
      setFormData({
        barang_id: "",
        costCCHijau: "",
        costCCPink: "",
        ongkosKirim: "",
        costKaryawan: "",
        costGudang: "",
        costListrik: "",
        eoq: "",
        frekuensiPemesanan: "",
        LeadTime: "",
        hariKerja: "",
        biayaKehabisan: "",
        StanderDeviasi: ""
      });
    }
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFormData({
      barang_id: "",
      costCCHijau: "",
      costCCPink: "",
      ongkosKirim: "",
      costKaryawan: "",
      costGudang: "",
      costListrik: "",
      eoq: "",
      frekuensiPemesanan: "",
      LeadTime: "",
      hariKerja: "",
      biayaKehabisan: "",
      StanderDeviasi: ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("accessToken");
      const url = formData.barang_id
        ? `http://localhost:4000/api/updateDataEoq/${formData.barang_id}`
        : "http://localhost:4000/api/addDataEoq";
  
      // Menentukan metode HTTP
      const method = formData.barang_id ? "put" : "post";
  
      // Untuk POST, hanya kirim `name`; untuk PUT, kirim semua data
      const payload = formData.barang_id
        ? formData // Mengirim semua data untuk update
        : { name: formData.name }; // Mengirim hanya `name` untuk penambahan data baru
  
      // Melakukan permintaan HTTP menggunakan Axios
      const response = await axios[method](
        url,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      //tampilkan sweet alert sukses
      Swal.fire({
        icon: "success",
        title: response.data.message || "Data EOQ berhasil disimpan",
        showConfirmButton: false,
        timer: 1500
      });
        handleModalClose(); // Tutup modal setelah sukses
        fetchDataEoq(); // Memuat ulang data EOQ
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan");
    }
  };

  useEffect(() => {
    fetchBarangOptions();
    fetchDataEoq();
  }, []);

  return (
    <AdminLayout>
      <div className="d-flex align-items-center justify-content-center"
           style={{ paddingTop: "100px", margin: "0", width: "93vw" }}>
        <div className="d-flex flex-column p-4 shadow bg-white" style={{ minWidth: "100%" }}>
          <div className="d-flex flex-column rounded bg-white p-4 shadow-lg m-2">
            <div className="header p-2 d-flex flex-row justify-content-between border-bottom border-secondary mb-2"
                 style={{ width: "95%", margin: "0 auto" }}>
              <h2>Data EOQ</h2>
              <div className="d-flex flex-row gap-3">
                <button className="btn btn-primary-color-icon">
                  <i className="ri-file-download-line">unduh</i>
                </button>
                <button className="btn btn-primary-color" onClick={() => handleModalOpen()}>
                  <i className="ri-file-add-fill"> Tambah Data EOQ</i>
                </button>
              </div>
            </div>

            <div className="konten pt-4" style={{ width: "95%", margin: "0 auto" }}>
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Memuat data...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Nama barang</th>
                      <th scope="col">Deman Barang Keluar</th>
                      <th scope="col">Deman Barang Masuk</th>
                      <th scope="col">Cost CC Hijau</th>
                      <th scope="col">Cost CC Pink</th>
                      <th scope="col">Ongkos Kirim</th>
                      <th scope="col">Cost Karyawan</th>
                      <th scope="col">Cost Gudang</th>
                      <th scope="col">Cost Listrik</th>
                      <th scope="col">Frekuensi Pemesanan</th>
                      <th scope="col">Lead Time</th>
                      <th scope="col">Hari Kerja</th>
                      <th scope="col">Biaya Kehabisan</th>
                      <th scope="col">Standar Deviasi</th>
                      <th scope="col">EOQ</th>
                      <th scope="col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataEoq.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td>{item.Barang?.name}</td>
                        <td>{item.demanbarangKeluar}</td>
                        <td>{item.demanbarangMasuk}</td>
                        <td>{new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.costCCHijau)}</td>
                        <td>{new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.costCCPink)}</td>
                        <td>{new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.ongkosKirim)}</td>
                        <td>{new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.costKaryawan)}</td>
                        <td>{new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.costGudang)}</td>
                        <td>{new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.costListrik)}{}</td>
                        <td>{item.frekuensiPemesanan}</td>
                        <td>{item.LeadTime}</td>
                        <td>{item.hariKerja}</td>
                        <td>{new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(item.biayaKehabisan)}</td>
                        <td>{item.StanderDeviasi}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEOQModalOpen(item.id)}
                            aria-label={`Lihat EOQ ${item.Barang?.name}`}
                          >
                            EOQ
                          </Button>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-link"
                            onClick={() => handleModalOpen(item)}
                            aria-label={`Edit ${item.Barang?.name}`}
                          >
                            <i className=" aksi ri-edit-fill"
                             style={{ fontSize: "25px" }}></i>
                          </button>
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
      {/* Modal Form */}
      <Modal className="custom-modal p-5" show={showModal} onHide={handleModalClose}>
  <Modal.Header className="bg-p-4" closeButton>
    <Modal.Title>
      {formData.barang_id ? "Update Data EOQ" : "Tambah Data EOQ"}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body className="custom-modal-body p-5 text-2xl">
    <Form onSubmit={handleSubmit}>
      {/* Nama Barang (Hanya untuk Tambah Data) */}
      {!formData.barang_id && (
         <Form.Group className="mb-3" controlId="name">
         <Form.Label>Nama Barang</Form.Label>
         <Form.Control as="select" name="name" value={formData.name} onChange={handleChange} required>
           <option value="">Pilih Nama Barang</option>
           {barangOptions.map((barang) => (
             <option key={barang.id} value={barang.name}>
               {barang.name}
             </option>
           ))}
         </Form.Control>
       </Form.Group>
      )}

      {/* Input Data (Hanya untuk Update Data) */}
      {formData.barang_id && (
        <>
          <Form.Group className="mb-3" controlId="ongkosKirim">
            <Form.Label>Ongkos Kirim</Form.Label>
            <Form.Control
              type="number"
              name="ongkosKirim"
              value={formData.ongkosKirim}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="costKaryawan">
            <Form.Label>Cost Karyawan</Form.Label>
            <Form.Control
              type="number"
              name="costKaryawan"
              value={formData.costKaryawan}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="costGudang">
            <Form.Label>Cost Gudang</Form.Label>
            <Form.Control
              type="number"
              name="costGudang"
              value={formData.costGudang}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="costListrik">
            <Form.Label>Cost Listrik</Form.Label>
            <Form.Control
              type="number"
              name="costListrik"
              value={formData.costListrik}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="frekuensiPemesanan">
            <Form.Label>Frekuensi Pemesanan</Form.Label>
            <Form.Control
              type="number"
              name="frekuensiPemesanan"
              value={formData.frekuensiPemesanan}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="LeadTime">
            <Form.Label>Lead Time</Form.Label>
            <Form.Control
              type="number"
              name="LeadTime"
              value={formData.LeadTime}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="hariKerja">
            <Form.Label>Hari Kerja</Form.Label>
            <Form.Control
              type="number"
              name="hariKerja"
              value={formData.hariKerja}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="biayaKehabisan">
            <Form.Label>Biaya Kehabisan</Form.Label>
            <Form.Control
              type="number"
              name="biayaKehabisan"
              value={formData.biayaKehabisan}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>
        </>
      )}
      <div className="mt-4">
        <Button className="me-2" variant="primary" type="submit">
          {formData.barang_id ? "Simpan Perubahan" : "Tambah"}
        </Button>
        <Button variant="secondary" onClick={handleModalClose}>
          Batal
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

      {/* Modal EOQ */}
      <ModalsEOQ
        show={showEOQModal}
        handleClose={handleEOQModalClose}
        dataId={selectedEOQId}
      />
    </AdminLayout>
  );
};

export default DataEOQ;