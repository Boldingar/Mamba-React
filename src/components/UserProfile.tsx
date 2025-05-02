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
import axiosInstance from "../utils/axios";

interface UserProfileProps {
  onClose: () => void;
}

interface UserData {
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

  useEffect(() => {
    // Try to get user data from storage first
    const stored =
      localStorage.getItem("userData") || sessionStorage.getItem("userData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setLoading(false);
    } else {
      // Optionally, fetch from backend if not in storage
      axiosInstance
        .get("/me")
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load user profile");
          setLoading(false);
        });
    }
  }, []);

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
          <Typography variant="subtitle1" color="text.secondary">
            {user.email || ""}
          </Typography>
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
        </List>
        {/* Add more user details here as needed */}
      </Paper>
    </Box>
  );
};

export default UserProfile;
