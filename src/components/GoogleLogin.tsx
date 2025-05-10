import React, { useEffect, useState, useCallback } from "react";
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

  const initializeGoogleSignIn = useCallback(() => {
    console.log("Initializing Google Sign-In...");
    if (!window.google || !isScriptLoaded) {
      console.log("Google API not yet available");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      console.log("Rendering Google Sign-In button...");
      const buttonElement = document.getElementById("google-signin-button");
      if (buttonElement) {
        window.google.accounts.id.renderButton(buttonElement, {
          theme: "outline",
          size: "large",
          width: 380,
          text: "signin_with",
          shape: "rectangular",
        });
      } else {
        console.error("Google Sign-In button element not found");
      }
    } catch (error) {
      console.error("Error initializing Google Sign-In:", error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [clientId, isScriptLoaded, onError]);

  useEffect(() => {
    // Check if the script is already loaded
    const existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (existingScript) {
      console.log("Google API script already loaded");
      setIsScriptLoaded(true);
      initializeGoogleSignIn();
      return;
    }

    console.log("Loading Google API script...");
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google API script loaded successfully");
      setIsScriptLoaded(true);
      initializeGoogleSignIn();
    };
    script.onerror = (error) => {
      console.error("Error loading Google API script:", error);
      if (onError) {
        onError(new Error("Failed to load Google API script"));
      }
    };
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [initializeGoogleSignIn]);

  // Re-initialize when clientId changes
  useEffect(() => {
    if (isScriptLoaded) {
      initializeGoogleSignIn();
    }
  }, [clientId, isScriptLoaded, initializeGoogleSignIn]);

  const handleCredentialResponse = async (response: any) => {
    try {
      console.log("Received Google Sign-In response:", response);
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
