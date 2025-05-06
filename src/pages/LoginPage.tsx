import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance, { API_BASE_URL } from "../utils/axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface LoginPageProps {
  setIsAuthenticated?: (auth: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateEmail = (email: string): boolean => {
    if (!email.includes("@")) {
      setEmailError("Email must contain an @ symbol");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Clear error when user types
    if (emailError && newEmail.includes("@")) {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email before submission
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post(`/login`, {
        email,
        password,
      });

      const { access_token, user, conversations, token_type } = response.data;

      // Store the token, user data, and conversations if remember me is checked
      if (rememberMe) {
        localStorage.setItem("authToken", access_token);
        localStorage.setItem("userData", JSON.stringify(user));
        localStorage.setItem(
          "conversations",
          JSON.stringify(conversations || [])
        );
      } else {
        // For non-remember-me sessions, store in sessionStorage instead
        // This will be cleared when the browser/tab is closed
        sessionStorage.setItem("authToken", access_token);
        sessionStorage.setItem("userData", JSON.stringify(user));
        sessionStorage.setItem(
          "conversations",
          JSON.stringify(conversations || [])
        );
      }

      // Redirect to chat page after successful login
      if (setIsAuthenticated) setIsAuthenticated(true);
      navigate("/chat");
    } catch (err: any) {
      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else if (err.response.status === 422) {
          // Handle validation errors
          if (err.response.data && err.response.data.detail) {
            // If the error has a structured format
            if (Array.isArray(err.response.data.detail)) {
              // Process structured validation errors
              const validationErrors = err.response.data.detail
                .map((item: any) => `${item.loc[1]}: ${item.msg}`)
                .join(", ");
              setError(`Validation error: ${validationErrors}`);
            } else if (typeof err.response.data.detail === "string") {
              setError(err.response.data.detail);
            } else {
              setError("Invalid input data. Please check your email format.");
            }
          } else {
            setError("Invalid input data. Please check your email format.");
          }
        } else if (err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError(`Login failed: ${err.response.status}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || "An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
              error={!!emailError}
              helperText={emailError}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                },
                "& label.Mui-focused": {
                  color: "text.primary",
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.23)",
                  },
                },
                "& label.Mui-focused": {
                  color: "text.primary",
                },
              }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                Don't have an account????????????{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/register")}
                  sx={{ textDecoration: "none" }}
                >
                  Register here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
