import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Toolbar,
  Tooltip,
  Fab,
  IconButton,
  Divider,
  useTheme,
  Button,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const dummyChats = [
  { id: 1, title: "Chat with Alice" },
  { id: 2, title: "Project Discussion" },
  { id: 3, title: "Support Bot" },
];

const panelWidth = 300;

interface UserPanelProps {
  setIsAuthenticated?: (auth: boolean) => void;
}

const UserPanel: React.FC<UserPanelProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const sidebarBg = "#232323";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
  };

  const handleNewChat = () => {
    alert("New chat feature coming soon!");
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: panelWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: panelWidth,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          bgcolor: sidebarBg,
          overflowX: "hidden",
          boxShadow: "none",
          borderRight: "none",
          borderRadius: 0,
        },
      }}
      PaperProps={{ elevation: 0 }}
    >
      <Toolbar sx={{ minHeight: 48 }} />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          p: 2,
          pt: 2,
          height: "100%",
        }}
      >
        <List sx={{ width: "100%" }}>
          {/* New Chat Button */}
          <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
            <ListItemButton sx={{ borderRadius: 2 }} onClick={handleNewChat}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText
                primary="New Chat"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
        {/* Recent Chats Section Header */}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1, mt: 2, fontWeight: 700, letterSpacing: 1 }}
        >
          Recent Chats
        </Typography>
        <List sx={{ width: "100%" }}>
          {/* Recent Chats */}
          {dummyChats.map((chat) => (
            <ListItem
              key={chat.id}
              disablePadding
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemButton sx={{ borderRadius: 2 }}>
                <ListItemIcon>
                  <ChatIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={chat.title}
                  primaryTypographyProps={{ fontSize: 15 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ my: 2, width: "100%", borderColor: "#292929" }} />
        {/* Logout Button */}
        <List sx={{ width: "100%" }}>
          <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
            <ListItemButton sx={{ borderRadius: 2 }} onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "error.main",
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default UserPanel;
