import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  Box,
} from "@mui/material";

interface Data {
  [key: string]: string | number;
}

interface HeadCell {
  id: string;
  label: string;
}

type Order = "asc" | "desc";

interface BusinessDataTableProps {
  data: Data[];
  onDataFilter: (filteredData: Data[]) => void;
}

const BusinessDataTable: React.FC<BusinessDataTableProps> = ({
  data,
  onDataFilter,
}) => {
  const [filteredData, setFilteredData] = React.useState<Data[]>(data);
  const [orderBy, setOrderBy] = React.useState<string>("");
  const [order, setOrder] = React.useState<Order>("asc");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [headers, setHeaders] = React.useState<HeadCell[]>([]);

  React.useEffect(() => {
    if (data.length > 0) {
      const headerKeys = Object.keys(data[0]);
      setHeaders(
        headerKeys.map((key) => ({
          id: key,
          label: key.replace(/([A-Z])/g, " $1").trim(), // Convert camelCase to spaces
        }))
      );
    }
    setFilteredData(data);
  }, [data]);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return isAsc ? bValue - aValue : aValue - bValue;
      }

      return isAsc
        ? String(bValue).localeCompare(String(aValue))
        : String(aValue).localeCompare(String(bValue));
    });

    setFilteredData(sortedData);
    onDataFilter(sortedData);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value.toLowerCase();
    setSearchTerm(searchTerm);

    const filtered = data.filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm)
      )
    );
    setFilteredData(filtered);
    onDataFilter(filtered);
  };

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header.id}>
                  <TableSortLabel
                    active={orderBy === header.id}
                    direction={orderBy === header.id ? order : "asc"}
                    onClick={() => handleRequestSort(header.id)}
                  >
                    {header.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header.id}>{row[header.id]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BusinessDataTable;
