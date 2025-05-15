import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  useMediaQuery,
  useTheme,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import BusinessDataTable from "./BusinessDataTable";
import { useIsMobile } from "../utils/responsive";

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

interface DataPanelProps {
  open: boolean;
  onClose: () => void;
  datasets: CSVDataset[];
  selectedDatasetId: string | null;
  onDatasetSelect: (datasetId: string) => void;
  data: Data[];
  onResize?: (width: number) => void;
  initialWidth?: number | string;
}

const DataPanel: React.FC<DataPanelProps> = ({
  open,
  onClose,
  datasets,
  selectedDatasetId,
  onDatasetSelect,
  data,
  onResize,
  initialWidth = 500,
}) => {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const [filteredData, setFilteredData] = useState<Data[]>(data);
  const [width, setWidth] = useState<number | string>(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (!isResizing) {
      setWidth(initialWidth);
    }
  }, [initialWidth, isResizing]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const dx = startX.current - e.clientX;
      const newWidth = Math.min(1000, Math.max(300, startWidth.current + dx));
      setWidth(newWidth);
      if (onResize) onResize(newWidth);
    },
    [isResizing, onResize]
  );

  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [isResizing]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (typeof width !== "number") return;

      e.preventDefault();
      e.stopPropagation();
      startX.current = e.clientX;
      startWidth.current = width;
      setIsResizing(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleDatasetChange = (event: SelectChangeEvent<string>) => {
    onDatasetSelect(event.target.value);
  };

  const sortedDatasets = React.useMemo(() => {
    return [...datasets].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }, [datasets]);

  const handleDownload = () => {
    if (filteredData.length === 0) return;
    const headers = Object.keys(filteredData[0]);
    const csvContent = [
      headers.join(","),
      ...filteredData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"'))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const currentDataset = sortedDatasets.find(
      (ds) => ds.id === selectedDatasetId
    );
    const fileName = currentDataset
      ? `${currentDataset.id}.csv`
      : "keywords_data.csv";
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  // Different layout for mobile and desktop
  if (isMobile) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "background.paper",
          boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0.1)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderLeft: "1px solid",
          borderColor: "divider",
          transition: "width 0.25s ease-out",
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          pt: "56px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: "16px 12px",
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: theme.palette.background.paper,
            position: "sticky",
            top: "56px",
            zIndex: 3,
          }}
        >
          <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
            Data Explorer
          </Typography>
        </Box>

        <Box
          sx={{
            p: 0.5,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              p: 0.5,
              pt: 0.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: 1,
                mt: 1,
                mb: 1,
              }}
            >
              <FormControl fullWidth size="small" sx={{ minWidth: "100%" }}>
                <InputLabel id="dataset-select-label">
                  Select Dataset
                </InputLabel>
                <Select
                  labelId="dataset-select-label"
                  id="dataset-select"
                  value={selectedDatasetId || ""}
                  label="Select Dataset"
                  onChange={handleDatasetChange}
                >
                  {sortedDatasets.map((dataset) => (
                    <MenuItem key={dataset.id} value={dataset.id}>
                      {dataset.displayName || dataset.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflow: "hidden",
                height: "calc(100vh - 250px)",
              }}
            >
              <BusinessDataTable data={data} onDataFilter={setFilteredData} />
            </Box>
          </Box>
        </Box>

        {/* Mobile fixed action bar */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            padding: "16px",
            paddingBottom: "24px",
            backgroundColor: theme.palette.background.paper,
            borderTop: "1px solid",
            borderColor: "divider",
            zIndex: 20,
            boxShadow: "0px -2px 8px rgba(0, 0, 0, 0.1)",
            height: "90px",
          }}
        >
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={filteredData.length === 0}
            color="primary"
            sx={{
              width: "90%",
              py: 1.5,
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1rem",
              boxShadow: 2,
              textTransform: "none",
            }}
          >
            Download CSV
          </Button>
        </Box>
      </Box>
    );
  }

  // Original desktop layout
  return (
    <Box
      sx={{
        width: width,
        height: "100%",
        bgcolor: "background.paper",
        boxShadow: "-4px 0px 10px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderLeft: "1px solid",
        borderColor: "divider",
        transition: isResizing ? "none" : "width 0.25s ease-out",
        position: "relative",
        mt: "47px",
      }}
    >
      {typeof width === "number" && (
        <Box
          sx={{
            position: "absolute",
            left: -10,
            top: 0,
            width: 24,
            height: "100%",
            cursor: "col-resize",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
          }}
          onMouseDown={handleMouseDown}
        >
          <Box
            sx={{
              width: 4,
              height: 30,
              backgroundColor: "divider",
              borderRadius: 4,
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          position: "sticky",
          top: 0,
          zIndex: 3,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ flex: 1 }}>
          CSV Data View
        </Typography>
      </Box>

      <Box
        sx={{
          p: 3,
          height: "calc(100% - 120px)",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
          pb: "80px", // Add space for the fixed button
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
            mt: 2,
            mb: 2,
          }}
        >
          <FormControl fullWidth sx={{ minWidth: "250px" }}>
            <InputLabel id="dataset-select-label">Select Dataset</InputLabel>
            <Select
              labelId="dataset-select-label"
              id="dataset-select"
              value={selectedDatasetId || ""}
              label="Select Dataset"
              onChange={handleDatasetChange}
            >
              {sortedDatasets.map((dataset) => (
                <MenuItem key={dataset.id} value={dataset.id}>
                  {dataset.displayName || dataset.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            maxHeight: "calc(100vh - 250px)",
          }}
        >
          <BusinessDataTable data={data} onDataFilter={setFilteredData} />
        </Box>
      </Box>

      {/* Fixed action bar - similar to mobile */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: width,
          display: "flex",
          justifyContent: "center",
          padding: "16px",
          backgroundColor: theme.palette.background.paper,
          borderTop: "1px solid",
          borderColor: "divider",
          zIndex: 20,
          boxShadow: "0px -2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={filteredData.length === 0}
          sx={{
            borderRadius: "4px",
            textTransform: "none",
            px: 3,
          }}
        >
          Download Data as CSV
        </Button>
      </Box>
    </Box>
  );
};

export default DataPanel;
