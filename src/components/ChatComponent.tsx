// This file will be renamed to ChatComponent.tsx and only contain the chat area logic.
// Remove any layout, background, or panel logic. Only keep the chat area (messages, input form, etc.).
// (Implementation will be completed after renaming.)

import React, { useState, useRef, useEffect } from "react";
import { styled } from "@mui/material/styles";
import BusinessInfoForm from "./BusinessInfoForm";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Avatar,
  Button,
  Skeleton,
} from "./ui";
import axiosInstance from "../utils/axios";
import SendIcon from "@mui/icons-material/Send";
import { API_BASE_URL } from "../utils/axios";

const ChatContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  maxWidth: "1200px",
  minWidth: "300px",
  height: "70vh",
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
  // Custom minimal scrollbar
  "&::-webkit-scrollbar": {
    width: "8px",
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#444", // or theme.palette.divider
    borderRadius: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#444 transparent", // For Firefox
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
  conversationId: string | null;
  onNewConversation?: (id: string, name: string) => void;
  setIsAwaitingResponse?: (isAwaiting: boolean) => void;
  messages?: Message[];
  isLoadingMessages?: boolean;
  updateMessages?: (messages: Message[]) => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({
  onTableReady,
  updates,
  agentProcessing,
  showForm,
  conversationId,
  onNewConversation,
  setIsAwaitingResponse,
  messages: parentMessages,
  isLoadingMessages = false,
  updateMessages,
}) => {
  const getFirstName = () => {
    try {
      const stored =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");
      if (stored) {
        const user = JSON.parse(stored);
        return user.first_name || "there";
      }
    } catch {}
    return "there";
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [processedUpdateIds] = useState<Set<string>>(new Set());

  // Update messages when they're passed from parent component
  useEffect(() => {
    console.log("Parent messages received:", parentMessages);
    console.log("Current conversation ID:", conversationId);
    console.log("isLoadingMessages:", isLoadingMessages);

    if (parentMessages && parentMessages.length > 0) {
      console.log("Setting messages from parent");
      setMessages(parentMessages);
    } else if (conversationId === "") {
      // Reset to empty array for new chats
      // (welcome message will be added by the parent component)
      console.log("Setting empty message array for new chat");
      setMessages([]);
    }
  }, [parentMessages, conversationId, isLoadingMessages]);

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

    // Update local messages state
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update parent component's messages state if callback exists
    if (updateMessages) {
      updateMessages(updatedMessages);
    }

    setInputMessage("");
    setIsLoading(true);

    // Explicitly set isAwaitingResponse to true when sending a message
    if (setIsAwaitingResponse) {
      setIsAwaitingResponse(true);
    }

    try {
      let endpoint;
      let data;

      // If conversationId is empty/null, it's a new chat
      if (!conversationId) {
        endpoint = `${API_BASE_URL}/chat`;
      } else {
        endpoint = `${API_BASE_URL}/chat/${conversationId}`;
      }

      const response = await axiosInstance.post(endpoint, {
        message: inputMessage,
      });

      if (response.status !== 200) {
        throw new Error("Failed to send message");
      }

      data = response.data;

      // For new chats, capture the conversation ID from the response
      if (!conversationId && data && data.conversation_id) {
        if (onNewConversation) {
          onNewConversation(
            data.conversation_id,
            data.conversation_name || "New Chat"
          );
        }
      }

      if (data) {
        let agentMessage: Message | null = null;

        // Handle regular response format
        if (data.response) {
          agentMessage = {
            id: Date.now().toString() + "-agent",
            text: data.response,
            sender: "agent",
            timestamp: new Date(),
            type: "text",
          };
        }
        // Handle is_from_agency format
        else if (data.content || data.is_from_agency !== undefined) {
          agentMessage = {
            id: Date.now().toString() + "-agent",
            text: data.content || "",
            sender: data.is_from_agency ? "agent" : "user",
            timestamp: new Date(),
            type: "text",
          };
        }

        if (agentMessage) {
          // Update local messages with agent's response
          const messagesWithResponse = [...updatedMessages, agentMessage];
          setMessages(messagesWithResponse);

          // Update parent component's messages
          if (updateMessages) {
            updateMessages(messagesWithResponse);
          }
        }
      }

      setIsLoading(false);
      if (setIsAwaitingResponse) {
        setIsAwaitingResponse(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Error sending message. Please try again.",
        sender: "system",
        timestamp: new Date(),
        type: "text",
      };

      // Update local messages with error
      const messagesWithError = [...updatedMessages, errorMessage];
      setMessages(messagesWithError);

      // Update parent component's messages
      if (updateMessages) {
        updateMessages(messagesWithError);
      }

      setIsLoading(false);
      if (setIsAwaitingResponse) {
        setIsAwaitingResponse(false);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(
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

  // Debug message rendering
  console.log("About to render messages:", messages);

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
          {isLoadingMessages ? (
            // Only show skeleton if we're loading messages
            // The parent component (ChatPage) now controls when to skip loading
            <>
              <MessageWrapper isUser={false}>
                <Avatar
                  src="/agent.png"
                  sx={{
                    width: 34,
                    height: 34,
                    mt: 1.3,
                  }}
                />
                <MessageItem isUser={false}>
                  <Skeleton variant="text" width={250} height={20} />
                </MessageItem>
              </MessageWrapper>
              <MessageWrapper isUser={true}>
                <MessageItem isUser={true}>
                  <Skeleton variant="text" width={200} height={20} />
                </MessageItem>
              </MessageWrapper>
              <MessageWrapper isUser={false}>
                <Avatar
                  src="/agent.png"
                  sx={{
                    width: 34,
                    height: 34,
                    mt: 1.3,
                  }}
                />
                <MessageItem isUser={false}>
                  <Skeleton variant="text" width={300} height={20} />
                  <Skeleton variant="text" width={270} height={20} />
                </MessageItem>
              </MessageWrapper>
            </>
          ) : (
            // Regular message display
            messages.map((message) => (
              <MessageWrapper
                key={message.id}
                isUser={message.sender === "user"}
              >
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
                    <Typography sx={{ fontSize: "17px" }}>
                      {message.text}
                    </Typography>
                  )}
                </MessageItem>
              </MessageWrapper>
            ))
          )}
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
            gap: 1.5,
            alignItems: "center",
            bgcolor: "background.main",
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
            sx={{
              borderRadius: 3,
              ".MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: "background.paper",
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !inputMessage.trim()}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              minWidth: 56,
              minHeight: 40,
              px: 2.5,
              boxShadow: "none",
              textTransform: "none",
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
            endIcon={<SendIcon sx={{ fontSize: 22, ml: 0.5 }} />}
          >
            Send
          </Button>
        </Box>
      </ChatContainer>
    </Box>
  );
};

export default ChatComponent;
