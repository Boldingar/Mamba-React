import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import BusinessInfoForm from "./BusinessInfoForm";
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  SendIcon,
  Button,
} from "./ui";
import DataViewer from "./DataViewer";

const API_BASE_URL = "http://127.0.0.1:5000";

// Styled components
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
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

const MessageItem = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isUser" && prop !== "type",
})<{ isUser: boolean; type?: string }>(({ theme, isUser, type }) => ({
  padding: theme.spacing(2),
  maxWidth: "80%",
  alignSelf: isUser ? "flex-end" : "flex-start",
  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.background.paper,
  color: isUser
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  borderRadius: theme.spacing(2),
  position: "relative",
  "&.form": {
    maxWidth: "100%",
    width: "100%",
    backgroundColor: "transparent",
    boxShadow: "none",
  },
}));

const InputContainer = styled("form")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

interface ViewData {
  title: string;
  headers: string[];
  rows: any[][];
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
  type?: "text" | "form" | "form_submitted";
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState<ViewData | null>(null);
  const [agentStatus, setAgentStatus] = useState("");
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval>>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start polling when component mounts
  useEffect(() => {
    pollForUpdates();

    // Set up periodic polling
    pollingIntervalRef.current = setInterval(pollForUpdates, 1000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setAgentStatus("Agent is thinking...");

    try {
      const response = await fetch(`${API_BASE_URL}/send_message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Check if the agent requests the business form
      if (data.show_form) {
        const formRequestMessage: Message = {
          id: Date.now().toString(),
          text:
            data.message || "Please fill out the business information form:",
          sender: "agent",
          timestamp: new Date().toISOString(),
          type: "form",
        };
        setMessages((prev) => [...prev, formRequestMessage]);
        setShowForm(true);
      } else {
        const agentMessage: Message = {
          id: Date.now().toString(),
          text: data.message,
          sender: "agent",
          timestamp: new Date().toISOString(),
          type: "text",
        };
        setMessages((prev) => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, there was an error processing your message. Please try again.",
        sender: "agent",
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAgentStatus("");
    }
  };

  const pollForUpdates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_updates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch updates");

      const data = await response.json();

      // Process updates
      data.updates.forEach((update: any) => {
        if (update.sender === "System") {
          if (update.data.action === "show_form") {
            setShowForm(true);
          } else if (update.data.action === "hide_form") {
            setShowForm(false);
          } else if (update.data.action === "csv_ready") {
            if (update.data.path) {
              setViewData(update.data);
            }
          }
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: update.data.content,
              sender: update.sender.toLowerCase(),
              timestamp: new Date().toISOString(),
              type: update.data.type,
            },
          ]);
        }
      });

      if (data.agent_processing) {
        setAgentStatus("Agent is thinking...");
      } else {
        setAgentStatus("");
      }
    } catch (error) {
      console.error("Error polling for updates:", error);
      setAgentStatus("");
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/submit_business_info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      const data = await response.json();

      const confirmationMessage: Message = {
        id: Date.now().toString(),
        text:
          data.message || "Thank you for submitting your business information!",
        sender: "agent",
        timestamp: new Date().toISOString(),
        type: "form_submitted",
      };

      setMessages((prev) => [...prev, confirmationMessage]);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, there was an error submitting the form. Please try again.",
        sender: "agent",
        timestamp: new Date().toISOString(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleFileClick = (data: ViewData) => {
    setViewData(data);
  };

  const handleCloseView = () => {
    setViewData(null);
  };

  return (
    <Container maxWidth="xl" sx={{ height: "100vh", py: 2 }}>
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
          display: "flex",
          gap: 2,
          height: "calc(100vh - 100px)",
          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            flex: viewData ? "0 0 50%" : "1 1 auto",
            transition: "flex 0.3s ease",
          }}
        >
          <ChatContainer elevation={3}>
            <MessageList ref={chatBoxRef}>
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  isUser={message.sender === "user"}
                  className={message.type === "form" ? "form" : ""}
                >
                  {message.type === "form" ? (
                    <BusinessInfoForm
                      onClose={() => setShowForm(false)}
                      onFileClick={handleFileClick}
                      onSubmit={handleFormSubmit}
                    />
                  ) : (
                    <Typography>{message.text}</Typography>
                  )}
                </MessageItem>
              ))}
              {agentStatus && (
                <Typography
                  variant="caption"
                  sx={{ alignSelf: "center", color: "text.secondary" }}
                >
                  {agentStatus}
                </Typography>
              )}
              <div ref={messagesEndRef} />
            </MessageList>

            <InputContainer onSubmit={handleSendMessage}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                placeholder="Type your message..."
                variant="outlined"
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !inputMessage.trim()}
              >
                Send
              </Button>
            </InputContainer>
          </ChatContainer>
        </Box>

        {viewData && (
          <Box
            sx={{
              flex: "0 0 50%",
              borderLeft: 1,
              borderColor: "divider",
            }}
          >
            <DataViewer
              data={viewData}
              title={viewData.title}
              onClose={handleCloseView}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ChatInterface;
