import * as React from "react";
import MuiAvatar from "@mui/material/Avatar";
import MuiListItemAvatar from "@mui/material/ListItemAvatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListSubheader from "@mui/material/ListSubheader";
import Select, { SelectChangeEvent, selectClasses } from "@mui/material/Select";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import SmartphoneRoundedIcon from "@mui/icons-material/SmartphoneRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme as any).vars
    ? (theme as any).vars.palette.background.paper
    : theme.palette.background.paper,
  color: (theme as any).vars
    ? (theme as any).vars.palette.text.secondary
    : theme.palette.text.secondary,
  border: `1px solid ${
    (theme as any).vars
      ? (theme as any).vars.palette.divider
      : theme.palette.divider
  }`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 30,
});

export default function SelectContent() {
  const [company, setCompany] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setCompany(event.target.value as string);
  };

  return (
    <Select
      labelId="company-select"
      id="company-simple-select"
      value={company}
      onChange={handleChange}
      displayEmpty
      inputProps={{ "aria-label": "Select company" }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: 250,
        borderRadius: 3,
        "&.MuiList-root": {
          p: "8px",
        },
        [`& .${selectClasses.select}`]: {
          display: "flex",
          alignItems: "center",
          gap: "2px",
          pl: 1,
        },
      }}
    >
      <ListSubheader sx={{ backgroundColor: "transparent", pt: 0 }}>
        Production
      </ListSubheader>
      <MenuItem value="">
        <ListItemAvatar>
          <Avatar alt="Sitemark web">
            <DevicesRoundedIcon sx={{ fontSize: "1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<span style={{ fontWeight: 600 }}>Sitemark-web</span>}
          secondary="Web app"
        />
      </MenuItem>
      <MenuItem value={10}>
        <ListItemAvatar>
          <Avatar alt="Sitemark App">
            <SmartphoneRoundedIcon sx={{ fontSize: "1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<span style={{ fontWeight: 600 }}>Sitemark-app</span>}
          secondary="Mobile application"
        />
      </MenuItem>
      <MenuItem value={20}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <DevicesRoundedIcon sx={{ fontSize: "1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<span style={{ fontWeight: 600 }}>Sitemark-Store</span>}
          secondary="Web app"
        />
      </MenuItem>
      <ListSubheader sx={{ backgroundColor: "transparent" }}>
        Development
      </ListSubheader>
      <MenuItem value={30}>
        <ListItemAvatar>
          <Avatar alt="Sitemark Store">
            <ConstructionRoundedIcon sx={{ fontSize: "1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<span style={{ fontWeight: 600 }}>Sitemark-Admin</span>}
          secondary="Web app"
        />
      </MenuItem>
      <Divider sx={{ mx: -1 }} />
      <MenuItem value={40}>
        <ListItemIcon>
          <AddRoundedIcon />
        </ListItemIcon>
        <ListItemText
          primary={<span style={{ fontWeight: 600 }}>Add product</span>}
          secondary="Web app"
        />
      </MenuItem>
    </Select>
  );
}
