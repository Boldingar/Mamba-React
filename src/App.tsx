import React, { useState, useEffect } from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Button,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { theme } from "./theme";
import ChatInterface from "./components/ChatInterface";
import DataPanel from "./components/DataPanel";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";

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

const ScrollbarStyle = {
  "&::-webkit-scrollbar": {
    width: "8px",
    backgroundColor: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(155, 155, 155, 0.5)",
    borderRadius: "10px",
    "&:hover": {
      backgroundColor: "rgba(155, 155, 155, 0.7)",
    },
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
    border: "none",
  },
  "&::-webkit-scrollbar-corner": {
    backgroundColor: "transparent",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
};

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [datasets, setDatasets] = useState<CSVDataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Load sample CSV files on component mount (for testing)
  useEffect(() => {
    const loadCSVFiles = async () => {
      // Prevent multiple loads
      if (isLoading || datasets.length > 0) return;
      setIsLoading(true);
      setError(null);

      try {
        const filesToLoad = [
          { path: "/src/data/sample.csv", name: "Business Data" },
          { path: "/src/data/employees.csv", name: "Employee Records" },
        ];

        const loadCSVFile = async (path: string, name: string) => {
          try {
            const response = await fetch(path);

            // Check if the file was found
            if (!response.ok) {
              throw new Error(`File not found: ${path} (${response.status})`);
            }

            const contentType = response.headers.get("content-type");
            // Check if we're getting HTML instead of CSV (error page)
            if (contentType && contentType.includes("text/html")) {
              throw new Error(
                `Invalid response: Got HTML instead of CSV for ${path}`
              );
            }

            const csvText = await response.text();

            // Basic CSV validation
            if (!csvText.trim()) {
              throw new Error(`Empty file: ${path}`);
            }

            // Check if the content looks like HTML (additional safety check)
            if (
              csvText.toLowerCase().includes("<!doctype html") ||
              csvText.toLowerCase().includes("<html")
            ) {
              throw new Error(
                `Invalid response: Got HTML content instead of CSV for ${path}`
              );
            }

            // Validate CSV structure
            const lines = csvText.split("\n").filter((line) => line.trim());
            if (lines.length < 2) {
              throw new Error(
                `Invalid CSV: File contains no data rows (${path})`
              );
            }

            const headers = lines[0].split(",");
            if (headers.length < 1) {
              throw new Error(`Invalid CSV: No headers found (${path})`);
            }

            // Validate that all rows have the same number of columns
            const headerCount = headers.length;
            const invalidRow = lines.find(
              (line) => line.split(",").length !== headerCount
            );
            if (invalidRow) {
              throw new Error(
                `Invalid CSV: Inconsistent number of columns (${path})`
              );
            }

            const parsedData = parseCSV(csvText);
            if (!parsedData || parsedData.length === 0) {
              throw new Error(`Failed to parse CSV data from ${path}`);
            }

            return { name, data: parsedData };
          } catch (error) {
            console.error(`Error loading ${name}:`, error);
            return { error: error.message, name };
          }
        };

        const results = await Promise.all(
          filesToLoad.map((file) => loadCSVFile(file.path, file.name))
        );

        // Collect all unique errors
        const errors = results
          .filter(
            (result): result is { error: string; name: string } =>
              "error" in result
          )
          .map((result) => result.error)
          .filter((error, index, self) => self.indexOf(error) === index); // Remove duplicates

        if (errors.length > 0) {
          setError(errors.join("\n"));
        }

        // Process valid results
        const validResults = results.filter(
          (result): result is { name: string; data: Data[] } =>
            result !== null && !("error" in result)
        );

        if (validResults.length === 0) {
          throw new Error("No valid CSV files were loaded");
        }

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
      } catch (error) {
        console.error("Error loading CSV files:", error);
        setError((prev) =>
          prev ? `${prev}\n${error.message}` : error.message
        );
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
        // Validate row data
        if (values.length !== headers.length) {
          console.warn(`Skipping invalid row: ${row}`);
          return null;
        }
        return headers.reduce((obj, header, index) => {
          const value = values[index]?.trim() || "";
          obj[header] =
            !isNaN(Number(value)) && header !== "Employee ID"
              ? Number(value)
              : value;
          return obj;
        }, {} as Data);
      })
      .filter((row): row is Data => row !== null); // Remove invalid rows
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
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Box
                  sx={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      position: "relative",
                      overflow: "hidden", // Ensure chat container doesn't cause page scroll
                      "& > *": ScrollbarStyle, // Apply ScrollbarStyle only to chat content
                    }}
                  >
                    <ChatInterface />
                  </Box>

                  {/* Icon button */}
                  {datasets.length > 0 && (
                    <Tooltip title="View CSV Data" placement="left">
                      <IconButton
                        onClick={() => setIsPanelOpen(true)}
                        sx={{
                          position: "fixed",
                          width: 56,
                          height: 56,
                          top: 20,
                          right: 20,
                          zIndex: 1200,
                          bgcolor: "background.paper",
                          boxShadow: 2,
                          "&:hover": {
                            bgcolor: "background.paper",
                            opacity: 0.8,
                          },
                        }}
                      >
                        <DescriptionIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Error message box */}
                  {error && (
                    <Box
                      sx={{
                        position: "fixed",
                        top: 80,
                        right: 20,
                        zIndex: 1200,
                        bgcolor: "error.main",
                        color: "white",
                        p: 2,
                        borderRadius: 1,
                        maxWidth: "300px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        ...ScrollbarStyle,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography
                          variant="body2"
                          component="pre"
                          sx={{ whiteSpace: "pre-wrap", flex: 1 }}
                        >
                          {error}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => setError(null)}
                          sx={{
                            color: "white",
                            p: 0.5,
                            ml: 1,
                            "&:hover": {
                              bgcolor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
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
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
