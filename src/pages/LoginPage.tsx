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
import GoogleLogin from "../components/GoogleLogin";

interface LoginPageProps {
  setIsAuthenticated?: (auth: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  setIsAuthenticated,
}): JSX.Element => {
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
      const loginResponse = await axiosInstance.post(`/login`, {
        email,
        password,
      });

      const { access_token, user } = loginResponse.data;

      // Set the auth token for subsequent requests
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;

      // Store the token and user data
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem("authToken", access_token);
      storage.setItem("userData", JSON.stringify(user));

      if (setIsAuthenticated) setIsAuthenticated(true);
      navigate("/chat");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleUser: any) => {
    try {
      const loginResponse = await axiosInstance.post("/auth/google", {
        token: googleUser.token,
      });

      const { access_token, user } = loginResponse.data;

      // Set the auth token for subsequent requests
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${access_token}`;

      // Store the token and user data
      localStorage.setItem("authToken", access_token);
      localStorage.setItem("userData", JSON.stringify(user));

      if (setIsAuthenticated) setIsAuthenticated(true);
      navigate("/chat");
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Google authentication failed. Please try again."
      );
    }
  };

  const handleGoogleError = (error: Error) => {
    console.error("Google login error:", error);
    // Handle the error appropriately
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
                Don't have an account?{" "}
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

          <Box sx={{ position: "relative", my: 4 }}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                transform: "translateY(-50%)",
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{
                  textAlign: "center",
                  bgcolor: "background.paper",
                  display: "inline-block",
                  px: 2,
                  position: "relative",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "text.secondary",
                }}
              >
                or
              </Typography>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }} />
          </Box>

          <Box sx={{ width: "100%" }}>
            <GoogleLogin
              clientId="890844016593-ec67bfb6poh7q86cr26icctq68v1vmh5.apps.googleusercontent.com"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
