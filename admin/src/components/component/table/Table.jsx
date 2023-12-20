import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { visuallyHidden } from "@mui/utils";
import { MdFilterList, MdOutlineDeleteOutline } from "react-icons/md";
import { AiOutlineEdit, AiOutlinePlus, AiOutlinePrinter } from "react-icons/ai";
import { IconButton } from "@material-tailwind/react";
import { Button } from "@material-tailwind/react";
import { Form, TitleMd } from "../../../routers";
import { Dialog, DialogActions, DialogContent, DialogTitle, Slide } from "@mui/material";
import { SearchAwaiting } from "../../../pages/frontdesk/awaiting/SearchAwaiting";
import { useNavigate } from "react-router-dom";

function createData(name, checkout, guesttype, rooms, adults, child, user, confirm, cancel) {
  return {
    name,
    checkout,
    guesttype,
    rooms,
    adults,
    child,
    user,
    confirm,
    cancel,
  };
}
const rows = [
  createData("23-Apr-2023", "25-Apr-2023", "Individual", 1, 1, 0, "sunil"),
  createData("23-May-2023", "25-Apr-2023", "Corporate", 1, 1, 0, "sunil"),
  createData("23-Jun-2023", "25-Jun-2023", "Individual", 1, 1, 0, "sunil"),
  createData("23-Jul-2023", "25-Jul-2023", "Corporate", 1, 1, 0, "sunil"),
  createData("23-Mar-2023", "25-Mar-2023", "Individual", 1, 1, 0, "sunil"),
  createData("23-Des-2023", "25-Des-2023", "Corporate", 1, 1, 0, "sunil"),
  createData("23-Juna-2023", "25-Juna-2023", "Individual", 1, 1, 0, "sunil"),
  createData("23-Feb-2023", "25-Feb-2023", "Individual", 1, 1, 0, "sunil"),
  createData("23-Mar-2023", "25-Mar-2023", "Corporate", 1, 1, 0, "sunil"),
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Check In",
  },
  {
    id: "checkout",
    numeric: true,
    disablePadding: false,
    label: "Check Out",
  },
  {
    id: "guesttype",
    numeric: true,
    disablePadding: false,
    label: "Guest Type",
  },
  {
    id: "rooms",
    numeric: true,
    disablePadding: false,
    label: "Number of Rooms",
  },
  {
    id: "adults",
    numeric: true,
    disablePadding: false,
    label: "Number of Adults",
  },
  {
    id: "child",
    numeric: true,
    disablePadding: false,
    label: "Number of Child",
  },
  {
    id: "user",
    numeric: true,
    disablePadding: false,
    label: "Add User",
  },
  {
    id: "confirm",
    numeric: true,
    disablePadding: false,
    label: "Confirm",
  },
  {
    id: "cancel",
    numeric: true,
    disablePadding: false,
    label: "Cancel",
  },
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.numeric ? "center" : "center"} padding={headCell.disablePadding ? "none" : "normal"} sortDirection={orderBy === headCell.id ? order : false}>
            <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : "asc"} onClick={createSortHandler(headCell.id)}>
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
  const { numSelected, title } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: "1 1 100%" }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: "1 1 100%" }} variant="h6" id="tableTitle" component="div">
          <TitleMd> {title}</TitleMd>
        </Typography>
      )}

      {numSelected > 0 ? (
        <>
          <div className="flex items-center gap-5">
            <IconButton variant="gradient" color="green">
              <AiOutlineEdit size={20} />
            </IconButton>
            <IconButton variant="gradient" color="red">
              <MdOutlineDeleteOutline size={20} />
            </IconButton>
            <IconButton variant="gradient">
              <AiOutlinePrinter size={20} />
            </IconButton>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-5">
            <SearchAwaiting />
            <button className="flex items-center bg-indigo-500 text-sm text-white p-2.5 px-6 rounded-lg">
              <AiOutlinePlus size={18} className="mr-4" />
              Add
            </button>
            <IconButton variant="outlined" color="gray">
              <MdFilterList size={20} />
            </IconButton>
          </div>
        </>
      )}
    </Toolbar>
  );
}

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function EnhancedTable({ title }) {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("name");
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const visibleRows = React.useMemo(() => stableSort(rows, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [order, orderBy, page, rowsPerPage]);

  //popup models
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const navigate = useNavigate();

  const handleChangePages = () => {
    navigate("/reservation");
  };
  return (
    <>
      <Box sx={{ width: "100%" }}>
        <EnhancedTableToolbar title={title} numSelected={selected.length} />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? "small" : "medium"}>
            <EnhancedTableHead numSelected={selected.length} order={order} orderBy={orderBy} onSelectAllClick={handleSelectAllClick} onRequestSort={handleRequestSort} rowCount={rows.length} />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = isSelected(row.name);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={row.name} selected={isItemSelected} sx={{ cursor: "pointer" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        onClick={(event) => handleClick(event, row.name)}
                        inputProps={{
                          "aria-labelledby": labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center" id={labelId} onClick={(event) => handleClick(event, row.name)}>
                      {row.name}
                    </TableCell>
                    <TableCell align="center" onClick={(event) => handleClick(event, row.name)}>
                      {row.checkout}
                    </TableCell>
                    <TableCell align="center" onClick={(event) => handleClick(event, row.name)}>
                      {row.guesttype}
                    </TableCell>
                    <TableCell align="center" onClick={(event) => handleClick(event, row.name)}>
                      {row.rooms}
                    </TableCell>
                    <TableCell align="center" onClick={(event) => handleClick(event, row.name)}>
                      {row.adults}
                    </TableCell>
                    <TableCell align="center" onClick={(event) => handleClick(event, row.name)}>
                      {row.child}
                    </TableCell>
                    <TableCell align="center" onClick={(event) => handleClick(event, row.name)}>
                      {row.user}
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" onClick={handleClickOpen} size="sm">
                        Confirm
                      </Button>
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="outlined" size="sm" onClick={handleChangePages}>
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={rows.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
        <FormControlLabel control={<Switch checked={dense} onChange={handleChangeDense} />} label="Dense padding" />
      </Box>

      <Dialog className="ml-16" maxWidth="xl" open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} aria-describedby="alert-dialog-slide-description">
        <DialogTitle>Reservation</DialogTitle>
        <DialogContent>
          <Form />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} size="lg" color="indigo">
            update
          </Button>
          <Button variant="outlined" onClick={handleClose} size="lg" color="red">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
