import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [filterColumn, setFilterColumn] = React.useState<string>("");

  React.useEffect(() => {
    if (data.length > 0) {
      const headerKeys = Object.keys(data[0]);
      setHeaders(
        headerKeys.map((key) => ({
          id: key,
          label: key.replace(/([A-Z])/g, " $1").trim(),
        }))
      );
    }
    setFilteredData(data);
    setPage(0); // Reset to first page when data changes
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
    filterData(searchTerm, filterColumn);
  };

  const handleFilterColumnChange = (event: SelectChangeEvent<string>) => {
    const column = event.target.value;
    setFilterColumn(column);
    filterData(searchTerm, column);
  };

  const filterData = (search: string, column: string) => {
    const filtered = data.filter((row) => {
      if (!search) return true;

      if (column) {
        const value = String(row[column]).toLowerCase();
        return value.includes(search);
      }

      return Object.values(row).some((value) =>
        String(value).toLowerCase().includes(search)
      );
    });

    setFilteredData(filtered);
    setPage(0); // Reset to first page when filter changes
    onDataFilter(filtered);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate the data to display for current page
  const displayData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Column</InputLabel>
          <Select
            value={filterColumn}
            onChange={handleFilterColumnChange}
            label="Filter by Column"
          >
            <MenuItem value="">
              <em>All Columns</em>
            </MenuItem>
            {headers.map((header) => (
              <MenuItem key={header.id} value={header.id}>
                {header.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
            {displayData.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header.id}>{row[header.id]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default BusinessDataTable;
