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
  ListItemIcon,
  Switch,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import axiosInstance from "../utils/axios";
import { useTheme } from "../context/ThemeContext";
import { useTheme as useMuiTheme } from "@mui/material/styles";

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
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  // Create a standalone theme for the UserProfile component
  const profileTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode === "dark" ? "dark" : "light",
          background: {
            paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
          },
          text: {
            primary: mode === "dark" ? "#ffffff" : "#000000",
            secondary: mode === "dark" ? "#b0b0b0" : "#666666",
          },
          primary: muiTheme.palette.primary,
          secondary: muiTheme.palette.secondary,
          error: muiTheme.palette.error,
          warning: muiTheme.palette.warning,
          info: muiTheme.palette.info,
          success: muiTheme.palette.success,
        },
      }),
    [mode, muiTheme.palette]
  );

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
      <ThemeProvider theme={profileTheme}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            m: 2,
            backgroundColor: profileTheme.palette.background.paper,
            color: profileTheme.palette.text.primary,
          }}
        >
          <Typography color="error">{error}</Typography>
        </Paper>
      </ThemeProvider>
    );
  if (!user) return null;

  return (
    <ThemeProvider theme={profileTheme}>
      <Box
        sx={{
          position: "fixed",
          top: 80,
          left: 0,
          right: 0,
          zIndex: 1400,
          display: "flex",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            minWidth: 350,
            maxWidth: 420,
            borderRadius: 4,
            boxShadow:
              mode === "dark"
                ? "0 8px 16px rgba(0,0,0,0.6)"
                : "0 8px 16px rgba(0,0,0,0.1)",
            position: "relative",
            backgroundColor: profileTheme.palette.background.paper,
            color: profileTheme.palette.text.primary,
            transition: "all 0.3s ease",
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: profileTheme.palette.text.secondary,
            }}
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
            <Avatar
              src={user.avatar_url}
              sx={{ width: 80, height: 80, mb: 2 }}
            />
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              color="text.primary"
            >
              {user.first_name || ""} {user.last_name || ""}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user.email || ""}
            </Typography>
          </Box>
          <Divider sx={{ my: 2, background: profileTheme.palette.divider }} />
          <List sx={{ mb: 2, width: "100%" }}>
            <ListItem
              disablePadding
              sx={{
                borderRadius: 2,
                mb: 1,
                p: 1,
                "&:hover": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography color="text.primary">
                    <b>First Name:</b> {user.first_name || "-"}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem
              disablePadding
              sx={{
                borderRadius: 2,
                mb: 1,
                p: 1,
                "&:hover": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography color="text.primary">
                    <b>Last Name:</b> {user.last_name || "-"}
                  </Typography>
                }
              />
            </ListItem>
            <ListItem
              disablePadding
              sx={{
                borderRadius: 2,
                mb: 1,
                p: 1,
                "&:hover": {
                  backgroundColor:
                    mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                },
              }}
            >
              <ListItemIcon>
                {mode === "dark" ? (
                  <DarkModeIcon
                    sx={{ color: profileTheme.palette.primary.main }}
                  />
                ) : (
                  <LightModeIcon
                    sx={{ color: profileTheme.palette.primary.main }}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography color="text.primary">Theme Mode</Typography>
                }
              />
              <Switch
                edge="end"
                checked={mode === "dark"}
                onChange={toggleTheme}
                color="primary"
              />
            </ListItem>
          </List>
          {/* Add more user details here as needed */}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default UserProfile;
