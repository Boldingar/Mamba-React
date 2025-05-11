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
  Skeleton,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PushPinIcon from "@mui/icons-material/PushPin";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InsightsIcon from "@mui/icons-material/Insights";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import { useTheme as useAppTheme } from "../context/ThemeContext";
import SelectContent from "./SelectContent";
import { alpha } from "@mui/material/styles";

// Remove dummy chats
// const dummyChats = [
//   { id: 1, title: "Chat with Alice" },
//   { id: 2, title: "Project Discussion" },
//   { id: 3, title: "Support Bot" },
// ];

const panelWidth = 285;

// Add a scrollbar style similar to ChatComponent
const getScrollbarStyle = (theme) => ({
  "&::-webkit-scrollbar": {
    width: "8px",
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: theme.palette.mode === "dark" ? "#444" : "#ccc",
    borderRadius: "8px",
    "&:hover": {
      background: theme.palette.mode === "dark" ? "#555" : "#aaa",
    },
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  scrollbarWidth: "thin",
  scrollbarColor:
    theme.palette.mode === "dark" ? "#444 transparent" : "#ccc transparent", // For Firefox
});

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

interface ConversationData {
  id: string;
  name: string;
}

// Interface for the API response
interface ConversationResponse {
  conversations: {
    id: string;
    name: string;
    updated_at: string;
    is_pinned: boolean;
  }[];
  total: number;
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
  const { mode } = useAppTheme();
  // Use theme background instead of hardcoded color
  const sidebarBg = theme.palette.background.default;
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [pinnedChats, setPinnedChats] = useState<PinnedChat[]>([]);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [localChats, setLocalChats] = useState<
    { id: string; title: string; isPinned?: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [user, setUser] = useState<{
    first_name?: string;
    last_name?: string;
    email?: string;
  }>({});
  const [isSelectContentOpen, setIsSelectContentOpen] = useState(false);
  const apiCalledRef = useRef(false);

  // Create a ref for the text input
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Get scrollbar style based on current theme
  const chatScrollbarStyle = getScrollbarStyle(theme);

  // Load pinned chats from localStorage on component mount
  useEffect(() => {
    const storedPinnedChats = localStorage.getItem("pinnedChats");
    if (storedPinnedChats) {
      setPinnedChats(JSON.parse(storedPinnedChats));
    }
  }, []);

  // Fetch conversations from the API on page load
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const currentProject = JSON.parse(
          localStorage.getItem("currentProject") ||
            sessionStorage.getItem("currentProject") ||
            "{}"
        );
        if (!currentProject.id) {
          console.error("No project selected");
          return;
        }

        const response = await axiosInstance.get(
          `/projects/${currentProject.id}/conversations`
        );

        // Format the conversations data
        const formattedChats = (response.data.conversations || []).map(
          (conv: any) => ({
            id: conv.id,
            title: conv.name,
            isPinned: conv.is_pinned || false,
            updatedAt: conv.updated_at,
          })
        );

        // Sort conversations by updated_at in descending order (newest first)
        formattedChats.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        // Update local state
        setLocalChats(formattedChats);

        // Update storage with the new conversations
        const storage = localStorage.getItem("authToken")
          ? localStorage
          : sessionStorage;

        storage.setItem(
          "conversations",
          JSON.stringify(
            formattedChats.map((chat) => ({
              id: chat.id,
              name: chat.title,
            }))
          )
        );

        // Set pinned chats
        const pinnedConversations = formattedChats.filter(
          (chat) => chat.isPinned
        );
        setPinnedChats(pinnedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Cleanup function to reset the ref when component unmounts
    return () => {
      apiCalledRef.current = false;
    };
  }, []);

  // Update localChats when recentChats change - only if we're not loading from API
  useEffect(() => {
    if (recentChats.length > 0 && !isLoading) {
      // Preserve isPinned property when updating from recentChats
      const updatedChats = recentChats.map((chat) => {
        const existingChat = localChats.find((local) => local.id === chat.id);
        return {
          ...chat,
          isPinned: existingChat?.isPinned || false,
        };
      });
      setLocalChats(updatedChats);
    }
  }, [recentChats, isLoading]);

  // Save pinned chats to localStorage when they change
  useEffect(() => {
    localStorage.setItem("pinnedChats", JSON.stringify(pinnedChats));
  }, [pinnedChats]);

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

  useEffect(() => {
    const stored =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

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

        // Update the storage
        const storage = localStorage.getItem("authToken")
          ? localStorage
          : sessionStorage;
        try {
          const storedConversations = storage.getItem("conversations");
          if (storedConversations) {
            const conversations: ConversationData[] =
              JSON.parse(storedConversations);
            const updatedConversations = conversations.filter(
              (conv) => conv.id !== currentChatId
            );
            storage.setItem(
              "conversations",
              JSON.stringify(updatedConversations)
            );
          }
        } catch (error) {
          console.error("Error updating stored conversations:", error);
        }

        setDeleteDialogOpen(false);

        // The parent component should refresh the chats list after deletion
        if (onNewChat && currentChatId === selectedConversationId) onNewChat(); // Only redirect if the deleted chat is the current one
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
      // Find the chat
      const chatToToggle = localChats.find((chat) => chat.id === currentChatId);
      if (chatToToggle) {
        // Check if it's already pinned
        const isPinned =
          localChats.find((chat) => chat.id === currentChatId)?.isPinned ||
          false;

        // Update UI immediately
        // 1. Update isPinned status in localChats
        setLocalChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === currentChatId ? { ...chat, isPinned: !isPinned } : chat
          )
        );

        // 2. Update pinnedChats list
        if (!isPinned) {
          // Add to pinned chats
          setPinnedChats([...pinnedChats, chatToToggle]);
        } else {
          // Remove from pinned chats
          setPinnedChats((prevPinned) =>
            prevPinned.filter((chat) => chat.id !== currentChatId)
          );
        }

        // 3. Call API in the background
        axiosInstance
          .post(`/conversations/${currentChatId}/toggle-pin`)
          .catch((error) => {
            console.error("Error toggling pin status:", error);
            // Revert changes on error
            setLocalChats((prevChats) =>
              prevChats.map((chat) =>
                chat.id === currentChatId
                  ? { ...chat, isPinned: isPinned }
                  : chat
              )
            );

            if (!isPinned) {
              // Remove from pinned if adding failed
              setPinnedChats((prevPinned) =>
                prevPinned.filter((chat) => chat.id !== currentChatId)
              );
            } else {
              // Add back to pinned if removal failed
              if (chatToToggle) {
                setPinnedChats((prev) => [...prev, chatToToggle]);
              }
            }
          });
      }
    }
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

  const handleRenameSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentChatId && newChatName.trim()) {
      const originalName =
        localChats.find((chat) => chat.id === currentChatId)?.title || "";

      // Update UI immediately
      // 1. Update in local chats
      setLocalChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChatId ? { ...chat, title: newChatName } : chat
        )
      );

      // 2. Update in pinned chats if it exists there
      setPinnedChats((prevPinned) =>
        prevPinned.map((chat) =>
          chat.id === currentChatId ? { ...chat, title: newChatName } : chat
        )
      );

      // 3. Update in storage
      const storage = localStorage.getItem("authToken")
        ? localStorage
        : sessionStorage;
      try {
        const storedConversations = storage.getItem("conversations");
        if (storedConversations) {
          const conversations: ConversationData[] =
            JSON.parse(storedConversations);
          const updatedConversations = conversations.map((conv) =>
            conv.id === currentChatId ? { ...conv, name: newChatName } : conv
          );
          storage.setItem(
            "conversations",
            JSON.stringify(updatedConversations)
          );
        }
      } catch (error) {
        console.error("Error updating stored conversations:", error);
      }

      // 4. Close the rename field
      setIsRenaming(false);

      // 5. Call the rename API endpoint in the background
      axiosInstance
        .patch(`/conversations/${currentChatId}/rename`, {
          name: newChatName.trim(),
        })
        .catch((error) => {
          console.error("Error renaming conversation:", error);

          // Revert changes on error
          setLocalChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, title: originalName }
                : chat
            )
          );

          setPinnedChats((prevPinned) =>
            prevPinned.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, title: originalName }
                : chat
            )
          );

          // Revert in storage
          try {
            const storedConversations = storage.getItem("conversations");
            if (storedConversations) {
              const conversations: ConversationData[] =
                JSON.parse(storedConversations);
              const updatedConversations = conversations.map((conv) =>
                conv.id === currentChatId
                  ? { ...conv, name: originalName }
                  : conv
              );
              storage.setItem(
                "conversations",
                JSON.stringify(updatedConversations)
              );
            }
          } catch (error) {
            console.error("Error reverting stored conversations:", error);
          }
        });
    } else {
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
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("conversations");

    // Update auth state and navigate
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/login");
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  // Calculate dynamic height for pinned chats list
  const pinnedListHeight = Math.min(20, Math.max(10, pinnedChats.length * 10));

  // Function to render chat item with the appropriate controls
  const renderChatItem = (
    chat: { id: string; title: string; isPinned?: boolean },
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
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, chat.id)}
            sx={{
              ml: 1,
              border: "none",
              bgcolor: "transparent",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
              },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </ListItemButton>
      </ListItem>
    );
  };

  // Skeleton for loading state
  const renderChatSkeleton = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, index) => (
        <ListItem
          key={`skeleton-${index}`}
          disablePadding
          sx={{ borderRadius: 2, mb: 0.5 }}
        >
          <ListItemButton
            sx={{
              borderRadius: 2,
              pointerEvents: "none",
            }}
            disabled
          >
            <ListItemIcon>
              <Skeleton variant="circular" width={24} height={24} />
            </ListItemIcon>
            <ListItemText primary={<Skeleton variant="text" width="80%" />} />
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ ml: 1 }}
            />
          </ListItemButton>
        </ListItem>
      ));
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
            bgcolor: sidebarBg, // Use theme background
            overflowX: "hidden",
            boxShadow: "none",
            borderRight: `1px solid ${theme.palette.divider}`,
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
            <SelectContent onClose={() => setIsSelectContentOpen(false)} />
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
                    primary={<span style={{ fontWeight: 400 }}>New Chat</span>}
                  />
                </ListItemButton>
              </ListItem>
              {/* Insights Button */}
              <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemIcon>
                    <InsightsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <span style={{ fontWeight: 400 }}>Integrations</span>
                    }
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
            {/* Loading indicator if we're fetching conversations */}
            {isLoading && (
              <List sx={{ width: "100%" }}>{renderChatSkeleton(10)}</List>
            )}

            {/* Pinned Chats Section */}
            {!isLoading && pinnedChats.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, mt: 2, fontWeight: 400, letterSpacing: 1 }}
                >
                  Pinned Chats
                </Typography>
                <List sx={{ width: "100%" }}>
                  {pinnedChats.map((chat) => renderChatItem(chat, true))}
                </List>
              </>
            )}

            {/* Recent Chats Section Header and List */}
            {!isLoading && localChats.length > 0 && (
              <>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1, mt: 2, fontWeight: 400, letterSpacing: 1 }}
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ width: 36, height: 36 }}>
                {(user.first_name?.[0] || "U").toUpperCase()}
              </Avatar>
              <Box sx={{ mr: "auto" }}>
                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                  {user.first_name || "User"} {user.last_name || ""}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {user.email || ""}
                </Typography>
              </Box>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  border: "none",
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
                  },
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Menu
              anchorEl={userMenuAnchorEl}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              PaperProps={{
                sx: { mt: -1, minWidth: 200 },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  onProfileClick && onProfileClick();
                }}
              >
                <PersonIcon sx={{ mr: 1 }} />
                <span style={{ fontWeight: 600, fontSize: 15 }}>Profile</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  handleLogoutClick();
                }}
              >
                <LogoutIcon sx={{ mr: 1, color: theme.palette.error.main }} />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: theme.palette.error.main,
                  }}
                >
                  Logout
                </span>
              </MenuItem>
            </Menu>
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
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handlePinChat} sx={{ gap: 1 }}>
          {currentChatId &&
          localChats.find((chat) => chat.id === currentChatId)?.isPinned ? (
            <PushPinIcon fontSize="small" sx={{ transform: "rotate(90deg)" }} />
          ) : (
            <PushPinIcon fontSize="small" />
          )}
          <Typography variant="body2">
            {currentChatId &&
            localChats.find((chat) => chat.id === currentChatId)?.isPinned
              ? "Unpin"
              : "Pin"}
          </Typography>
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
              bgcolor: theme.palette.background.paper,
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
              bgcolor: theme.palette.background.paper,
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
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
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
