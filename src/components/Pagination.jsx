import ReactPaginate from "react-paginate";
import PropTypes from "prop-types"; // Untuk validasi props

const Pagination = ({ pageCount, onPageChange }) => {
  const customStyles = {
    pagination: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "10px",
    },
    pageItem: {
      margin: "0 5px",
    },
    pageLink: {
      color: "#111641",
      backgroundColor: "#7400B8",
      border: "1px solid #ddd",
    },
    pageLinkHover: {
      color: "#7400B8",
      backgroundColor: "#111641",
      borderColor: "#111641",
    },
    activePageLink: {
      color: "#7400B8",
      backgroundColor: "#111641",
      borderColor: "#111641",
    },
    disabledPageLink: {
      color: "#ccc",
      backgroundColor: "#f8f9fa",
      borderColor: "#ccc",
    },
  };

  return (
    <ReactPaginate
      previousLabel={"<<"}
      nextLabel={">>"}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination justify-content-end"}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link"}
      previousClassName={"page-item"}
      previousLinkClassName={"page-link"}
      nextClassName={"page-item"}
      nextLinkClassName={"page-link"}
      breakClassName={"page-item"}
      breakLinkClassName={"page-link"}
      activeClassName={"active"}
      style={customStyles.pagination} // Menggunakan custom styles
    />
  );
};

// Validasi tipe props
Pagination.propTypes = {
    pageCount: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination