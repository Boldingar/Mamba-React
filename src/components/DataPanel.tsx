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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import BusinessDataTable from "./BusinessDataTable";

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
  initialWidth?: number;
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
  const [filteredData, setFilteredData] = useState<Data[]>(data);
  const [width, setWidth] = useState(initialWidth);
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

  return (
    <Box
      sx={{
        width: `${width}px`,
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
      }}
    >
      {/* Resize handle on the left edge */}
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
          className="resizeIndicator"
          sx={{
            width: 4,
            height: "100%",
            backgroundColor: "divider",
            transition: "background-color 0.2s",
          }}
        />
      </Box>
      <Box
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            width: "100%",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Typography variant="h6">CSV Data View</Typography>
            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
              <InputLabel>Select Dataset</InputLabel>
              <Select
                value={selectedDatasetId || ""}
                onChange={handleDatasetChange}
                label="Select Dataset"
                renderValue={(selected) => {
                  const dataset = sortedDatasets.find(
                    (ds) => ds.id === selected
                  );
                  return dataset ? dataset.displayName : "";
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {sortedDatasets.map((dataset) => (
                  <MenuItem key={dataset.id} value={dataset.id}>
                    {dataset.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto", width: "100%" }}>
          {data.length > 0 ? (
            <BusinessDataTable data={data} onDataFilter={setFilteredData} />
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                width: "100%",
                p: 3,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                No data available
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", textAlign: "center" }}
              >
                There is currently no data to display. When keyword data is
                generated, it will appear here.
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            mt: 2,
            borderTop: 1,
            borderColor: "divider",
            pt: 2,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={handleDownload}
            disabled={filteredData.length === 0}
            startIcon={<DownloadIcon />}
            sx={{
              height: 48,
              width: 250,
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
              },
            }}
          >
            Download Data as CSV
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DataPanel;
