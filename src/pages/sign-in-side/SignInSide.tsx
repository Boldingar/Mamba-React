import React from "react";
import { Box, useTheme } from "@mui/material";
import SignInCard from "../../../sign-in-side/components/SignInCard";
import Content from "../../../sign-in-side/components/Content";
import { useIsMobile } from "../../utils/responsive";

interface SignInSideProps {
  setIsAuthenticated?: (auth: boolean) => void;
}

const SignInSide: React.FC<SignInSideProps> = ({ setIsAuthenticated }) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  // Mobile view - only show the sign-in card centered
  if (isMobile) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          bgcolor: theme.palette.background.default,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <SignInCard setIsAuthenticated={setIsAuthenticated} />
      </Box>
    );
  }

  // Desktop view - keep sign-in card on left, image on right
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
      {/* Right Side - Image */}
      <Box
        sx={{
          flex: 1,
          maxWidth: "50%",
        }}
      >
        <Content />
      </Box>
    </Box>
  );
};

export default SignInSide;
