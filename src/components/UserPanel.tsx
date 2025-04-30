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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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

// Add a scrollbar style similar to ChatComponent
const chatScrollbarStyle = {
  "&::-webkit-scrollbar": {
    width: "8px",
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#444",
    borderRadius: "8px",
    "&:hover": {
      background: "#555",
    },
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#444 transparent", // For Firefox
};

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
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);

    // Clear auth data
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("conversations");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("conversations");

    // Update auth state and navigate
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <>
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
                disabled={isAwaitingResponse || selectedConversationId === ""}
              >
                <ListItemIcon>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText
                  primary={<span style={{ fontWeight: 600 }}>New Chat</span>}
                />
              </ListItemButton>
            </ListItem>
          </List>
          {/* Recent Chats Section Header and List */}
          {recentChats.length > 0 && (
            <>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1, mt: 2, fontWeight: 700, letterSpacing: 1 }}
              >
                Recent Chats
              </Typography>
              <List
                sx={{
                  width: "100%",
                  overflow: "auto",
                  maxHeight: "64vh",
                  ...chatScrollbarStyle,
                }}
              >
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
                        disabled={isAwaitingResponse}
                      >
                        <ListItemIcon>
                          <ChatIcon
                            fontSize="small"
                            color={isSelected ? "primary" : "inherit"}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: isSelected ? 600 : 400,
                                color: isSelected
                                  ? theme.palette.primary.main
                                  : "inherit",
                              }}
                            >
                              {chat.title || `Chat ${chat.id}`}
                            </span>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
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
                  primary={<span style={{ fontWeight: 600 }}>Profile</span>}
                />
              </ListItemButton>
            </ListItem>
            {/* Logout Button */}
            <ListItem disablePadding sx={{ borderRadius: 2 }}>
              <ListItemButton
                sx={{ borderRadius: 2 }}
                onClick={handleLogoutClick}
              >
                <ListItemIcon>
                  <LogoutIcon sx={{ color: theme.palette.error.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span
                      style={{
                        fontWeight: 600,
                        color: theme.palette.error.main,
                      }}
                    >
                      Logout
                    </span>
                  }
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              maxWidth: "400px",
              width: "100%",
              bgcolor: "#1a1a1a",
            },
          },
        }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Confirm Logout
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="logout-dialog-description"
            sx={{ color: "text.primary", opacity: 0.8 }}
          >
            Are you sure you want to log out? Your conversation history will
            remain saved, but you'll need to log in again to access it.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              px: 2,
              fontWeight: 500,
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                borderColor: "text.secondary",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            autoFocus
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              px: 2,
              fontWeight: 500,
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserPanel;
