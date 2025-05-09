import React, { useState, KeyboardEvent, FormEvent } from "react";
import { Box, TextField, Paper, Button } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FileUploadIcon from "@mui/icons-material/FileUpload";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  size?: "normal" | "large";
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  size = "normal",
}) => {
  const [inputMessage, setInputMessage] = useState("");

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
        paddingRight: "16px",
        paddingLeft: "16px",
        maxWidth: "850px",
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
          p: isLarge ? 4 : 3,
          borderRadius: "32px",
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
          placeholder="Start with a topic, a keyword, your site, really anything."
          variant="standard"
          multiline
          maxRows={4}
          InputProps={{
            disableUnderline: true,
            sx: {
              bgcolor: "transparent",
              borderRadius: "24px",
              fontSize: isLarge ? "18px" : "16px",
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
              fontSize: isLarge ? "18px" : "16px",
              px: 0,
            },
            "& .MuiInputBase-input": {
              background: "none",
              border: "none",
              boxShadow: "none",
              fontSize: isLarge ? "18px" : "16px",
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
          }}
        >
          <Button
            variant="outlined"
            startIcon={<LanguageIcon />}
            size="small"
            sx={{
              borderRadius: "20px",
              textTransform: "none",
              px: 2,
              fontSize: "13px",
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
              px: 2,
              fontSize: "13px",
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
