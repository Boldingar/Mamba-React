import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import axiosInstance from "../utils/axios";

interface UserProfileProps {
  onClose: () => void;
}

interface UserData {
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  // Add more fields as needed
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    // Try to get user data from storage first
    const stored =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setUsernameInput(parsed.username);
      setLoading(false);
    } else {
      // Optionally, fetch from backend if not in storage
      axiosInstance
        .get("/me")
        .then((res) => {
          setUser(res.data);
          setUsernameInput(res.data.username);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load user profile");
          setLoading(false);
        });
    }
  }, []);

  const handleEditUsername = () => {
    setEditingUsername(true);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsernameInput(e.target.value);
  };

  const handleUsernameSave = async () => {
    if (!user) return;
    setSavingUsername(true);
    try {
      // Show popup instead of API call
      alert("Function coming soon!");
      setEditingUsername(false);
      setUser({ ...user, username: usernameInput });
    } catch (e) {
      // Optionally show error
    } finally {
      setSavingUsername(false);
    }
  };

  const handleUsernameInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleUsernameSave();
    }
    if (e.key === "Escape") {
      setEditingUsername(false);
      setUsernameInput(user?.username || "");
    }
  };

  if (loading) return null;
  if (error)
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  if (!user) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        left: 0,
        right: 0,
        zIndex: 1400,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        sx={{
          p: 4,
          minWidth: 350,
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: 6,
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Avatar src={user.avatar_url} sx={{ width: 80, height: 80, mb: 2 }} />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {user.first_name || ""} {user.last_name || ""}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            {editingUsername ? (
              <input
                value={usernameInput}
                onChange={handleUsernameChange}
                onBlur={handleUsernameSave}
                onKeyDown={handleUsernameInputKeyDown}
                disabled={savingUsername}
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  background: "transparent",
                  border: "1px solid #555",
                  borderRadius: 4,
                  color: "inherit",
                  padding: "2px 8px",
                  minWidth: 90,
                  outline: "none",
                }}
                autoFocus
              />
            ) : (
              <>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  @{user.username}
                </Typography>
                <IconButton
                  size="small"
                  sx={{ ml: 0.5, p: 0.5 }}
                  onClick={handleEditUsername}
                >
                  <EditIcon fontSize="inherit" style={{ fontSize: 18 }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <List sx={{ mb: 2, width: "100%" }}>
          <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
            <ListItemText
              primary={
                <>
                  <b>First Name:</b> {user.first_name || "-"}
                </>
              }
            />
          </ListItem>
          <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
            <ListItemText
              primary={
                <>
                  <b>Last Name:</b> {user.last_name || "-"}
                </>
              }
            />
          </ListItem>
          <ListItem disablePadding sx={{ borderRadius: 2, mb: 1 }}>
            <ListItemText
              primary={
                <>
                  <b>Email:</b> {user.email || "-"}
                </>
              }
            />
          </ListItem>
        </List>
        {/* Add more user details here as needed */}
      </Paper>
    </Box>
  );
};

export default UserProfile;
