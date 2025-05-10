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
import MessageLoading from "./TypingIndicator";
import MessageInput from "./MessageInput";

const ChatContainer = styled(Paper)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  borderRadius: 0,
  backgroundColor: theme.palette.background.default,
  position: "relative",
}));

// Add new styled component for centered layout
const CenteredContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  width: "100%",
  gap: theme.spacing(3),
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  width: "100%",
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
  onTableReady: (id: string | any) => void;
  updates: Update[];
  agentProcessing: boolean;
  showForm: boolean;
  conversationId: string | null;
  onNewConversation?: (id: string, name: string, messages: Message[]) => void;
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
  const [isFormVisible, setIsFormVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [processedUpdateIds] = useState<Set<string>>(new Set());
  const [prevConversationId, setPrevConversationId] = useState<string | null>(
    conversationId
  );

  // Update messages when they're passed from parent component
  useEffect(() => {
    console.log("Parent messages received:", parentMessages);
    console.log("Current conversation ID:", conversationId);
    console.log("isLoadingMessages:", isLoadingMessages);

    if (parentMessages && parentMessages.length > 0) {
      console.log("Setting messages from parent");
      // Filter out any welcome or thinking messages
      const filteredMessages = parentMessages.filter(
        (msg) => msg.id !== "welcome" && !msg.text.includes("Thinking...")
      );
      setMessages(filteredMessages);
    } else if (conversationId === "" && parentMessages?.length === 0) {
      // Only reset to empty array if parent explicitly sends empty messages
      // This happens when parent component initiates a new chat
      console.log("Setting empty message array for new chat (from parent)");
      setMessages([]);

      // Ensure no form is visible in new chat
      setIsFormVisible(false);
    }
  }, [parentMessages, conversationId, isLoadingMessages]);

  // Add an effect to specifically handle when explicitly switching to "New Chat"
  // This should not trigger when sending messages in New Chat
  useEffect(() => {
    // Update previous conversation ID when current one changes
    if (conversationId !== prevConversationId) {
      console.log(
        "Conversation ID changed from",
        prevConversationId,
        "to",
        conversationId
      );

      // Only handle New Chat reset when explicitly switching from a conversation to New Chat
      // This prevents resetting when sending messages in New Chat
      if (
        conversationId === "" &&
        prevConversationId !== "" &&
        prevConversationId !== null
      ) {
        console.log("Detected explicit switch to New Chat, resetting messages");

        // Reset to empty messages array without welcome message
        setMessages([]);

        // Ensure no form is visible
        setIsFormVisible(false);

        // Update parent component if needed
        if (updateMessages) {
          updateMessages([]);
        }
      }

      // Store current conversation ID as previous for next comparison
      setPrevConversationId(conversationId);
    }
  }, [conversationId, prevConversationId, updateMessages]);

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
          console.log("Received show_form action, adding form message");
          const formMessage: Message = {
            id: Date.now().toString(),
            text: "",
            sender: "agent",
            timestamp: new Date(),
            type: "form",
          };
          setMessages((prev) => [...prev, formMessage]);
          setIsFormVisible(true);
        } else if (update.data.action === "hide_form") {
          // Remove any form messages from the list
          setMessages((prev) => prev.filter((msg) => msg.type !== "form"));
          setIsFormVisible(false);
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
  }, [updates, onTableReady, conversationId]);

  // Add direct effect for showForm changes to immediately respond
  useEffect(() => {
    console.log("showForm prop changed:", showForm);
    if (!showForm) {
      // Immediately clear form visibility when prop changes to false
      setIsFormVisible(false);
    } else if (conversationId === "" || conversationId === null) {
      // Never show form in the "New Chat" tab
      setIsFormVisible(false);
    }
  }, [showForm, conversationId]);

  // Add an effect to check if a form is currently visible in messages
  useEffect(() => {
    // First priority: if showForm is false, make sure no forms are visible
    if (!showForm) {
      // Remove any form messages from the messages array
      const hasFormMessages = messages.some((msg) => msg.type === "form");
      if (hasFormMessages) {
        console.log("Removing form messages because showForm is false");
        const messagesWithoutForm = messages.filter(
          (msg) => msg.type !== "form"
        );
        setMessages(messagesWithoutForm);

        if (updateMessages) {
          updateMessages(messagesWithoutForm);
        }
      }
      setIsFormVisible(false);
    } else if (conversationId === "" || conversationId === null) {
      // Never show form in the "New Chat" tab
      setIsFormVisible(false);

      // Remove any form messages from the messages array for new chat
      const hasFormMessages = messages.some((msg) => msg.type === "form");
      if (hasFormMessages) {
        console.log("Removing form messages from new chat");
        const messagesWithoutForm = messages.filter(
          (msg) => msg.type !== "form"
        );
        setMessages(messagesWithoutForm);

        if (updateMessages) {
          updateMessages(messagesWithoutForm);
        }
      }
    } else {
      // If showForm is true, check if there's already a form in messages
      const hasForm = messages.some((msg) => msg.type === "form");
      setIsFormVisible(hasForm || showForm);
    }
  }, [showForm, messages, updateMessages, conversationId]);

  // Remove the old useEffect that added form messages, and create a simpler one
  useEffect(() => {
    // Only add a form if:
    // - showForm is true
    // - no form exists yet
    // - we have messages
    // - we're not in a new chat
    if (
      showForm &&
      !messages.some((msg) => msg.type === "form") &&
      messages.length > 0 &&
      conversationId !== "" &&
      conversationId !== null
    ) {
      console.log("Adding form message because showForm is true");
      const formMessage: Message = {
        id: Date.now().toString(),
        text: "",
        sender: "agent",
        timestamp: new Date(),
        type: "form",
      };

      const updatedMessages = [...messages, formMessage];
      setMessages(updatedMessages);

      if (updateMessages) {
        updateMessages(updatedMessages);
      }
    }
  }, [showForm, messages, updateMessages, conversationId]);

  const sendMessage = (messageText: string) => {
    if (!messageText.trim() || isFormVisible) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    // Update local messages state
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Update parent component's messages state if callback exists
    if (updateMessages) {
      updateMessages(newMessages);
    }

    setInputMessage("");
    setIsLoading(true);

    // Explicitly set isAwaitingResponse to true when sending a message
    if (setIsAwaitingResponse) {
      setIsAwaitingResponse(true);
    }

    // Call the API
    handleMessageAPI(messageText, newMessages);
  };

  const handleMessageAPI = async (
    messageText: string,
    currentMessages: Message[]
  ) => {
    try {
      let endpoint;
      let data;
      let newConversationId: string | null = null;

      // If conversationId is empty/null, it's a new chat
      if (!conversationId) {
        endpoint = `${API_BASE_URL}/chat`;
      } else {
        endpoint = `${API_BASE_URL}/chat/${conversationId}`;
      }

      const response = await axiosInstance.post(endpoint, {
        message: messageText,
      });

      if (response.status !== 200) {
        throw new Error("Failed to send message");
      }

      data = response.data;

      // For new chats, capture the conversation ID from the response
      if (!conversationId && data && data.conversation_id) {
        // Store the new conversation ID
        newConversationId = data.conversation_id;

        // Check if we have a collect_business_info action
        const hasBusinessInfoAction =
          data.action &&
          typeof data.action === "object" &&
          data.action["action-type"] === "collect_business_info";

        // Fetch the conversation messages to ensure we have the latest state BEFORE transitioning the UI
        try {
          const messagesResponse = await axiosInstance.get(
            `/messages/${newConversationId}?limit=0&offset=0&order=asc`
          );

          if (messagesResponse.data && messagesResponse.data.messages) {
            // Extract messages from the response
            const fetchedMessages = messagesResponse.data.messages.map(
              (msg: any) => {
                return {
                  id: msg.id,
                  text: msg.content,
                  sender: msg.is_from_agency ? "agent" : "user",
                  timestamp: new Date(msg.timestamp),
                  type: "text",
                };
              }
            );

            // Check if there's a business form action in the response
            let hasBusinessForm = false;
            if (
              messagesResponse.data.action &&
              typeof messagesResponse.data.action === "object" &&
              messagesResponse.data.action["action-type"] ===
                "collect_business_info"
            ) {
              hasBusinessForm = true;
            }

            // If business form is detected, add it and make it visible
            let messagesWithForm = fetchedMessages;
            if (hasBusinessForm) {
              const formMessage = {
                id: Date.now().toString() + "-form",
                text: "",
                sender: "agent" as const,
                timestamp: new Date(),
                type: "form" as const,
              };
              messagesWithForm = [...fetchedMessages, formMessage];
            }

            // Update local state before transitioning
            setMessages(messagesWithForm);
            if (updateMessages) {
              updateMessages(messagesWithForm);
            }
            if (hasBusinessForm) {
              setIsFormVisible(true);
              const formEvent = new CustomEvent("formRequested", {
                detail: {
                  conversationId: newConversationId,
                  timestamp: Date.now(),
                },
              });
              window.dispatchEvent(formEvent);
            }

            // Now transition the UI by calling onNewConversation
            if (onNewConversation) {
              onNewConversation(
                data.conversation_id,
                data.conversation_name || "New Chat",
                messagesWithForm
              );
            }
          }
        } catch (error) {
          console.error("Error fetching messages after transition:", error);
        }
        setIsLoading(false);
        if (setIsAwaitingResponse) {
          setIsAwaitingResponse(false);
        }
        return; // Exit early so the rest of the function doesn't run
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

          // Check if there's an action in the response
          // Handle legacy action format (string-based)
          if (data.action === "collect_business_info") {
            // Add a form message
            const formMessage: Message = {
              id: Date.now().toString() + "-form",
              text: "",
              sender: "agent",
              timestamp: new Date(),
              type: "form",
            };

            // Update with both the text response and the form
            const messagesWithForm = [
              ...currentMessages,
              agentMessage,
              formMessage,
            ];
            setMessages(messagesWithForm);

            // Update parent component's messages
            if (updateMessages) {
              updateMessages(messagesWithForm);
            }

            // Set form visible flag
            setIsFormVisible(true);
          }
          // Handle new action format (object-based) with action-type and action-data
          else if (
            data.action &&
            typeof data.action === "object" &&
            data.action["action-type"]
          ) {
            const actionType = data.action["action-type"];
            const actionData = data.action["action-data"] || {};

            // Handle different action types
            if (actionType === "collect_business_info") {
              console.log(
                "Found collect_business_info action in response",
                actionType
              );

              // Only add form if we have a valid conversation (not in "New Chat")
              if (
                newConversationId ||
                (conversationId && conversationId !== "")
              ) {
                // Add a form message
                const formMessage: Message = {
                  id: Date.now().toString() + "-form",
                  text: "",
                  sender: "agent",
                  timestamp: new Date(),
                  type: "form",
                };

                // Update with both the text response and the form
                const messagesWithForm = [
                  ...currentMessages,
                  agentMessage,
                  formMessage,
                ];
                setMessages(messagesWithForm);

                // Update parent component's messages
                if (updateMessages) {
                  updateMessages(messagesWithForm);
                }

                // Set form visible flag - this is critical to ensure the form shows
                setIsFormVisible(true);

                // Force window event to ensure parent component knows form should be shown
                const parentUpdateEvent = new CustomEvent("formRequested", {
                  detail: {
                    conversationId: newConversationId || conversationId,
                    timestamp: Date.now(),
                  },
                });
                window.dispatchEvent(parentUpdateEvent);
              } else {
                // Just add the text response without a form for "New Chat"
                const messagesWithResponse = [...currentMessages, agentMessage];
                setMessages(messagesWithResponse);

                // Update parent component's messages
                if (updateMessages) {
                  updateMessages(messagesWithResponse);
                }
              }
            }
            // Handle keywords_ready action type
            else if (actionType === "keywords_ready") {
              // First update the messages array to show the agent's response
              const messagesWithResponse = [...currentMessages, agentMessage];
              setMessages(messagesWithResponse);

              // Update parent component's messages
              if (updateMessages) {
                updateMessages(messagesWithResponse);
              }

              console.log("Keywords ready action received:", actionData);

              // Check if we have table data in the action-data
              if (
                actionData.table &&
                actionData.table.id &&
                Array.isArray(actionData.table.rows)
              ) {
                console.log(
                  "Table data found in action-data:",
                  actionData.table
                );

                // Call parent's onTableReady with the table information
                // For data received during chat, we want to show the panel automatically
                onTableReady({
                  ...actionData.table,
                  showPanel: true, // Signal to show panel for data received during chat
                });
              }
              // If we have just a table_id, it might be in the generated_content that needs to be fetched
              else if (actionData.table_id && conversationId) {
                console.log(
                  "Just table_id received, refreshing messages to get generated_content:",
                  actionData.table_id
                );

                // For older implementations, just pass the table_id
                onTableReady(actionData.table_id);

                // Add a system message about keywords being ready
                const keywordsMessage: Message = {
                  id: Date.now().toString(),
                  text: "Keywords data is ready. Check the Data Panel to view it.",
                  sender: "system",
                  timestamp: new Date(),
                  type: "text",
                };

                // Add the keywords message to chat
                const messagesWithKeywords = [
                  ...messagesWithResponse,
                  keywordsMessage,
                ];
                setMessages(messagesWithKeywords);

                // Update parent component's messages
                if (updateMessages) {
                  updateMessages(messagesWithKeywords);
                }
              } else {
                console.error(
                  "No valid table data found in keywords_ready action",
                  actionData
                );

                // Add a system message about keywords being ready
                const keywordsMessage: Message = {
                  id: Date.now().toString(),
                  text: "Keywords data is ready. Check the Data Panel to view it.",
                  sender: "system",
                  timestamp: new Date(),
                  type: "text",
                };

                // Add the keywords message to chat
                const messagesWithKeywords = [
                  ...messagesWithResponse,
                  keywordsMessage,
                ];
                setMessages(messagesWithKeywords);

                // Update parent component's messages
                if (updateMessages) {
                  updateMessages(messagesWithKeywords);
                }
              }
            } else {
              // Regular text response without any action
              const messagesWithResponse = [...currentMessages, agentMessage];
              setMessages(messagesWithResponse);

              // Update parent component's messages
              if (updateMessages) {
                updateMessages(messagesWithResponse);
              }
            }
          } else {
            // Regular text response without any action
            const messagesWithResponse = [...currentMessages, agentMessage];
            setMessages(messagesWithResponse);

            // Update parent component's messages
            if (updateMessages) {
              updateMessages(messagesWithResponse);
            }
          }
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

          // Update local messages with agent's response
          const messagesWithResponse = [...currentMessages, agentMessage];
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
      const messagesWithError = [...currentMessages, errorMessage];
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
    // Remove form immediately, before the API call
    // Remove any form messages from the list
    const messagesWithoutForm = messages.filter((msg) => msg.type !== "form");

    // Add a form submitted message immediately to give user feedback
    const formSubmittedMessage: Message = {
      id: Date.now().toString(),
      text: "Business Information Form Submitted",
      sender: "user",
      timestamp: new Date(),
      type: "form_submitted",
    };

    // Add temporary loading message (will be replaced with response)
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Processing your business information...",
      sender: "agent",
      timestamp: new Date(),
      type: "text",
    };

    // Update UI immediately with form removal and loading message
    const updatedMessages = [
      ...messagesWithoutForm,
      formSubmittedMessage,
      loadingMessage,
    ];
    setMessages(updatedMessages);

    // Update parent component
    if (updateMessages) {
      updateMessages(updatedMessages);
    }

    // Form is no longer visible
    setIsFormVisible(false);

    // Emit event to ensure parent component knows the form is submitted
    const parentUpdateEvent = new CustomEvent("formSubmitted", {
      detail: { conversationId, timestamp: Date.now() },
    });
    window.dispatchEvent(parentUpdateEvent);

    // Now make the API call in the background
    setIsLoading(true);

    // Set isAwaitingResponse to true to disable conversation switching in UserPanel
    if (setIsAwaitingResponse) {
      setIsAwaitingResponse(true);
    }

    try {
      // Make sure we have a conversation ID before submitting the form
      if (!conversationId) {
        throw new Error("Missing conversation ID. Please try again.");
      }

      // Use the correct endpoint with conversation ID
      const endpoint = `${API_BASE_URL}/submit_form/${conversationId}`;

      // Format the form data according to the required structure
      const formattedData = {
        form_data: formData,
      };

      const response = await axiosInstance.post(endpoint, formattedData);

      if (response.status !== 200) {
        throw new Error("Failed to submit form");
      }

      const data = response.data;

      // Add the agent's response message (or use one from the response if available)
      const agentMessage: Message = {
        id: (Date.now() + 2).toString(),
        text:
          data?.response ||
          "Thank you for providing your business information. I'll analyze this and provide recommendations shortly.",
        sender: "agent",
        timestamp: new Date(),
        type: "text",
      };

      // Replace the loading message with the actual response
      const finalMessages = messagesWithoutForm
        .concat(formSubmittedMessage)
        .concat(agentMessage);

      setMessages(finalMessages);

      // Update parent component
      if (updateMessages) {
        updateMessages(finalMessages);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text:
          error instanceof Error
            ? error.message
            : "Error submitting form. Please try again.",
        sender: "system",
        timestamp: new Date(),
        type: "text",
      };

      // Add error message but keep the form removal
      const messagesWithError = [
        ...messagesWithoutForm,
        formSubmittedMessage,
        errorMessage,
      ];
      setMessages(messagesWithError);

      if (updateMessages) {
        updateMessages(messagesWithError);
      }
    } finally {
      setIsLoading(false);

      // Re-enable conversation switching in UserPanel
      if (setIsAwaitingResponse) {
        setIsAwaitingResponse(false);
      }
    }
  };

  const handleFormCancel = async () => {
    // Remove form immediately, before the API call
    // Remove any form messages from the list
    const messagesWithoutForm = messages.filter((msg) => msg.type !== "form");

    // Add a form cancelled message immediately to give user feedback
    const formCancelledMessage: Message = {
      id: Date.now().toString(),
      text: "Form Cancelled",
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    // Add temporary loading message (will be replaced with response)
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Processing cancellation...",
      sender: "agent",
      timestamp: new Date(),
      type: "text",
    };

    // Update UI immediately with form removal and cancellation message
    const updatedMessages = [
      ...messagesWithoutForm,
      formCancelledMessage,
      loadingMessage,
    ];
    setMessages(updatedMessages);

    // Update parent component
    if (updateMessages) {
      updateMessages(updatedMessages);
    }

    // Form is no longer visible - make sure to update this state
    setIsFormVisible(false);

    // Also inform parent component that form should be hidden
    if (setIsAwaitingResponse) {
      setIsAwaitingResponse(true); // First set to true to disable conversation switching
    }

    // Force the showForm prop to be updated
    // This is a temporary workaround to ensure the parent component knows the form is cancelled
    const parentUpdateEvent = new CustomEvent("formCancelled", {
      detail: { conversationId },
    });
    window.dispatchEvent(parentUpdateEvent);

    // Now make the API call and wait for response
    setIsLoading(true);

    try {
      // Make sure we have a conversation ID before cancelling the form
      if (!conversationId) {
        throw new Error("Missing conversation ID");
      }

      // Use the correct endpoint with conversation ID
      const endpoint = `${API_BASE_URL}/submit_form/${conversationId}`;

      // Send the cancellation action in the correct format
      const cancellationData = {
        action: "cancel_form",
      };

      // Wait for the response like we do with form submission
      const response = await axiosInstance.post(endpoint, cancellationData);

      // Handle the response
      const data = response.data;

      // Add the agent's response message (or use one from the response if available)
      const agentMessage: Message = {
        id: (Date.now() + 2).toString(),
        text:
          data?.response || "Form cancelled. How else can I help you today?",
        sender: "agent",
        timestamp: new Date(),
        type: "text",
      };

      // Replace the loading message with the actual response
      const finalMessages = messagesWithoutForm
        .concat(formCancelledMessage)
        .concat(agentMessage);

      setMessages(finalMessages);

      // Update parent component
      if (updateMessages) {
        updateMessages(finalMessages);
      }
    } catch (error) {
      console.error("Error cancelling form:", error);

      // Even if there's an error, keep the form cancelled
      const errorMessage: Message = {
        id: Date.now().toString(),
        text:
          error instanceof Error
            ? error.message
            : "Error processing cancellation, but form was removed.",
        sender: "system",
        timestamp: new Date(),
        type: "text",
      };

      // Add error message but keep the form removal
      const messagesWithError = [
        ...messagesWithoutForm,
        formCancelledMessage,
        errorMessage,
      ];
      setMessages(messagesWithError);

      if (updateMessages) {
        updateMessages(messagesWithError);
      }
    } finally {
      setIsLoading(false);

      // Re-enable conversation switching in UserPanel
      if (setIsAwaitingResponse) {
        setIsAwaitingResponse(false);
      }
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

    // Update local state
    const updatedMessages = [...messages, csvMessage];
    setMessages(updatedMessages);

    // Update parent component's state
    if (updateMessages) {
      updateMessages(updatedMessages);
    }

    // Also notify the parent about the table being ready if we have data
    if (data && data.metadata && data.metadata.filename) {
      const tableId = data.metadata.filename
        .replace("keywords_", "")
        .replace(".csv", "");
      if (tableId) {
        onTableReady(tableId);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // Function to handle showing the form directly
  const handleShowForm = () => {
    console.log("handleShowForm called - adding form message");
    // Add a form message to the chat
    const formMessage: Message = {
      id: Date.now().toString(),
      text: "",
      sender: "agent",
      timestamp: new Date(),
      type: "form",
    };

    const updatedMessages = [...messages, formMessage];
    setMessages(updatedMessages);

    if (updateMessages) {
      updateMessages(updatedMessages);
    }

    setIsFormVisible(true);
  };

  // Debug message rendering
  console.log("About to render messages:", messages);

  // Handle submitting a message from the MessageInput component
  const handleSubmitMessage = (message: string) => {
    if (message.trim()) {
      sendMessage(message);
    }
  };

  // Handle form submission (keep this for backward compatibility)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "stretch",
        alignItems: "stretch",
        p: 0,
        m: 0,
      }}
    >
      <ChatContainer
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          margin: 0,
          borderRadius: 0,
        }}
      >
        {conversationId === "" && messages.length === 0 ? (
          <CenteredContainer>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                fontSize: "2.5rem",
                color: "text.primary",
                textAlign: "center",
                maxWidth: "850px",
                px: 3,
              }}
            >
              Let's build your keyword strategy.
            </Typography>
            <Box sx={{ width: "100%", maxWidth: "850px", px: 3 }}>
              <MessageInput
                onSendMessage={handleSubmitMessage}
                disabled={isLoading || isFormVisible}
                size="large"
                isNewChat={true}
              />
            </Box>
          </CenteredContainer>
        ) : (
          <>
            <MessageList>
              <Box
                sx={{
                  maxWidth: "850px",
                  width: "100%",
                  mx: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {isLoadingMessages ? (
                  // Only show skeleton if we're loading messages
                  // The parent component (ChatPage) now controls when to skip loading
                  <>
                    {/* First message - Agent */}
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

                    {/* Second message - User */}
                    <MessageWrapper isUser={true}>
                      <MessageItem isUser={true}>
                        <Skeleton variant="text" width={200} height={20} />
                      </MessageItem>
                    </MessageWrapper>

                    {/* Third message - Agent */}
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

                    {/* Fourth message - User */}
                    <MessageWrapper isUser={true}>
                      <MessageItem isUser={true}>
                        <Skeleton variant="text" width={180} height={20} />
                        <Skeleton variant="text" width={150} height={20} />
                      </MessageItem>
                    </MessageWrapper>

                    {/* Fifth message - Agent */}
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
                        <Skeleton variant="text" width={280} height={20} />
                        <Skeleton variant="text" width={260} height={20} />
                        <Skeleton variant="text" width={220} height={20} />
                      </MessageItem>
                    </MessageWrapper>

                    {/* Sixth message - User */}
                    <MessageWrapper isUser={true}>
                      <MessageItem isUser={true}>
                        <Skeleton variant="text" width={170} height={20} />
                      </MessageItem>
                    </MessageWrapper>

                    {/* Seventh message - Agent (additional) */}
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
                        <Skeleton variant="text" width={240} height={20} />
                        <Skeleton variant="text" width={320} height={20} />
                        <Skeleton variant="text" width={200} height={20} />
                        <Skeleton variant="text" width={180} height={20} />
                      </MessageItem>
                    </MessageWrapper>
                  </>
                ) : (
                  messages
                    .filter((message) =>
                      isFormVisible ? true : message.type !== "form"
                    )
                    .map((message) => (
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
                          {message.type === "form" && isFormVisible ? (
                            <BusinessInfoForm
                              onSubmit={handleFormSubmit}
                              onClose={() => {}}
                              onFileClick={() => {}}
                              onCancel={handleFormCancel}
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
                {(isLoading || agentProcessing) && <MessageLoading />}
                <div ref={messagesEndRef} />
              </Box>
            </MessageList>
            <MessageInput
              onSendMessage={handleSubmitMessage}
              disabled={isLoading || isFormVisible}
              size="normal"
              isNewChat={false}
            />
          </>
        )}
      </ChatContainer>
    </Box>
  );
};

export default ChatComponent;
