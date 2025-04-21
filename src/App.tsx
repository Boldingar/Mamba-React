import React, { useState, useEffect } from "react";
import { ThemeProvider, CssBaseline, Box, Button } from "@mui/material";
import { theme } from "./theme";
import ChatInterface from "./components/ChatInterface";
import DataPanel from "./components/DataPanel";

interface Data {
  [key: string]: string | number;
}

interface CSVDataset {
  id: string;
  name: string;
  displayName: string;
  timestamp: Date;
  data: Data[];
}

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [datasets, setDatasets] = useState<CSVDataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load sample CSV files on component mount (for testing)
  useEffect(() => {
    const loadCSVFiles = async () => {
      // Prevent multiple loads
      if (isLoading || datasets.length > 0) return;
      setIsLoading(true);

      try {
        const filesToLoad = [
          { path: "/src/data/sample.csv", name: "Business Data" },
          { path: "/src/data/employees.csv", name: "Employee Records" },
        ];

        const loadCSVFile = async (path: string, name: string) => {
          try {
            const response = await fetch(path);
            const csvText = await response.text();
            const parsedData = parseCSV(csvText);
            return { name, data: parsedData };
          } catch (error) {
            console.error(`Error loading ${name}:`, error);
            return null;
          }
        };

        const results = await Promise.all(
          filesToLoad.map((file) => loadCSVFile(file.path, file.name))
        );

        // Process all results at once
        const validResults = results.filter(
          (result): result is { name: string; data: Data[] } => result !== null
        );

        if (validResults.length > 0) {
          const timestamp = new Date();
          const newDatasets = validResults.map(({ name, data }, index) => ({
            id: `dataset-${index}-${timestamp.getTime()}`,
            name,
            displayName: `${name} (${formatTimestamp(timestamp)})`,
            timestamp,
            data,
          }));

          setDatasets(newDatasets);
          setSelectedDatasetId(newDatasets[0].id);
          setIsPanelOpen(true);
        }
      } catch (error) {
        console.error("Error loading CSV files:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCSVFiles();
  }, []); // Empty dependency array ensures this only runs once

  const parseCSV = (csvText: string): Data[] => {
    const rows = csvText.split("\n");
    const headers = rows[0].split(",").map((header) => header.trim());

    return rows
      .slice(1)
      .filter((row) => row.trim())
      .map((row) => {
        const values = row.split(",");
        return headers.reduce((obj, header, index) => {
          const value = values[index]?.trim() || "";
          obj[header] =
            !isNaN(Number(value)) && header !== "Employee ID"
              ? Number(value)
              : value;
          return obj;
        }, {} as Data);
      });
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Handle dataset selection
  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };

  // Get the currently selected dataset
  const selectedDataset = datasets.find((ds) => ds.id === selectedDatasetId);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <ChatInterface />

        {/* Show CSV button when data is available */}
        {datasets.length > 0 && (
          <Button
            variant="contained"
            onClick={() => setIsPanelOpen(true)}
            sx={{ position: "fixed", top: 20, right: 20, zIndex: 1200 }}
          >
            Show CSV Data ({datasets.length})
          </Button>
        )}

        {/* Data Panel */}
        <DataPanel
          open={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onDatasetSelect={handleDatasetSelect}
          data={selectedDataset?.data || []}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
