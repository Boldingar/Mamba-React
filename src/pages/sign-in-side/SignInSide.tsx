import React from "react";
import { Box, useTheme } from "@mui/material";
import SignInCard from "../../../sign-in-side/components/SignInCard";
import Content from "../../../sign-in-side/components/Content";

interface SignInSideProps {
  setIsAuthenticated?: (auth: boolean) => void;
}

const SignInSide: React.FC<SignInSideProps> = ({ setIsAuthenticated }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: theme.palette.background.default,
        display: "flex",
        overflow: "hidden",
      }}
    >
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 2, sm: 4 },
              }}
            >
              <SignInCard setIsAuthenticated={setIsAuthenticated} />
            </Box>
      {/* Left Side - Image */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "block" },
          maxWidth: "50%",
        }}
      >
        <Content />
      </Box>

      {/* Right Side - Sign In Form */}
    </Box>
  );
};

export default SignInSide;
