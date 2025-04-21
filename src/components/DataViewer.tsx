import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface DataViewerProps {
  data: {
    headers: string[];
    rows: any[][];
  };
  title: string;
  onClose: () => void;
}

const DataViewer: React.FC<DataViewerProps> = ({ data, title, onClose }) => {
  return (
    <Box
      sx={{
        height: "100vh",
        backgroundColor: "background.paper",
        borderLeft: 1,
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small" color="primary">
          <CloseIcon />
        </IconButton>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: "calc(100vh - 64px)",
          backgroundColor: "background.paper",
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
          },
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {data.headers.map((header, index) => (
                <TableCell
                  key={index}
                  sx={{
                    backgroundColor: "background.paper",
                    fontWeight: "bold",
                    borderBottom: 2,
                    borderColor: "divider",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    sx={{
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataViewer;
