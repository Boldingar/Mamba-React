import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance, { API_BASE_URL } from "../utils/axios";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

interface FieldError {
  field: string;
  message: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific error when user types
    setFieldErrors(fieldErrors.filter((err) => err.field !== name));

    // Additional validation for email field when typing
    if (name === "email" && value && !value.includes("@")) {
      setFieldErrors((prev) => [
        ...prev.filter((err) => err.field !== "email"),
        { field: "email", message: "Email must contain an @ symbol" },
      ]);
    } else if (name === "email" && value && value.includes("@")) {
      setFieldErrors((prev) => prev.filter((err) => err.field !== "email"));
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    const error = fieldErrors.find((err) => err.field === fieldName);
    return error?.message;
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors([]);
    setIsLoading(true);

    // Validate email contains @
    if (!formData.email.includes("@")) {
      setFieldErrors([
        {
          field: "email",
          message: "Email must contain an @ symbol",
        },
      ]);
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors([
        {
          field: "confirmPassword",
          message: "Passwords do not match",
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(`/register`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });

      // Navigate to login page after successful registration
      navigate("/login");
    } catch (err: any) {
      if (err.response?.data?.detail) {
        // Handle FastAPI validation errors
        if (Array.isArray(err.response.data.detail)) {
          const validationErrors = err.response.data.detail.map(
            (detail: any) => {
              // Extract the field name from the location path
              const fieldPath = detail.loc.filter(
                (item: any) => item !== "body"
              );
              const fieldName = fieldPath[0] || "";

              return {
                field: fieldName,
                message: detail.msg.replace("Value error, ", ""), // Remove prefix for cleaner messages
              };
            }
          );

          setFieldErrors(validationErrors);

          // Set a general error if there are multiple issues
          if (validationErrors.length > 1) {
            setError("Please fix the validation errors below");
          } else if (validationErrors.length === 1) {
            setError(validationErrors[0].message);
          }
        } else {
          // Handle string error messages
          setError(err.response.data.detail);
        }
      } else if (err.response) {
        // Handle other response errors
        setError(`Registration failed: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request
        setError(err.message || "An error occurred during registration");
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
            Register
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
              id="firstName"
              label="First Name"
              name="first_name"
              autoComplete="given-name"
              value={formData.first_name}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!getFieldError("first_name")}
              helperText={getFieldError("first_name")}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="last_name"
              autoComplete="family-name"
              value={formData.last_name}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!getFieldError("last_name")}
              helperText={getFieldError("last_name")}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!getFieldError("email")}
              helperText={getFieldError("email")}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!getFieldError("password")}
              helperText={getFieldError("password")}
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              error={!!getFieldError("confirmPassword")}
              helperText={getFieldError("confirmPassword")}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2">
                Already have an account?{" "}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate("/login")}
                  sx={{ textDecoration: "none" }}
                >
                  Login here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
