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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const getResponsiveWidth = () => {
    if (isMobile) return Math.min(initialWidth, 300);
    if (isTablet) return Math.min(initialWidth, 400);
    return initialWidth;
  };

  const [filteredData, setFilteredData] = useState<Data[]>(data);
  const [width, setWidth] = useState(getResponsiveWidth());
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (!isResizing) {
      setWidth(getResponsiveWidth());
    }
  }, [initialWidth, isResizing, isMobile, isTablet]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const dx = startX.current - e.clientX;
      const minWidth = isMobile ? 250 : isTablet ? 280 : 300;
      const maxWidth = isMobile ? 300 : isTablet ? 500 : 1000;
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, startWidth.current + dx)
      );
      setWidth(newWidth);
      if (onResize) onResize(newWidth);
    },
    [isResizing, onResize, isMobile, isTablet]
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
          p: { xs: 1.5, sm: 2, md: 3 },
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
            mb: { xs: 1.5, sm: 2, md: 3 },
            width: "100%",
          }}
        >
          <Box
            sx={{
              mt: { xs: 3, sm: 4, md: 5 },
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5, md: 2 },
              flex: 1,
              flexDirection: { xs: "column", sm: "row" },
              width: "100%",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" } }}
            >
              CSV Data View
            </Typography>
            <FormControl
              size={isMobile ? "small" : "small"}
              sx={{
                minWidth: { xs: "100%", sm: 150, md: 200 },
                flex: 1,
              }}
            >
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
                      maxHeight: { xs: 200, sm: 250, md: 300 },
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

          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={handleDownload}
              size={isMobile ? "small" : "medium"}
            >
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={onClose} size={isMobile ? "small" : "medium"}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {filteredData.length > 0 && <BusinessDataTable data={filteredData} />}
        </Box>
      </Box>
    </Box>
  );
};

export default DataPanel;
