import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modals from "react-bootstrap/Modal";

const TambahBarangModals = () => {

    const [show, setShow] = useState(false);

  const [barang, setBarang] = useState({
    nama: "",
    kategori: "",
    harga: "",
    jumlah: "",
  });

  // Fungsi untuk menangani input perubahan
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBarang({
      ...barang,
      [name]: value,
    });
  };

  // Fungsi untuk submit data barang
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data Barang:", barang); // Ganti ini dengan logika pengiriman ke server
    handleClose(); // Tutup modal setelah submit
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
     <div className="container mt-5">
      <h1>Input Data Barang</h1>
      <Button variant="primary" onClick={handleShow}>
        Tambah Data Barang
      </Button>

      {/* Modal */}
      <Modals show={show} handleClose={handleClose} title="Form Input Data Barang">
        <Form onSubmit={handleSubmit}>
          {/* Input Nama Barang */}
          <Form.Group className="mb-3" controlId="formNamaBarang">
            <Form.Label>Nama Barang</Form.Label>
            <Form.Control
              type="text"
              name="nama"
              placeholder="Masukkan nama barang"
              value={barang.nama}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Input Kategori Barang */}
          <Form.Group className="mb-3" controlId="formKategoriBarang">
            <Form.Label>Kategori Barang</Form.Label>
            <Form.Control
              type="text"
              name="kategori"
              placeholder="Masukkan kategori barang"
              value={barang.kategori}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Input Harga Barang */}
          <Form.Group className="mb-3" controlId="formHargaBarang">
            <Form.Label>Harga Barang</Form.Label>
            <Form.Control
              type="number"
              name="harga"
              placeholder="Masukkan harga barang"
              value={barang.harga}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Input Jumlah Barang */}
          <Form.Group className="mb-3" controlId="formJumlahBarang">
            <Form.Label>Jumlah Barang</Form.Label>
            <Form.Control
              type="number"
              name="jumlah"
              placeholder="Masukkan jumlah barang"
              value={barang.jumlah}
              onChange={handleChange}
              required
            />
          </Form.Group>

          {/* Tombol Submit */}
          <Button variant="primary" type="submit">
            Simpan Data
          </Button>
        </Form>
      </Modals>
    </div>
    </>
  )
}

export default TambahBarangModals