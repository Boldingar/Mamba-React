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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
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

        <BusinessDataTable data={data} onDataFilter={setFilteredData} />
      </Box>
    </Drawer>
  );
};

export default DataPanel;
