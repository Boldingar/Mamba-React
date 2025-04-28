import React from "react";
import { Box, Avatar } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";

// Copied from ChatComponent
const MessageWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isUser",
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  justifyContent: isUser ? "flex-end" : "flex-start",
  alignItems: "flex-start",
}));

const MessageItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isUser" && prop !== "type",
})<{ isUser: boolean; type?: string }>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  maxWidth: "90%",
  alignSelf: isUser ? "flex-end" : "flex-start",
  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  color: isUser
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  borderRadius: theme.spacing(3),
  "&.form": {
    maxWidth: "100%",
    width: "100%",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
}));

// Add custom styles specifically for this file
const styleContent = `
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}
`;

const TypingIndicator: React.FC = () => {
  return (
    <>
      <style>{styleContent}</style>
      <MessageWrapper isUser={false}>
        <Avatar
          src="/agent.png"
          sx={{
            width: 34,
            height: 34,
            mt: 0,
          }}
        />
        <MessageItem
          isUser={false}
          sx={{
            py: 1.5,
            px: 2.5,
            minHeight: "unset",
            minWidth: 60,
            maxWidth: 80,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.7, height:15 }}>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "text.secondary",
                display: "inline-block",
                animation: "bounce 1.4s infinite ease-in-out both",
                animationDelay: "0s",
                mt: 0.65,
              }}
            />
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "text.secondary",
                display: "inline-block",
                animation: "bounce 1.4s infinite ease-in-out both",
                animationDelay: "0.2s",
                mt: 0.65,

              }}
            />
            <Box
              component="span"
              sx={{
                width: 7,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "text.secondary",
                display: "inline-block",
                animation: "bounce 1.4s infinite ease-in-out both",
                animationDelay: "0.4s",
                mt: 0.65,
              }}
            />
          </Box>
        </MessageItem>
      </MessageWrapper>
    </>
  );
};

export default TypingIndicator;
