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
  useTheme,
  useMediaQuery,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
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
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          mb: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            mb: { xs: 1, sm: 0 },
            width: { xs: "100%", sm: "200px", md: "250px" },
          }}
        />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            sx={{
              height: { xs: "32px", sm: "auto" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            }}
          >
            Filter
          </Button>
          {filterConditions.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              size={isMobile ? "small" : "medium"}
              onClick={handleClearAllFilters}
              sx={{
                height: { xs: "32px", sm: "auto" },
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
      </Box>

      {filterConditions.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
            maxWidth: "100%",
            overflow: "auto",
          }}
        >
          {filterConditions.map((condition, index) => (
            <Chip
              key={index}
              label={`${condition.column} ${
                condition.type === "include" ? "includes" : "excludes"
              } "${condition.value}"`}
              onDelete={() => handleRemoveCondition(index)}
              size={isMobile ? "small" : "medium"}
              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" } }}
            />
          ))}
        </Box>
      )}

      <TableContainer
        component={Paper}
        sx={{
          maxHeight: { xs: 300, sm: 400, md: 500 },
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        }}
      >
        <Table stickyHeader size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  sortDirection={orderBy === header.id ? order : false}
                  sx={{
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    padding: { xs: "8px 6px", sm: "16px" },
                  }}
                >
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
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => (
                <TableRow key={rowIndex} hover>
                  {headers.map((header) => (
                    <TableCell
                      key={`${rowIndex}-${header.id}`}
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px 6px", sm: "16px" },
                      }}
                    >
                      {row[header.id] !== undefined
                        ? String(row[header.id])
                        : ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
            {
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
          ".MuiTablePagination-select": {
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          },
        }}
      />

      {/* Filter Popover */}
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
          sx: {
            p: { xs: 2, sm: 3 },
            width: { xs: 280, sm: 350, md: 400 },
          },
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          Add Filter
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Column</InputLabel>
            <Select
              value={newCondition.column}
              onChange={(e) =>
                setNewCondition({
                  ...newCondition,
                  column: e.target.value,
                })
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
          <FormControl fullWidth size={isMobile ? "small" : "medium"}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={newCondition.type}
              onChange={(e) =>
                setNewCondition({
                  ...newCondition,
                  type: e.target.value as "include" | "exclude",
                })
              }
              label="Condition"
            >
              <MenuItem value="include">Includes</MenuItem>
              <MenuItem value="exclude">Excludes</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Value"
            fullWidth
            value={newCondition.value}
            onChange={(e) =>
              setNewCondition({
                ...newCondition,
                value: e.target.value,
              })
            }
            size={isMobile ? "small" : "medium"}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCondition}
            disabled={!newCondition.column || !newCondition.value}
            sx={{ mt: 1 }}
          >
            Add Filter
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default BusinessDataTable;
