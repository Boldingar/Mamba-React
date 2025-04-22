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
  minWidth: "900px",
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

interface CSVData {
  headers: string[];
  rows: Array<Record<string, string | number>>;
  metadata: {
    filename: string;
    total_rows: number;
  };
}

interface UpdateData {
  type: "text" | "form" | "csv_data";
  content?: string;
  action?: string;
  csv_data?: CSVData;
}

interface Update {
  sender: string;
  data: UpdateData;
}

interface APIResponse {
  agent_processing: boolean;
  show_form: boolean;
  updates: Update[];
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  type?: "text" | "form" | "form_submitted" | "csv_data";
  csvData?: CSVData;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Welcome! I am Lily from Mamba. How can I help you today ?",
      sender: "agent",
      type: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [agentProcessing, setAgentProcessing] = useState(false);
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
        const data: APIResponse = await response.json();

        // Update agent processing state
        setAgentProcessing(data.agent_processing || false);

        // Handle show_form directly from response
        if (data.show_form) {
          setShowForm(true);
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
        } else if (!data.show_form && showForm) {
          setShowForm(false);
          setMessages((prev) => prev.filter((msg) => msg.type !== "form"));
        }

        // Process any additional updates
        data.updates.forEach((update: Update) => {
          if (update.sender === "System") {
            if (update.data.action === "hide_form") {
              setShowForm(false);
              setMessages((prev) => prev.filter((msg) => msg.type !== "form"));
            }
          } else {
            const sender = update.sender.toLowerCase();
            if (sender !== "user" && sender !== "agent") return;

            if (update.data.type === "csv_data" && update.data.csv_data) {
              // Handle CSV data update
              const csvData = update.data.csv_data;
              const messageText = `Received CSV file: ${csvData.metadata.filename}\nTotal rows: ${csvData.metadata.total_rows}`;

              const newMessage: Message = {
                id: Date.now().toString(),
                text: messageText,
                sender: sender as "user" | "agent",
                type: "csv_data",
                csvData: csvData,
              };

              setMessages((prev) => [...prev, newMessage]);
            } else if (update.data.content) {
              // Handle regular text message
              const newMessage: Message = {
                id: Date.now().toString(),
                text: update.data.content,
                sender: sender as "user" | "agent",
                type: update.data.type || "text",
              };

              setMessages((prev) => [...prev, newMessage]);
            }
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
  }, [showForm]);

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
      // We still need to read the response, even if we don't use it immediately
      const data = await response.json();

      // We don't add the agent message here anymore.
      // Polling will handle receiving and displaying the agent's response.
      // const agentMessage: Message = {
      //   id: Date.now().toString(),
      //   text: data.message, // This might be empty initially
      //   sender: "agent",
      //   type: data.show_form ? "form" : "text",
      // };
      // setMessages((prev) => [...prev, agentMessage]);
      // setShowForm(data.show_form);
    } catch (error) {
      console.error("Error sending message:", error);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
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
          <Avatar
            src="src\assets\MambaLogo.svg"
            sx={{
              mr: 3,
              width: 230,
              height: 50,
            }}
            variant="square"
          />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Lily - Senior SEO Engineer
          </Typography>
          {agentProcessing && (
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontWeight: "bold",
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "primary.main",
                  display: "inline-block",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              />
              Agent is thinking...
            </Typography>
          )}
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
              <MessageWrapper
                key={message.id}
                isUser={message.sender === "user"}
              >
                {message.sender !== "user" && (
                  <Avatar
                    src="/src/assets/agent.png"
                    sx={{
                      width: 34,
                      height: 34,
                      mt: 1.3,
                    }}
                  />
                )}
                <MessageItem
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
              </MessageWrapper>
            ))}
            {(isLoading || agentProcessing) && (
              <Typography
                variant="caption"
                sx={{
                  alignSelf: "center",
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    display: "inline-block",
                    animation: "pulse 1.5s infinite ease-in-out",
                  }}
                />
                {agentProcessing ? "Agent is thinking..." : "Processing..."}
              </Typography>
            )}
            <div ref={messagesEndRef} />
          </MessageList>

          <style>
            {`
              @keyframes pulse {
                0% { opacity: 0.4; }
                50% { opacity: 1; }
                100% { opacity: 0.4; }
              }
            `}
          </style>

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
              onKeyDown={handleKeyDown}
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
