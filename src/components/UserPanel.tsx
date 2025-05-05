import React, { useState, useEffect, useRef } from "react";
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
  Menu,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PushPinIcon from "@mui/icons-material/PushPin";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

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

interface PinnedChat {
  id: string;
  title: string;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [pinnedChats, setPinnedChats] = useState<PinnedChat[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [localChats, setLocalChats] = useState<{ id: string; title: string }[]>(
    []
  );

  // Create a ref for the text input
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Load pinned chats from localStorage on component mount
  useEffect(() => {
    const storedPinnedChats = localStorage.getItem("pinnedChats");
    if (storedPinnedChats) {
      setPinnedChats(JSON.parse(storedPinnedChats));
    }
  }, []);

  // Update localChats when recentChats change
  useEffect(() => {
    if (recentChats.length > 0) {
      setLocalChats([...recentChats]);
    }
  }, [recentChats]);

  // Save pinned chats to localStorage when they change
  useEffect(() => {
    localStorage.setItem("pinnedChats", JSON.stringify(pinnedChats));
  }, [pinnedChats]);

  // Load renamed chats from localStorage
  useEffect(() => {
    const renamedChats = localStorage.getItem("renamedChats");
    if (renamedChats && localChats.length > 0) {
      const renamedChatsObj = JSON.parse(renamedChats);
      const updatedChats = localChats.map((chat) => ({
        ...chat,
        title: renamedChatsObj[chat.id] || chat.title,
      }));
      setLocalChats(updatedChats);
    }
  }, [localChats.length]);

  // Focus and select text when renaming starts
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      setTimeout(() => {
        if (renameInputRef.current) {
          renameInputRef.current.focus();
          renameInputRef.current.select();
        }
      }, 50);
    }
  }, [isRenaming]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    chatId: string
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setCurrentChatId(chatId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (currentChatId) {
      try {
        setIsDeleting(true);
        await axiosInstance.delete(`/conversations/${currentChatId}`);

        // Remove from pinned chats if it exists there
        setPinnedChats((prevPinned) =>
          prevPinned.filter((chat) => chat.id !== currentChatId)
        );

        // Remove from local chats as well
        setLocalChats((prevChats) =>
          prevChats.filter((chat) => chat.id !== currentChatId)
        );

        setDeleteDialogOpen(false);

        // The parent component should refresh the chats list after deletion
        if (onNewChat) onNewChat(); // Triggering new chat to reset the view
      } catch (error) {
        console.error("Error deleting chat:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handlePinChat = () => {
    handleMenuClose();
    if (currentChatId) {
      const chatToPin = localChats.find((chat) => chat.id === currentChatId);
      if (chatToPin && !pinnedChats.some((chat) => chat.id === currentChatId)) {
        setPinnedChats([...pinnedChats, chatToPin]);
      }
    }
  };

  const handleUnpinChat = (
    event: React.MouseEvent<HTMLButtonElement>,
    chatId: string
  ) => {
    event.stopPropagation();
    setPinnedChats((prevPinned) =>
      prevPinned.filter((chat) => chat.id !== chatId)
    );
  };

  const handleRenameClick = () => {
    handleMenuClose();
    if (currentChatId) {
      const currentChat = localChats.find((chat) => chat.id === currentChatId);
      if (currentChat) {
        setNewChatName(currentChat.title || `Chat ${currentChat.id}`);
        setIsRenaming(true);
      }
    }
  };

  const handleRenameSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (currentChatId && newChatName.trim()) {
      // Update in local chats
      setLocalChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, title: newChatName } : chat
        )
      );

      // Save to local storage for persistence
      localStorage.setItem(
        "renamedChats",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("renamedChats") || "{}"),
          [currentChatId]: newChatName,
        })
      );

      // Update in pinned chats if it exists there
      setPinnedChats((prevPinned) =>
        prevPinned.map((chat) =>
          chat.id === currentChatId ? { ...chat, title: newChatName } : chat
        )
      );

      setIsRenaming(false);
    }
  };

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
    localStorage.removeItem("pinnedChats");
    localStorage.removeItem("renamedChats");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("conversations");

    // Update auth state and navigate
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
  };

  // Calculate dynamic height for pinned chats list
  const pinnedListHeight = Math.min(20, Math.max(10, pinnedChats.length * 10));

  // Function to render chat item with the appropriate controls
  const renderChatItem = (
    chat: { id: string; title: string },
    isPinned: boolean = false
  ) => {
    const isSelected = chat.id === selectedConversationId;
    const isCurrentlyRenaming = isRenaming && currentChatId === chat.id;

    return (
      <ListItem key={chat.id} disablePadding sx={{ borderRadius: 2, mb: 0.5 }}>
        <ListItemButton
          sx={{
            borderRadius: 2,
            bgcolor: isSelected ? "rgba(0, 120, 255, 0.1)" : "transparent",
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
          onClick={() =>
            !isCurrentlyRenaming && onSelectChat && onSelectChat(chat.id)
          }
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
                  color: isSelected ? theme.palette.primary.main : "inherit",
                }}
              >
                {isCurrentlyRenaming ? (
                  <form
                    onSubmit={handleRenameSubmit}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TextField
                      size="small"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      inputRef={renameInputRef}
                      onBlur={handleRenameSubmit}
                      sx={{
                        width: "100%",
                        "& .MuiInputBase-input": {
                          padding: "4px 8px",
                          fontSize: "15px",
                        },
                      }}
                    />
                  </form>
                ) : (
                  chat.title || `Chat ${chat.id}`
                )}
              </span>
            }
          />
          {isPinned ? (
            <IconButton
              size="small"
              onClick={(e) => handleUnpinChat(e, chat.id)}
              sx={{ ml: 1 }}
            >
              <PushPinIcon fontSize="small" color="primary" />
            </IconButton>
          ) : (
            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, chat.id)}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </ListItemButton>
      </ListItem>
    );
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
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 48px)", // Minus toolbar height
            overflow: "hidden", // Ensure no scrolling on the parent
          }}
        >
          {/* Top section with New Chat button */}
          <Box sx={{ p: 2 }}>
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
          </Box>

          {/* Middle scrollable section with chats */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              ...chatScrollbarStyle,
              px: 2,
              pb: 2,
            }}
          >
            {/* Pinned Chats Section */}
            {pinnedChats.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, mt: 2, fontWeight: 700, letterSpacing: 1 }}
                >
                  Pinned Chats
                </Typography>
                <List sx={{ width: "100%" }}>
                  {pinnedChats.map((chat) => renderChatItem(chat, true))}
                </List>
              </>
            )}

            {/* Recent Chats Section Header and List */}
            {localChats.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, mt: 2, fontWeight: 700, letterSpacing: 1 }}
                >
                  Recent Chats
                </Typography>
                <List sx={{ width: "100%" }}>
                  {/* Filter out pinned chats from recent chats to avoid duplicates */}
                  {localChats
                    .filter(
                      (chat) =>
                        !pinnedChats.some((pinned) => pinned.id === chat.id)
                    )
                    .map((chat) => renderChatItem(chat))}
                </List>
              </>
            )}
          </Box>

          {/* Bottom section with Profile and Logout buttons */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <List sx={{ width: "100%" }}>
              {/* Profile Button */}
              <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
                <ListItemButton
                  sx={{ borderRadius: 2 }}
                  onClick={onProfileClick}
                >
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
        </Box>
      </Drawer>

      {/* Menu for chat options */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            bgcolor: "#2a2a2a",
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handlePinChat} sx={{ gap: 1 }}>
          <PushPinIcon fontSize="small" />
          <Typography variant="body2">Pin</Typography>
        </MenuItem>
        <MenuItem onClick={handleRenameClick} sx={{ gap: 1 }}>
          <EditIcon fontSize="small" />
          <Typography variant="body2">Rename</Typography>
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          sx={{
            gap: 1,
            color: theme.palette.error.main,
          }}
        >
          <DeleteIcon fontSize="small" />
          <Typography variant="body2">Delete</Typography>
        </MenuItem>
      </Menu>

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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
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
        <DialogTitle id="delete-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Delete Chat
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            sx={{ color: "text.primary", opacity: 0.8 }}
          >
            Are you sure you want to delete this chat? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            disabled={isDeleting}
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
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
            disabled={isDeleting}
            sx={{
              textTransform: "none",
              borderRadius: 1.5,
              px: 2,
              fontWeight: 500,
              position: "relative",
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
            {isDeleting && (
              <CircularProgress
                size={20}
                sx={{
                  color: "#ffffff",
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  marginLeft: "-10px",
                  marginTop: "-10px",
                }}
              />
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserPanel;
