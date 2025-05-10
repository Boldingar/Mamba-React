import React, { useEffect, useState } from "react";
import { Box, Button, Avatar, Typography, Paper } from "@mui/material";

interface GoogleLoginProps {
  clientId: string;
  onSuccess: (response: any) => void;
  onError?: (error: Error) => void;
}

interface GoogleUser {
  email: string;
  name: string;
  imageUrl: string;
  token: string;
}

export default function GoogleLogin({
  clientId,
  onSuccess,
  onError,
}: GoogleLoginProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [user, setUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    // Load the Google API script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      initializeGoogleSignIn();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializeGoogleSignIn = () => {
    if (!window.google || !isScriptLoaded) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-button")!,
      {
        theme: "outline",
        size: "large",
        width: 380,
        text: "signin_with",
        shape: "rectangular",
      }
    );
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // The response contains a JWT token in response.credential
      const token = response.credential;

      // Decode the JWT token to get user information
      const decodedToken = JSON.parse(atob(token.split(".")[1]));

      const googleUser: GoogleUser = {
        email: decodedToken.email,
        name: decodedToken.name,
        imageUrl: decodedToken.picture,
        token: token,
      };

      setUser(googleUser);
      onSuccess(googleUser);
    } catch (error) {
      console.error("Error handling Google sign-in:", error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleSignOut = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
      setUser(null);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      {!user ? (
        <Box
          id="google-signin-button"
          sx={{ width: "100%", display: "flex", justifyContent: "center" }}
        />
      ) : (
        <Paper elevation={1} sx={{ p: 2, width: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={user.imageUrl} alt={user.name} />
            <Box>
              <Typography variant="subtitle1">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleSignOut}
            sx={{ mt: 2 }}
          >
            Sign Out
          </Button>
        </Paper>
      )}
    </Box>
  );
}

// Add type declaration for the Google API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
