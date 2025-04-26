import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

const TopAppBar: React.FC = () => {
    return (
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{ bgcolor: "background.default", zIndex: 1302 }}
      >
        <Toolbar
          sx={{
            minHeight: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
          }}
        >
          <Box component="img"
            src="/MambaLogo.svg"
            alt="Mamba Logo"
            sx={{
              maxHeight: 60,
              maxWidth: 200,
              objectFit: "contain",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: 16, sm: 20 },
              color: "text.primary",
              opacity: 0.9,
              fontFamily: "inherit",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            Lily - Senior SEO Engineer
          </Typography>
        </Toolbar>
      </AppBar>
    );
  };
  

export default TopAppBar;
