import React, { useState, useEffect, useCallback } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ChatComponent from "../components/ChatComponent";
import DataPanel from "../components/DataPanel";
import UserPanel from "../components/UserPanel";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import TopAppBar from "../components/TopAppBar";
import { API_BASE_URL } from "../utils/axios";
import UserProfile from "../components/UserProfile";
import axiosInstance from "../utils/axios";

interface Data {
  [key: string]: string | number;
}

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
  id?: string;
  csv_data?: CSVData;
}

interface Update {
  sender: string;
  data: UpdateData;
}

interface TableData {
  headers: string[];
  id: string;
  rows: Array<Record<string, string | number>>;
}

interface TableResponse {
  status: string;
  data: TableData;
}

interface APIResponse {
  agent_processing: boolean;
  show_form: boolean;
  updates: Update[];
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent" | "system";
  timestamp: Date;
  type: "text" | "form" | "form_submitted" | "csv_data";
  csvData?: CSVData;
}

interface CSVDataset {
  id: string;
  name: string;
  displayName: string;
  timestamp: Date;
  data: Data[];
}

interface Dataset {
  id: string;
  name: string;
  displayName: string;
  data: Data[];
  timestamp: Date;
}

interface ChatPageProps {
  setIsAuthenticated: (auth: boolean) => void;
}

interface ConversationData {
  id: string;
  name: string;
}

interface RecentChat {
  id: string;
  title: string;
}

const ScrollbarStyle = {
  "&::-webkit-scrollbar": {
    width: "8px",
    backgroundColor: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(155, 155, 155, 0.5)",
    borderRadius: "10px",
    "&:hover": {
      backgroundColor: "rgba(155, 155, 155, 0.7)",
    },
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
    border: "none",
  },
  "&::-webkit-scrollbar-corner": {
    backgroundColor: "transparent",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
};

const ChatPage: React.FC<ChatPageProps> = ({ setIsAuthenticated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [agentProcessing, setAgentProcessing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>("");
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const handleNewChat = () => {
    // Don't allow new chat if we're waiting for a response
    if (isAwaitingResponse) return;

    // Set a welcome message for new chat
    const welcomeMsg: Message = {
      id: "welcome",
      text: `Welcome! I am Lily from Mamba. How can I help you today?`,
      sender: "agent",
      timestamp: new Date(),
      type: "text",
    };

    setMessages([welcomeMsg]);

    // Mark that we're in a new chat
    localStorage.setItem("lastConversationWasNew", "true");

    // We'll set the conversationId to empty string to indicate a new chat
    setConversationId("");
  };

  const fetchTableData = useCallback(async (tableData: any) => {
    try {
      console.log(`Processing table data:`, tableData);

      // First update UI state
      setError(null);

      // Check if we received a table object directly or just an ID
      if (typeof tableData === "string") {
        // This is the old format - just an ID was passed
        // We no longer need to fetch data in this case, but log a warning
        console.warn("Received just a table ID. This format is deprecated.");
        return;
      }

      // Check if we have valid data
      if (
        tableData &&
        tableData.id &&
        Array.isArray(tableData.rows) &&
        tableData.rows.length > 0
      ) {
        // Create dataset from keywords data
        const newDataset: Dataset = {
          id: tableData.id,
          name: tableData.id,
          displayName: tableData.id,
          data: tableData.rows,
          timestamp: new Date(),
        };

        console.log("Created dataset:", newDataset);

        // Update state with the new dataset and show the panel
        setDatasets((prev) => {
          // Check if dataset already exists to prevent duplicates
          const exists = prev.some((ds) => ds.id === newDataset.id);
          if (exists) {
            return prev.map((ds) =>
              ds.id === newDataset.id ? newDataset : ds
            );
          }
          return [...prev, newDataset];
        });

        setSelectedDatasetId(newDataset.id);
        setShowDataPanel(true);
      } else {
        throw new Error("Invalid table data format");
      }
    } catch (error) {
      console.error("Error processing table data:", error);
      setError(`Failed to process keywords data: ${error.message}`);
    }
  }, []);

  // Load conversations from storage when component mounts
  useEffect(() => {
    const storedConversations =
      localStorage.getItem("conversations") ||
      sessionStorage.getItem("conversations");
    if (storedConversations) {
      try {
        const conversations: ConversationData[] =
          JSON.parse(storedConversations);
        // Convert ConversationData to RecentChat format
        const formattedChats: RecentChat[] = conversations.map((conv) => ({
          id: conv.id,
          title: conv.name,
        }));
        setRecentChats(formattedChats);

        // Always start with a new chat instead of selecting the first conversation
        handleNewChat();
      } catch (error) {
        console.error("Error parsing stored conversations:", error);
      }
    } else {
      // If there are no conversations, start with a new chat
      handleNewChat();
    }
  }, []);

  // Fetch messages for the selected conversation
  useEffect(() => {
    if (conversationId) {
      // Only skip loading when we're coming from an empty conversationId (new chat)
      // to a newly created conversation with the same messages
      const isNewConversationFromNewChat =
        messages.length > 0 &&
        messages.some((msg) => msg.sender === "user") &&
        messages[0].id === "welcome" &&
        // This is the critical part - only skip if we're coming directly from a new chat
        localStorage.getItem("lastConversationWasNew") === "true";

      // Always fetch messages unless it's a direct transition from new chat to created conversation
      if (!isNewConversationFromNewChat) {
        fetchMessages(conversationId);
      } else {
        // Clear the flag after we've used it
        localStorage.removeItem("lastConversationWasNew");
      }
    }
  }, [conversationId]);

  const fetchMessages = async (convId: string) => {
    // Always show loading state when fetching messages
    setIsLoading(true);
    setIsAwaitingResponse(true);
    console.log(`Fetching messages for conversation: ${convId}`);

    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/messages/${convId}?limit=0&offset=0&order=asc`
      );

      if (response.status === 200 && response.data.messages) {
        console.log("Messages received:", response.data.messages);
        // Transform backend message format to our app's message format
        const formattedMessages = response.data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          sender: msg.is_from_agency ? "agent" : "user",
          timestamp: new Date(msg.timestamp),
          type: "text",
        }));

        console.log("Formatted messages:", formattedMessages);

        // Create a welcome message to add at the beginning
        const welcomeMessage: Message = {
          id: "welcome",
          text: `Welcome! I am Lily from Mamba. How can I help you today?`,
          sender: "agent",
          timestamp: new Date(0), // Set to oldest timestamp so it appears first
          type: "text",
        };

        // Clear existing messages first to ensure loading shows
        setMessages([]);

        // Then add welcome message and fetched messages
        setTimeout(() => {
          // Add welcome message to the beginning of the conversation
          if (formattedMessages.length > 0) {
            setMessages([welcomeMessage, ...formattedMessages]);
          } else {
            setMessages([welcomeMessage]);
          }
          setIsLoading(false);
          setIsAwaitingResponse(false);
        }, 100); // Small delay to ensure UI updates properly
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load conversation messages");
      setIsLoading(false);
      setIsAwaitingResponse(false);
    }
  };

  const handleSelectChat = (id: string) => {
    // Don't allow switching conversations if we're waiting for a response
    if (isAwaitingResponse && conversationId !== "") return;

    // Only change if it's a different conversation
    if (id !== conversationId) {
      // Set isAwaitingResponse to true when switching conversations
      setIsAwaitingResponse(true);

      // Clear any "new chat" flag since we're explicitly selecting a conversation
      localStorage.removeItem("lastConversationWasNew");

      // Set the new conversation ID
      setConversationId(id);

      // Note: isAwaitingResponse will be set to false in fetchMessages
      // when the messages are successfully loaded
    }
  };

  // Add a new conversation to the recent chats list and select it
  const addNewConversation = (id: string, name: string) => {
    const newChat: RecentChat = { id, title: name };
    // Update in-memory state
    setRecentChats((prev) => [newChat, ...prev]);

    // We're still in the same flow from a new chat to a created conversation
    // Make sure the flag is set so we don't reload messages
    localStorage.setItem("lastConversationWasNew", "true");

    // Set the conversation ID after setting the flag
    setConversationId(id);

    // Update storage
    const storage = localStorage.getItem("authToken")
      ? localStorage
      : sessionStorage;
    try {
      const storedConversations = storage.getItem("conversations");
      const conversations: ConversationData[] = storedConversations
        ? JSON.parse(storedConversations)
        : [];
      const newConversation: ConversationData = { id, name };
      storage.setItem(
        "conversations",
        JSON.stringify([newConversation, ...conversations])
      );
    } catch (error) {
      console.error("Error updating stored conversations:", error);
    }

    // No longer waiting for a response
    setIsAwaitingResponse(false);
    // Ensure loading is false for the new conversation
    setIsLoading(false);
  };

  const selectedDataset = datasets.find((ds) => ds.id === selectedDatasetId);

  // Handler to toggle the DataPanel
  const handleToggleCSVPanel = () => setShowDataPanel((open) => !open);

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };

  // Add a function to update messages state
  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  return (
    <>
      {showProfile && (
        <>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              bgcolor: "rgba(0,0,0,0.45)",
              zIndex: 1399,
            }}
          />
          <UserProfile onClose={() => setShowProfile(false)} />
        </>
      )}
      <TopAppBar
        csvPanelOpen={showDataPanel}
        onToggleCSVPanel={handleToggleCSVPanel}
      />
      <Box
        sx={{
          height: "90vh",
          width: "90vw",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <UserPanel
          setIsAuthenticated={setIsAuthenticated}
          onProfileClick={() => setShowProfile(true)}
          onNewChat={handleNewChat}
          recentChats={recentChats}
          onSelectChat={handleSelectChat}
          isAwaitingResponse={isAwaitingResponse}
          selectedConversationId={conversationId}
        />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            marginTop: "330px",
            overflow: "hidden",
          }}
        >
          <ChatComponent
            onTableReady={fetchTableData}
            updates={updates}
            agentProcessing={agentProcessing}
            showForm={showForm}
            conversationId={conversationId}
            onNewConversation={addNewConversation}
            setIsAwaitingResponse={setIsAwaitingResponse}
            messages={messages}
            isLoadingMessages={isLoading}
            updateMessages={updateMessages}
          />
        </Box>
        {error && (
          <Box
            sx={{
              position: "fixed",
              top: 80,
              right: 20,
              zIndex: 1200,
              bgcolor: "error.main",
              color: "white",
              p: 2,
              borderRadius: 1,
              maxWidth: "300px",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              ...ScrollbarStyle,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{ whiteSpace: "pre-wrap", flex: 1 }}
              >
                {error}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setError(null)}
                sx={{
                  color: "white",
                  p: 0.5,
                  ml: 1,
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}
        {showDataPanel && (
          <DataPanel
            open={showDataPanel}
            onClose={() => setShowDataPanel(false)}
            datasets={datasets}
            selectedDatasetId={selectedDatasetId}
            onDatasetSelect={handleDatasetSelect}
            data={selectedDataset?.data || []}
          />
        )}
      </Box>
    </>
  );
};

export default ChatPage;
