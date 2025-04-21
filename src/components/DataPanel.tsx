import React from "react";
import { Drawer, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessDataTable from "./BusinessDataTable";

interface Data {
  [key: string]: string | number;
}

interface DataPanelProps {
  open: boolean;
  onClose: () => void;
  data: Data[];
}

const DataPanel: React.FC<DataPanelProps> = ({ open, onClose, data }) => {
  const [filteredData, setFilteredData] = React.useState<Data[]>(data);

  React.useEffect(() => {
    setFilteredData(data);
  }, [data]);

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
          <Typography variant="h6">CSV Data View</Typography>
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
