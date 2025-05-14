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
  IconButton,
  Popover,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface Data {
  [key: string]: string | number;
}

interface HeadCell {
  id: string;
  label: string;
}

type Order = "asc" | "desc";

interface FilterCondition {
  column: string;
  type: "include" | "exclude";
  value: string;
}

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
  const [filterAnchorEl, setFilterAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [filterConditions, setFilterConditions] = React.useState<
    FilterCondition[]
  >([]);
  const [newCondition, setNewCondition] = React.useState<FilterCondition>({
    column: "",
    type: "include",
    value: "",
  });

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
    // Reset all filters and states when data changes
    setFilteredData(data);
    setPage(0);
    setSearchTerm("");
    setFilterConditions([]);
    setNewCondition({ column: "", type: "include", value: "" });
    setOrderBy("");
    setOrder("asc");
    onDataFilter(data); // Reset filtered data in parent component
  }, [data]); // Only run when data changes

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

  const applyAllFilters = (search: string, conditions: FilterCondition[]) => {
    const filtered = data.filter((row) => {
      // Apply filter conditions
      const passesConditions =
        conditions.length === 0 ||
        conditions.every((condition) => {
          const value = String(row[condition.column]).toLowerCase();
          const searchTerm = condition.value.toLowerCase();

          if (condition.type === "include") {
            return value.includes(searchTerm);
          } else {
            return !value.includes(searchTerm);
          }
        });

      // Apply search term
      const passesSearch =
        !search ||
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase())
        );

      return passesConditions && passesSearch;
    });

    setFilteredData(filtered);
    setPage(0);
    onDataFilter(filtered);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value.toLowerCase();
    setSearchTerm(newSearchTerm);
    applyAllFilters(newSearchTerm, filterConditions);
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

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleAddCondition = () => {
    if (newCondition.column && newCondition.value) {
      const updatedConditions = [...filterConditions, { ...newCondition }];
      setFilterConditions(updatedConditions);
      setNewCondition({ column: "", type: "include", value: "" });
      applyAllFilters(searchTerm, updatedConditions);
      handleFilterClose(); // Close the popover after adding
    }
  };

  const handleRemoveCondition = (index: number) => {
    const updatedConditions = filterConditions.filter((_, i) => i !== index);
    setFilterConditions(updatedConditions);
    applyAllFilters(searchTerm, updatedConditions);
  };

  const handleClearAllFilters = () => {
    setFilterConditions([]);
    applyAllFilters(searchTerm, []);
  };

  // Calculate the data to display for current page
  const displayData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 3,
          width: "100%",
        }}
      >
        <Box
          sx={{ display: "flex", gap: 2, alignItems: "center", width: "100%" }}
        >
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Search across all columns..."
            value={searchTerm}
            onChange={handleSearch}
          />

          <IconButton onClick={handleFilterClick}>
            <FilterListIcon />
          </IconButton>
        </Box>

        {filterConditions.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Active Filters:
              </Typography>
              <Button
                size="small"
                onClick={handleClearAllFilters}
                startIcon={<DeleteIcon />}
                color="error"
              >
                Clear All Filters
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {filterConditions.map((condition, index) => (
                <Chip
                  key={index}
                  label={`${condition.column} ${
                    condition.type === "include" ? "includes" : "excludes"
                  } "${condition.value}"`}
                  onDelete={() => handleRemoveCondition(index)}
                  color={condition.type === "include" ? "success" : "error"}
                  sx={{
                    "& .MuiChip-label": {
                      color:
                        condition.type === "include"
                          ? "success.main"
                          : "error.main",
                      fontSize: "1rem",
                    },
                    "& .MuiChip-deleteIcon": {
                      fontSize: "1.2rem",
                      marginRight: "4px",
                    },
                    height: "40px",
                    borderRadius: "20px",
                    padding: "0 8px",
                  }}
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Popover
        open={Boolean(filterAnchorEl)}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { width: "700px" },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Add Filter Condition
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Column</InputLabel>
              <Select
                value={newCondition.column}
                onChange={(e) =>
                  setNewCondition({ ...newCondition, column: e.target.value })
                }
                label="Column"
              >
                {headers.map((header) => (
                  <MenuItem key={header.id} value={header.id}>
                    {header.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={newCondition.type}
                onChange={(e) =>
                  setNewCondition({
                    ...newCondition,
                    type: e.target.value as "include" | "exclude",
                  })
                }
                label="Type"
              >
                <MenuItem value="include">Include</MenuItem>
                <MenuItem value="exclude">Exclude</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Value to filter"
              value={newCondition.value}
              onChange={(e) =>
                setNewCondition({ ...newCondition, value: e.target.value })
              }
              sx={{
                maxWidth: "160px",
                "& .MuiInputBase-root": {
                  height: "40px",
                  fontSize: "1rem",
                  padding: "0px",
                },
              }}
              fullWidth
            />

            <Button
              variant="contained"
              onClick={handleAddCondition}
              // startIcon={<AddIcon />}
              disabled={!newCondition.column || !newCondition.value}
            >
              Add Filter
            </Button>
          </Box>
        </Box>
      </Popover>

      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          overflowX: "auto",
          pt: 1, // Add padding at the top
        }}
      >
        <Table stickyHeader sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  align="center"
                  sx={{
                    "& .MuiTableSortLabel-root": {
                      width: "100%",
                      justifyContent: "center",
                    },
                    "& .MuiTableSortLabel-icon": {
                      position: "absolute",
                      right: 0,
                    },
                    position: "relative",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  <TableSortLabel
                    active={orderBy === header.id}
                    direction={orderBy === header.id ? order : "asc"}
                    onClick={() => handleRequestSort(header.id)}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      paddingRight: "16px", // Space for sort icon
                    }}
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
                  <TableCell key={header.id} align="center">
                    {row[header.id]}
                  </TableCell>
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
