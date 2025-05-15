import React, { useState, KeyboardEvent, FormEvent } from "react";
import { Box, TextField, Paper, Button } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { useIsMobile } from "../utils/responsive";

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
  const isMobile = useIsMobile();

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
        paddingRight: isMobile ? "4px" : "16px",
        paddingLeft: isMobile ? "4px" : "16px",
        paddingBottom: isMobile ? "12px" : "16px",
        paddingTop: isMobile ? "4px" : 0,
        maxWidth: isMobile ? "98%" : "850px",
        maxHeight: isLarge ? "180px" : "150px",
        display: "flex",
        borderRadius: "60px",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: isMobile ? (isLarge ? 2 : 1.5) : isLarge ? 4 : 3,
          borderRadius: isMobile ? "24px" : "32px",
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
          size={isLarge ? "medium" : "small"}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          placeholder={
            isNewChat
              ? isMobile
                ? "Enter a topic or keyword..."
                : "Start with a topic, a keyword, your site, really anything."
              : "Ask anything..."
          }
          variant="standard"
          multiline
          maxRows={isMobile ? 3 : 4}
          InputProps={{
            disableUnderline: true,
            sx: {
              bgcolor: "transparent",
              borderRadius: "24px",
              fontSize: isMobile
                ? isLarge
                  ? "16px"
                  : "14px"
                : isLarge
                ? "18px"
                : "16px",
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
              fontSize: isMobile
                ? isLarge
                  ? "16px"
                  : "14px"
                : isLarge
                ? "18px"
                : "16px",
              px: 0,
            },
            "& .MuiInputBase-input": {
              background: "none",
              border: "none",
              boxShadow: "none",
              fontSize: isMobile
                ? isLarge
                  ? "16px"
                  : "14px"
                : isLarge
                ? "18px"
                : "16px",
              px: 0,
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1,
            justifyContent: "flext-start",
            flexWrap: isMobile ? "wrap" : "nowrap",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<LanguageIcon />}
            size="small"
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              px: isMobile ? 1 : 2,
              fontSize: isMobile ? "12px" : "13px",
              color: "text.primary",
              borderColor: "grey.300",
              "&:hover": {
                borderColor: "grey.400",
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
            }}
          >
            Use my website
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            size="small"
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              px: isMobile ? 1 : 2,
              fontSize: isMobile ? "12px" : "13px",
              color: "text.primary",
              borderColor: "grey.300",
              "&:hover": {
                borderColor: "grey.400",
                bgcolor: "rgba(0, 0, 0, 0.02)",
              },
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
