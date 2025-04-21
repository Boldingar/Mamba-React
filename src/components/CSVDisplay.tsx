import React, { useState, useEffect } from "react";
import { Box, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessDataTable from "./BusinessDataTable";

interface Data {
  [key: string]: string | number;
}

interface CSVDisplayProps {
  open: boolean;
  onClose: () => void;
}

const CSVDisplay: React.FC<CSVDisplayProps> = ({ open, onClose }) => {
  const [data, setData] = useState<Data[]>([]);
  const [filteredData, setFilteredData] = useState<Data[]>([]);

  useEffect(() => {
    // In a real application, you would fetch this data from the CSV file
    fetch("/src/data/sample.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n");
        const headers = rows[0].split(",").map((header) => header.trim());

        const parsedData = rows.slice(1).map((row) => {
          const values = row.split(",");
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index]?.trim() || "";
            return obj;
          }, {} as Data);
        });
        setData(parsedData);
        setFilteredData(parsedData);
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, []);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: "80%", maxWidth: "1000px" },
      }}
    >
      <Box
        sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6">Business Data</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <BusinessDataTable data={data} onDataFilter={setFilteredData} />
      </Box>
    </Drawer>
  );
};

export default CSVDisplay;
