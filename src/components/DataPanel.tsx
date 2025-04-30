import React from "react";
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Tooltip,
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
}

const DataPanel: React.FC<DataPanelProps> = ({
  open,
  onClose,
  datasets,
  selectedDatasetId,
  onDatasetSelect,
  data,
}) => {
  const [filteredData, setFilteredData] = React.useState<Data[]>(data);

  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleDatasetChange = (event: SelectChangeEvent<string>) => {
    onDatasetSelect(event.target.value);
  };

  // Sort datasets by timestamp to maintain consistent order
  const sortedDatasets = React.useMemo(() => {
    return [...datasets].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }, [datasets]);

  const handleDownload = () => {
    if (filteredData.length === 0) return;

    // Get headers from the first row
    const headers = Object.keys(filteredData[0]);

    // Convert data to CSV format
    const csvContent = [
      headers.join(","), // Header row
      ...filteredData.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle values that might contain commas or quotes
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

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Get current dataset name for the file name
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
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          marginTop: "70px",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
            <Typography variant="h6">CSV Data View</Typography>
            <FormControl size="small" sx={{ minWidth: 300 }}>
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

        <Box sx={{ flex: 1, overflow: "auto" }}>
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
    </Drawer>
  );
};

export default DataPanel;
