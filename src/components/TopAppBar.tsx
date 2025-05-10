import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTheme } from "../context/ThemeContext";
import { alpha } from "@mui/material/styles";

interface TopAppBarProps {
  csvPanelOpen: boolean;
  onToggleCSVPanel: () => void;
  hasDataToShow?: boolean;
}

const TopAppBar: React.FC<TopAppBarProps> = ({
  csvPanelOpen,
  onToggleCSVPanel,
  hasDataToShow = false,
}) => {
  const { mode } = useTheme();

  // Define SVG code for the logo with color based on theme
  const logoSvg = (
    <svg
      width="111"
      height="24"
      viewBox="0 0 111 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M38.9012 7.90112H42.2898V23.5918H38.9012V21.3317C37.6249 23.1087 35.7957 23.9999 33.4097 23.9999C31.2568 23.9999 29.4162 23.2003 27.888 21.5992C26.3628 19.997 25.5977 18.0472 25.5977 15.7475C25.5977 13.4478 26.3618 11.4698 27.888 9.87911C29.4162 8.28943 31.2568 7.49512 33.4097 7.49512C35.7947 7.49512 37.6249 8.37376 38.9012 10.1279V7.90217V7.90112ZM30.4 19.3401C31.3401 20.2906 32.5227 20.7653 33.9448 20.7653C35.3668 20.7653 36.5495 20.2906 37.4916 19.3401C38.4317 18.3855 38.9022 17.1883 38.9022 15.7475C38.9022 14.3067 38.4317 13.1064 37.4916 12.1548C36.5495 11.2044 35.3668 10.7276 33.9448 10.7276C32.5227 10.7276 31.3401 11.2044 30.4 12.1548C29.4589 13.1074 28.9863 14.3036 28.9863 15.7475C28.9863 17.1914 29.4579 18.3865 30.4 19.3401Z"
        fill={mode === "dark" ? "white" : "black"}
      />
      <path
        d="M61.902 7.49512C63.6801 7.49512 65.1116 8.07186 66.1994 9.22117C67.2873 10.3705 67.8308 11.9175 67.8308 13.8653V23.5907H64.4432V14.0839C64.4432 12.9981 64.1684 12.1548 63.627 11.5594C63.0826 10.9608 62.3392 10.663 61.3971 10.663C60.3509 10.663 59.5211 11.0086 58.9038 11.6999C58.2854 12.3891 57.9783 13.4239 57.9783 14.8043V23.5918H54.5876V14.0849C54.5876 12.9991 54.3336 12.1559 53.8214 11.5604C53.3061 10.9618 52.5805 10.6641 51.6415 10.6641C50.614 10.6641 49.779 11.0159 49.1305 11.7176C48.4809 12.4193 48.1581 13.4478 48.1581 14.8053V23.5928H44.7695V7.90217H48.1581V9.78438C49.1627 8.2582 50.6556 7.49512 52.644 7.49512C54.6324 7.49512 56.1357 8.32171 57.0997 9.97385C58.1459 8.32171 59.745 7.49512 61.901 7.49512H61.902Z"
        fill={mode === "dark" ? "white" : "black"}
      />
      <path
        d="M78.8713 7.49276C81.0241 7.49276 82.8647 8.28707 84.393 9.87883C85.9181 11.4664 86.6833 13.4225 86.6833 15.7451C86.6833 18.0677 85.9181 19.9967 84.393 21.5989C82.8647 23.1969 81.0231 23.9975 78.8713 23.9975C76.4862 23.9975 74.6561 23.1084 73.3797 21.3293V23.5894H69.9922V1.62646H73.3797V10.1297C74.6561 8.37348 76.4852 7.49484 78.8713 7.49484V7.49276ZM74.7893 19.3378C75.7315 20.2882 76.9141 20.765 78.3362 20.765C79.7582 20.765 80.9409 20.2882 81.8809 19.3378C82.822 18.3842 83.2947 17.187 83.2947 15.7451C83.2947 14.3033 82.8231 13.104 81.8809 12.1525C80.9409 11.202 79.7582 10.7252 78.3362 10.7252C76.9141 10.7252 75.7315 11.202 74.7893 12.1525C73.8503 13.105 73.3787 14.3012 73.3787 15.7451C73.3787 17.1891 73.8503 18.3842 74.7893 19.3378Z"
        fill={mode === "dark" ? "white" : "black"}
      />
      <path
        d="M100.71 7.90112H104.098V23.5918H100.71V21.3317C99.4334 23.1087 97.6043 23.9999 95.2183 23.9999C93.0654 23.9999 91.2248 23.2003 89.6965 21.5992C88.1714 19.997 87.4062 18.0472 87.4062 15.7475C87.4062 13.4478 88.1714 11.4698 89.6965 9.87911C91.2248 8.28943 93.0654 7.49512 95.2183 7.49512C97.6033 7.49512 99.4334 8.37376 100.71 10.1279V7.90217V7.90112ZM92.2086 19.3401C93.1487 20.2906 94.3313 20.7653 95.7534 20.7653C97.1754 20.7653 98.358 20.2906 99.3002 19.3401C100.239 18.3855 100.711 17.1883 100.711 15.7475C100.711 14.3067 100.239 13.1064 99.3002 12.1548C98.358 11.2044 97.1754 10.7276 95.7534 10.7276C94.3313 10.7276 93.1487 11.2044 92.2086 12.1548C91.2675 13.1074 90.7949 14.3036 90.7949 15.7475C90.7949 17.1914 91.2664 18.3865 92.2086 19.3401Z"
        fill={mode === "dark" ? "white" : "black"}
      />
      <path
        d="M23.8222 1.62646V23.5873H20.215V4.33422L14.1624 23.5873H9.65882L3.60722 4.33631V23.5873H0V1.62646H6.36287L11.9116 19.2763L17.4594 1.62646H23.8222Z"
        fill={mode === "dark" ? "white" : "black"}
      />
      <path
        d="M110.878 0V6.77616H107.49V3.3886H104.102V0H110.878Z"
        fill={mode === "dark" ? "white" : "black"}
      />
    </svg>
  );

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 60,
          }}
        >
          {logoSvg}
        </Box>
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
        <Box sx={{ flex: 1 }} />
        {hasDataToShow && (
          <IconButton
            color={csvPanelOpen ? "primary" : "default"}
            onClick={onToggleCSVPanel}
            sx={{
              mr: 1,
              width: 56,
              height: 56,
              border: "none",
              bgcolor: "transparent",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04),
              },
            }}
          >
            <DescriptionIcon sx={{ fontSize: 34 }} />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopAppBar;
