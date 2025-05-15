import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import ForgotPassword from "./ForgotPassword";
import { GoogleIcon, FacebookIcon, SitemarkIcon } from "./CustomIcons";
import axiosInstance from "../../src/utils/axios";
import { useNavigate } from "react-router-dom";
import GoogleLogin from "../../src/components/GoogleLogin";
import { saveIntegrationStatus } from "../../src/utils/authRedirect";

interface SignInCardProps {
  setIsAuthenticated?: (auth: boolean) => void;
}

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(5),
  gap: theme.spacing(2.5),
  borderRadius: "20px",
  boxShadow: "0px 4px 35px rgba(0, 0, 0, 0.08)",
  background: theme.palette.background.paper,
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
}));

export default function SignInCard({ setIsAuthenticated }: SignInCardProps) {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const validateInputs = () => {
    let isValid = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }
    if (!password || password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }
    return isValid;
  };

  const handleLoginSuccess = (
    access_token: string,
    user: any,
    projects: any[],
    connected_to_search_console?: boolean,
    connected_to_ga4?: boolean
  ) => {
    // Set the auth token for subsequent requests
    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${access_token}`;

    // Store the token and user data
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("authToken", access_token);
    storage.setItem("userData", JSON.stringify(user));

    // Update authentication state if prop is provided
    if (setIsAuthenticated) {
      setIsAuthenticated(true);
    }

    // Save integration status if available in the response
    if (connected_to_search_console !== undefined) {
      saveIntegrationStatus("search_console", connected_to_search_console);
    }

    if (connected_to_ga4 !== undefined) {
      saveIntegrationStatus("ga4", connected_to_ga4);
    }

    // Redirect based on whether user has projects
    if (!projects || projects.length === 0) {
      navigate("/new-project");
    } else {
      navigate("/chat");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!validateInputs()) return;
    setIsLoading(true);
    try {
      const loginResponse = await axiosInstance.post(`/login`, {
        email,
        password,
      });
      const {
        access_token,
        user,
        projects,
        connected_to_search_console,
        connected_to_ga4,
      } = loginResponse.data;

      handleLoginSuccess(
        access_token,
        user,
        projects,
        connected_to_search_console,
        connected_to_ga4
      );
    } catch (error: any) {
      if (error.response?.status === 401) setError("Invalid email or password");
      else setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google login logic
  const handleGoogleSuccess = async (googleUser: any) => {
    try {
      const loginResponse = await axiosInstance.post("/auth/google", {
        token: googleUser.token,
      });
      const {
        access_token,
        user,
        projects,
        connected_to_search_console,
        connected_to_ga4,
      } = loginResponse.data;

      handleLoginSuccess(
        access_token,
        user,
        projects,
        connected_to_search_console,
        connected_to_ga4
      );
    } catch (error: any) {
      setError(
        error.response?.data?.detail ||
          "Google authentication failed. Please try again."
      );
    }
  };

  return (
    <Card variant="outlined">
      <Typography
        component="h1"
        variant="h4"
        sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
      >
        Welcome Back 👋
      </Typography>
      <Typography sx={{ width: "100%", fontSize: "16px" }}>
        Sign in to to start managing your projects
      </Typography>
      {error && (
        <Typography color="error" sx={{ textAlign: "center", mb: 1 }}>
          {error}
        </Typography>
      )}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <TextField
            error={emailError}
            helperText={emailErrorMessage}
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailError ? "error" : "primary"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Link
              component="button"
              type="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "baseline" }}
            >
              Forgot your password?
            </Link>
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            required
            fullWidth
            variant="outlined"
            color={passwordError ? "error" : "primary"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              value="remember"
              color="primary"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          }
          label="Remember me"
        />
        <ForgotPassword open={open} handleClose={handleClose} />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <Typography sx={{ textAlign: "center" }}>
          Don&apos;t have an account?{" "}
          <span>
            <Link href="/register" variant="body2" sx={{ alignSelf: "center" }}>
              Sign up
            </Link>
          </span>
        </Typography>
      </Box>
      <Divider>or</Divider>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <GoogleLogin
          clientId="890844016593-ec67bfb6poh7q86cr26icctq68v1vmh5.apps.googleusercontent.com"
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google login failed.")}
        />
      </Box>
    </Card>
  );
}
