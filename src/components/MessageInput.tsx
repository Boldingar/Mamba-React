import React, { useState, KeyboardEvent, FormEvent } from "react";
import { Box, TextField, Paper, Button } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import FileUploadIcon from "@mui/icons-material/FileUpload";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = (e: FormEvent | KeyboardEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSend(e);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        // my: 2,
        paddingRight: "16px",
        paddingLeft: "16px",
        maxWidth: "850px",
        maxHeight: "150px",
        display: "flex",
        borderRadius: "60px",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
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
        component="form"
        onSubmit={handleSend}
      >
        <TextField
          fullWidth
          size="small"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
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
              fontSize: "16px",
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
              fontSize: "16px",
              px: 0,
            },
            "& .MuiInputBase-input": {
              background: "none",
              border: "none",
              boxShadow: "none",
              fontSize: "16px",
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
