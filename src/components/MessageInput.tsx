import React, { useState, KeyboardEvent, FormEvent } from "react";
import {
  Box,
  TextField,
  Paper,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FileUploadIcon from "@mui/icons-material/FileUpload";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  size?: "normal" | "large";
  isNewChat?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  size = "normal",
  isNewChat = false,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !disabled) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const isLarge = size === "large";

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        px: { xs: 1, sm: 2 },
        maxWidth: { xs: "100%", sm: "700px", md: "850px" },
        maxHeight: {
          xs: "120px",
          sm: isLarge ? "150px" : "130px",
          md: isLarge ? "180px" : "150px",
        },
        display: "flex",
        borderRadius: { xs: "30px", sm: "60px" },
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2, sm: isLarge ? 3 : 2, md: isLarge ? 4 : 3 },
          borderRadius: { xs: "16px", sm: "24px", md: "32px" },
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          bgcolor: "background.paper",
          border: "0.5px solid",
          borderColor: "grey.800",
          width: "100%",
          position: "relative",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <TextField
          fullWidth
          size={isMobile ? "small" : isLarge ? "medium" : "small"}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          placeholder={
            isNewChat
              ? "Start with a topic, a keyword, your site, really anything."
              : "Ask anything..."
          }
          variant="standard"
          multiline
          maxRows={isMobile ? 3 : 4}
          InputProps={{
            disableUnderline: true,
            sx: {
              bgcolor: "transparent",
              borderRadius: { xs: "16px", sm: "24px" },
              fontSize: {
                xs: "14px",
                sm: isLarge ? "16px" : "15px",
                md: isLarge ? "18px" : "16px",
              },
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              px: 0,
            },
          }}
          sx={{
            background: "none",
            border: "none",
            "& .MuiInputBase-root": {
              background: "none",
              border: "none",
              boxShadow: "none",
              fontSize: {
                xs: "14px",
                sm: isLarge ? "16px" : "15px",
                md: isLarge ? "18px" : "16px",
              },
              px: 0,
            },
            "& .MuiInputBase-input": {
              background: "none",
              border: "none",
              boxShadow: "none",
              fontSize: {
                xs: "14px",
                sm: isLarge ? "16px" : "15px",
                md: isLarge ? "18px" : "16px",
              },
              px: 0,
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.5, sm: 1 },
            mt: 1,
            justifyContent: "flext-start",
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<LanguageIcon />}
            size={isMobile ? "small" : "small"}
            sx={{
              borderRadius: { xs: "16px", sm: "20px" },
              textTransform: "none",
              px: { xs: 1, sm: 2 },
              fontSize: { xs: "11px", sm: "12px", md: "13px" },
              color: "text.primary",
              borderColor: "grey.300",
              "&:hover": {
                borderColor: "grey.400",
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
              mb: { xs: 1, sm: 0 },
            }}
          >
            Use my website
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            size={isMobile ? "small" : "small"}
            sx={{
              borderRadius: { xs: "16px", sm: "20px" },
              textTransform: "none",
              px: { xs: 1, sm: 2 },
              fontSize: { xs: "11px", sm: "12px", md: "13px" },
              color: "text.primary",
              borderColor: "grey.300",
              "&:hover": {
                borderColor: "grey.400",
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
              mb: { xs: 1, sm: 0 },
            }}
          >
            Upload keywords
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageInput;
