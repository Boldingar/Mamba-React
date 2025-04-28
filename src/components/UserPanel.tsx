import React, { useState, useEffect } from "react";
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
  Avatar,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

// Remove dummy chats
// const dummyChats = [
//   { id: 1, title: "Chat with Alice" },
//   { id: 2, title: "Project Discussion" },
//   { id: 3, title: "Support Bot" },
// ];

const panelWidth = 300;

interface UserPanelProps {
  setIsAuthenticated?: (auth: boolean) => void;
  onProfileClick?: () => void;
  onNewChat?: () => void;
  recentChats?: { id: string; title: string }[];
  onSelectChat?: (id: string) => void;
  isAwaitingResponse?: boolean;
  selectedConversationId?: string | null;
}

const UserPanel: React.FC<UserPanelProps> = ({
  setIsAuthenticated,
  onProfileClick,
  onNewChat,
  recentChats = [],
  onSelectChat,
  isAwaitingResponse = false,
  selectedConversationId,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const sidebarBg = "#232323";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("conversations");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("conversations");
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
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
            <ListItemButton
              sx={{ borderRadius: 2 }}
              onClick={onNewChat}
              disabled={
                (isAwaitingResponse && selectedConversationId !== "") ||
                selectedConversationId === ""
              }
            >
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
        <List sx={{ width: "100%", overflow: "auto", maxHeight: "50vh" }}>
          {/* Recent Chats */}
          {recentChats.map((chat) => {
            const isSelected = chat.id === selectedConversationId;

            return (
              <ListItem
                key={chat.id}
                disablePadding
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    bgcolor: isSelected
                      ? "rgba(0, 120, 255, 0.1)"
                      : "transparent",
                    borderLeft: isSelected
                      ? `3px solid ${theme.palette.primary.main}`
                      : "none",
                    paddingLeft: isSelected ? 1.7 : 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: isSelected
                        ? "rgba(0, 120, 255, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                    },
                    "&.Mui-disabled": {
                      opacity: 0.5,
                    },
                  }}
                  onClick={() => onSelectChat && onSelectChat(chat.id)}
                  disabled={isAwaitingResponse && selectedConversationId !== ""}
                >
                  <ListItemIcon>
                    <ChatIcon
                      fontSize="small"
                      color={isSelected ? "primary" : "inherit"}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={chat.title || `Chat ${chat.id}`}
                    primaryTypographyProps={{
                      fontSize: 15,
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected
                        ? theme.palette.primary.main
                        : "inherit",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider sx={{ my: 2, width: "100%", borderColor: "#292929" }} />
        {/* Profile Button */}
        <List sx={{ width: "100%" }}>
          <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
            <ListItemButton sx={{ borderRadius: 2 }} onClick={onProfileClick}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText
                primary="Profile"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
          {/* Logout Button */}
          <ListItem disablePadding sx={{ borderRadius: 2 }}>
            <ListItemButton sx={{ borderRadius: 2 }} onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default UserPanel;
