// This file will be renamed to ChatComponent.tsx and only contain the chat area logic.
// Remove any layout, background, or panel logic. Only keep the chat area (messages, input form, etc.).
// (Implementation will be completed after renaming.)

import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import BusinessInfoForm from "./BusinessInfoForm";
import { Box, Paper, TextField, Typography, Avatar, Button } from "./ui";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000";
// const API_BASE_URL = "mamba-seo-fork-production-4091.up.railway.app";

const CHAT_HEIGHT = 600; // px, adjust as needed

const ChatContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: "700px",
  minWidth: "300px",
  height: `${CHAT_HEIGHT}px`,
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

interface BusinessInfo {
  name: string;
  industry: string;
  location: string;
  description: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent" | "system";
  timestamp: Date;
  type: "text" | "form" | "form_submitted" | "csv_data";
  csvData?: CSVData;
}

interface UpdateData {
  type: "text" | "form" | "csv_data";
  content?: string;
  action?: string;
  id?: string;
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

interface ChatComponentProps {
  onTableReady: (id: string) => void;
  updates: Update[];
  agentProcessing: boolean;
  showForm: boolean;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  onTableReady,
  updates,
  agentProcessing,
  showForm,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome! I am Lily from Mamba. How can I help you today?",
      sender: "agent",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [processedUpdateIds] = useState<Set<string>>(new Set());

  // Initialize connection with server
  // useEffect(() => {
  //   const initializeServer = async () => {
  //     try {
  //       const response = await axios.get(`${API_BASE_URL}/`);
  //       if (response.status !== 200) {
  //         console.warn("Server initialization failed");
  //       }
  //     } catch (error) {
  //       console.error("Failed to connect to server:", error);
  //     }
  //   };

  //   initializeServer();
  // }, []); // Empty dependency array means this runs once on mount

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Process updates from parent component
  useEffect(() => {
    for (const update of updates) {
      // Skip if we've already processed this update
      const updateId = `${update.sender}-${
        update.data.content || update.data.id || Date.now()
      }`;
      if (processedUpdateIds.has(updateId)) continue;
      processedUpdateIds.add(updateId);

      if (update.sender === "System") {
        if (update.data.action === "table_ready" && update.data.id) {
          onTableReady(update.data.id);
        } else if (update.data.action === "show_form") {
          const formMessage: Message = {
            id: Date.now().toString(),
            text: "",
            sender: "agent",
            timestamp: new Date(),
            type: "form",
          };
          setMessages((prev) => [...prev, formMessage]);
        } else if (update.data.action === "hide_form") {
          // Remove any form messages from the list
          setMessages((prev) => prev.filter((msg) => msg.type !== "form"));
        }
      } else if (
        update.sender === "Agent" &&
        update.data.type === "text" &&
        update.data.content
      ) {
        const agentMessage: Message = {
          id: Date.now().toString(),
          text: update.data.content,
          sender: "agent",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, agentMessage]);
      }
    }
  }, [updates, onTableReady]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/send_message`, {
        message: inputMessage,
      });

      if (response.status !== 200) {
        throw new Error("Failed to send message");
      }

      const data = response.data;
      setIsLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Error sending message. Please try again.",
        sender: "system",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/submit_data`,
        formData
      );

      if (response.status !== 200) {
        throw new Error("Failed to submit form");
      }

      const data = response.data;

      // Add a form submitted message
      const formSubmittedMessage: Message = {
        id: Date.now().toString(),
        text: "Business Information Form Submitted",
        sender: "user",
        timestamp: new Date(),
        type: "form_submitted",
      };

      // Add the agent's response message
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for providing your business information. I'll analyze this and provide recommendations shortly.",
        sender: "agent",
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, formSubmittedMessage, agentMessage]);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Error submitting form. Please try again.",
        sender: "system",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCSVData = (data: CSVData) => {
    const csvMessage: Message = {
      id: Date.now().toString(),
      text: "CSV data received",
      sender: "system",
      timestamp: new Date(),
      type: "csv_data",
      csvData: data,
    };
    setMessages((prev) => [...prev, csvMessage]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80%",
      }}
    >
      <ChatContainer elevation={3}>
        <MessageList>
          {messages.map((message) => (
            <MessageWrapper key={message.id} isUser={message.sender === "user"}>
              {message.sender !== "user" && (
                <Avatar
                  src="/agent.png"
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
                {message.type === "form" ? (
                  <BusinessInfoForm
                    onSubmit={handleFormSubmit}
                    onClose={() => {}}
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
  );
};

export default ChatComponent;
