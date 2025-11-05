import { Modal, Button, Spinner, Alert, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";

const ModalsEOQ = ({ show, handleClose, dataId }) => {
  const [eoqData, setEoqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format angka ke format rupiah
  const formatRupiah = (angka) => {
    if (!angka || isNaN(angka)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(angka);
  };

  // Fungsi untuk menyimpan data ke localStorage
  // Fungsi untuk menyimpan data ke localStorage
  const saveToLocalStorage = (data, barangId) => {
    try {
      // Ambil data yang sudah tersimpan atau buat array kosong jika belum ada
      const existingData = JSON.parse(localStorage.getItem("eoqData")) || [];

      // Cek apakah data dengan ID yang sama sudah ada
      const existingIndex = existingData.findIndex(
        (item) => item.id === data.id
      );

      const dataToSave = {
        id: data.id,
        data_barang_id: barangId, // Tambahkan data_barang_id
        Rop: data.Rop,
        safetyStock: data.safetyStock,
      };

      if (existingIndex >= 0) {
        // Update data yang sudah ada
        existingData[existingIndex] = dataToSave;
      } else {
        // Tambahkan data baru
        existingData.push(dataToSave);
      }

      // Simpan kembali ke localStorage
      localStorage.setItem("eoqData", JSON.stringify(existingData));
      console.log("Data berhasil disimpan ke localStorage:", dataToSave);
    } catch (err) {
      console.error("Gagal menyimpan ke localStorage:", err);
    }
  };

  const fetchEOQData = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      console.log("Fetching data for ID:", id);

      const response = await axios.get(
        `http://localhost:4000/api/hitungBiayaPesan/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Response:", response.data);

      if (response.data.success) {
        const data = response.data.data;
        setEoqData(data);

        // Simpan data ke localStorage termasuk data_barang_id
        saveToLocalStorage(data, response.data.data_barang_id);
      } else {
        throw new Error(response.data.message || "Gagal mengambil data");
      }
    } catch (err) {
      console.error("Error fetching EOQ data:", err);
      if (err.response?.status === 401) {
        setError("Sesi telah berakhir. Silakan login kembali");
      } else {
        setError(err.message || "Terjadi kesalahan saat mengambil data");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const response = await axios.get(
        `http://localhost:4000/api/unduhLaporanEoq/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // Menentukan bahwa respons adalah file (binary data)
        }
      );

      // Membuat URL untuk file PDF yang diterima
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);

      // Membuka file PDF di tab baru
      const link = document.createElement("a");
      link.href = fileURL;
      link.target = "_blank";
      link.download = `laporan_eoq_${id}.pdf`;
      link.click();
    } catch (err) {
      console.error("Error downloading PDF:", err);
      setError("Gagal mengunduh laporan PDF.");
    }
  };

  useEffect(() => {
    if (show && dataId) {
      console.log("Modal opened with ID:", dataId); // Debug log
      fetchEOQData(dataId);
    } else {
      // Reset state when modal is closed
      setEoqData(null);
      setError(null);
      setLoading(true);
    }
  }, [show, dataId]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      aria-labelledby="eoq-modal-title"
    >
      <Modal.Header closeButton>
        <Modal.Title id="eoq-modal-title">Detail Data EOQ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Memuat data...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : eoqData ? (
          <div className="d-flex flex-column">
            <h5>Hasil Perhitungan EOQ</h5>
            <Table striped bordered hover responsive>
              <tbody>
                <tr>
                  <td>
                    <strong>Biaya Pesan (S)</strong>
                  </td>
                  <td>{formatRupiah(eoqData.biayaPesan)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Biaya Simpan (H)</strong>
                  </td>
                  <td>{formatRupiah(eoqData.biayaSimpan)}</td>
                </tr>
                {/* <tr>
                  <td><strong>Pembelian Rata-Rata (Q*)</strong></td>
                  <td>{eoqData.pembelianRataRata}</td>
                </tr> */}
                {/* <tr>
                  <td><strong>Total Biaya Persediaan (TIC)</strong></td>
                  <td>{formatRupiah(eoqData.totalBiayaPersediaan)}</td>
                </tr> */}
                <tr>
                  <td>
                    <strong>Metode EOQ</strong>
                  </td>
                  <td>{eoqData.metodeEoq}</td>
                </tr>
                <tr>
                  <td>
                    <strong>
                      frekuensi pemesanan rata-rata menggunakan EOQ (F)
                    </strong>
                  </td>
                  <td>{eoqData.frekuensiPemesananRatarata}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Pembelian Rata-Rata Menggunakan EOQ</strong>
                  </td>
                  <td>{eoqData.pembelianRataRataQ}</td>
                </tr>
                <tr>
                  <td>
                    <strong>
                      Total Biaya Persediaan (TIC) Menggunakan EOQ
                    </strong>
                  </td>
                  <td>{formatRupiah(eoqData.totalBiayaPersediaanQ)}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Peluang Kehabisan Persediaan</strong>
                  </td>
                  <td>{eoqData.peluangKehabisanPersediaan}%</td>
                </tr>
                <tr>
                  <td>
                    <strong>Faktor Keamanan</strong>
                  </td>
                  <td>{eoqData.faktorKeamanan}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Safety Stock</strong>
                  </td>
                  <td>{eoqData.safetyStock}</td>
                </tr>
                <tr>
                  <td>
                    <strong>ROP</strong>
                  </td>
                  <td>{eoqData.Rop}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Efisiensi</strong>
                  </td>
                  <td>
                    {(
                      ((eoqData.totalBiayaPersediaan -
                        eoqData.totalBiayaPersediaanQ) *
                        100) /
                      eoqData.totalBiayaPersediaan
                    ).toFixed(2)}
                    %
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        ) : (
          <Alert variant="info">Tidak ada data yang ditampilkan</Alert>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="secondary" onClick={handleClose}>
          Tutup
        </Button>
        <Button
          className="btn btn-primary-color"
          variant="primary"
          onClick={() => downloadPDF(dataId)}
        >
          Unduh PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalsEOQ;
