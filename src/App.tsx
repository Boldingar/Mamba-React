import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, Box, Button } from "@mui/material";
import { theme } from "./theme";
import ChatInterface from "./components/ChatInterface";
import DataPanel from "./components/DataPanel";

interface Data {
  [key: string]: string | number;
}

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [csvData, setCsvData] = useState<Data[]>([]);
  const [hasCSVData, setHasCSVData] = useState(false);

  // Load sample CSV data on component mount
  useEffect(() => {
    fetch("/src/data/sample.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.split("\n");
        const headers = rows[0].split(",").map((header) => header.trim());

        const parsedData = rows
          .slice(1)
          .filter((row) => row.trim()) // Skip empty rows
          .map((row) => {
            const values = row.split(",");
            return headers.reduce((obj, header, index) => {
              // Try to convert to number if possible
              const value = values[index]?.trim() || "";
              obj[header] = !isNaN(Number(value)) ? Number(value) : value;
              return obj;
            }, {} as Data);
          });

        handleCSVData(parsedData);
      })
      .catch((error) => console.error("Error loading CSV:", error));
  }, []);

  // This function will be called when CSV data is received from the endpoint
  const handleCSVData = (data: Data[]) => {
    setCsvData(data);
    setHasCSVData(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <ChatInterface />

        {/* Show CSV button when data is available */}
        {hasCSVData && (
          <Button
            variant="contained"
            onClick={() => setIsPanelOpen(true)}
            sx={{ position: "fixed", top: 20, right: 20, zIndex: 1200 }}
          >
            Show CSV
          </Button>
        )}

        {/* Data Panel */}
        <DataPanel
          open={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          data={csvData}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
