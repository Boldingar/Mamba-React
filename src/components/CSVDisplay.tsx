import React, { useState } from "react";
import "../styles/CSVDisplay.css";

interface CSVDisplayProps {
  data: {
    columns: string[];
    data: any[][];
  };
}

const CSVDisplay: React.FC<CSVDisplayProps> = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const totalPages = Math.ceil(data.data.length / rowsPerPage);
  const startRow = (currentPage - 1) * rowsPerPage;
  const endRow = startRow + rowsPerPage;
  const currentPageData = data.data.slice(startRow, endRow);

  const handleDownload = () => {
    // Implementation for downloading CSV
    // This would be similar to the original JavaScript download function
  };

  return (
    <div className="right-column">
      <h2>Generated Data</h2>
      <button id="download-csv-btn" onClick={handleDownload}>
        Download CSV
      </button>
      <div className="csv-table-container">
        <table id="csv-table">
          <thead>
            <tr>
              {data.columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &laquo; Previous
          </button>
          <span id="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default CSVDisplay;
