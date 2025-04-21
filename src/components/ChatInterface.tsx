import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import BusinessInfoForm from "./BusinessInfoForm";
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  Button,
} from "./ui";

const API_BASE_URL = "http://127.0.0.1:5000";

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "calc(100vh - 180px)",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(2),
  overflow: "hidden",
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
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
  borderRadius: theme.spacing(2),
  "&.form": {
    maxWidth: "100%",
    width: "100%",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
}));

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  type?: "text" | "form" | "form_submitted";
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start polling when component mounts
  useEffect(() => {
    const pollForUpdates = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_updates`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch updates");
        const data = await response.json();

        // Handle agent_processing and show_form directly from response
        if (data.show_form) {
          setShowForm(true);
          // Add a message prompting for business info if there isn't one
          setMessages((prev) => {
            const hasFormMessage = prev.some((msg) => msg.type === "form");
            if (!hasFormMessage) {
              return [
                ...prev,
                {
                  id: Date.now().toString(),
                  text: "Please provide your business information:",
                  sender: "agent",
                  type: "form",
                },
              ];
            }
            return prev;
          });
        }

        // Process any additional updates
        data.updates.forEach((update: any) => {
          if (update.sender === "System") {
            if (update.data.action === "hide_form") {
              setShowForm(false);
            }
          } else if (update.data.content) {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                text: update.data.content,
                sender: update.sender.toLowerCase(),
                type: update.data.type || "text",
              },
            ]);
          }
        });
      } catch (error) {
        console.error("Error polling for updates:", error);
      }
    };

    // Initial poll
    pollForUpdates();

    // Set up polling interval (every 3 seconds)
    pollingIntervalRef.current = setInterval(pollForUpdates, 3000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/send_message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      const agentMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        sender: "agent",
        type: data.show_form ? "form" : "text",
      };

      setMessages((prev) => [...prev, agentMessage]);
      setShowForm(data.show_form);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Sorry, there was an error. Please try again.",
          sender: "agent",
          type: "text",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit_data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: data.message || "Thank you for submitting your information!",
          sender: "agent",
          type: "form_submitted",
        },
      ]);
      setShowForm(false);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Sorry, there was an error submitting the form. Please try again.",
          sender: "agent",
          type: "text",
        },
      ]);
    }
  };

  return (
    <Container maxWidth={false} sx={{ height: "100vh", py: 2, px: 4 }}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ mb: 2 }}
      >
        <Toolbar>
          <Avatar src="/logo.svg" sx={{ mr: 2 }} />
          <Typography variant="h6">Mamba AI Assistant</Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          maxWidth: "1600px",
          mx: "auto",
          height: "calc(100vh - 100px)",
        }}
      >
        <ChatContainer elevation={3}>
          <MessageList>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                isUser={message.sender === "user"}
                className={message.type === "form" ? "form" : ""}
              >
                {message.type === "form" && showForm ? (
                  <BusinessInfoForm
                    onSubmit={handleFormSubmit}
                    onClose={() => setShowForm(false)}
                    onFileClick={() => {}}
                  />
                ) : (
                  <Typography>{message.text}</Typography>
                )}
              </MessageItem>
            ))}
            {isLoading && (
              <Typography
                variant="caption"
                sx={{ alignSelf: "center", color: "text.secondary" }}
              >
                Processing...
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </MessageList>

          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Type your message..."
              multiline
              maxRows={4}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </Button>
          </Box>
        </ChatContainer>
      </Box>
    </Container>
  );
};

export default ChatInterface;
