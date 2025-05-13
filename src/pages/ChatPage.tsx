import React, { useState, useEffect, useCallback, useRef } from "react";
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
import Integrations from "../components/integrations/Integrations";
import EditProject from "../components/edit_project/EditProject";
import { useNavigate } from "react-router-dom";
import { redirectIfNoProjects } from "../utils/projectUtils";

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
  const navigate = useNavigate();
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
  const [dataPanelWidth, setDataPanelWidth] = useState(500);
  const skipNextFetch = useRef(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);

  // Check if user has projects when component mounts
  useEffect(() => {
    redirectIfNoProjects(navigate);

    // Listen for popstate events (browser back/forward buttons)
    const handlePopState = () => {
      redirectIfNoProjects(navigate);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const handleNewChat = () => {
    if (isAwaitingResponse) return;

    const welcomeMsg: Message = {
      id: "welcome",
      text: `Welcome! I am Lily from Mamba. How can I help you today?`,
      sender: "agent",
      timestamp: new Date(),
      type: "text",
    };

    setMessages([welcomeMsg]);
    setDatasets([]);
    setSelectedDatasetId(null);
    setShowDataPanel(false);

    // Close EditProject component if it's open
    if (showEditProject) {
      setShowEditProject(false);
      setEditProjectId(null);
    }

    // Switch back to chat view if we're in integrations
    if (showIntegrations) {
      setShowIntegrations(false);
    }

    localStorage.setItem("lastConversationWasNew", "true");
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

      // Check if this data came from the chat (showPanel = true)
      // or from loading a conversation (showPanel not set)
      const fromChat = tableData.showPanel === true;

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

        console.log("Created dataset:", newDataset, "from chat:", fromChat);

        // Update state with the new dataset
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

        // Only show the panel if data is from chat
        if (fromChat) {
          console.log("Showing data panel for data received during chat");
          setShowDataPanel(true);
        } else {
          console.log("Not showing panel for data from conversation switch");
        }
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
      setShowForm(false);
      if (skipNextFetch.current) {
        skipNextFetch.current = false;
        setIsLoading(false);
        setIsAwaitingResponse(false);
        return;
      }
      // Only skip loading when we're coming from an empty conversationId (new chat)
      // to a newly created conversation with the same messages
      const isNewConversationFromNewChat =
        messages.length > 0 &&
        messages.some((msg) => msg.sender === "user") &&
        messages[0].id === "welcome" &&
        localStorage.getItem("lastConversationWasNew") === "true";
      if (!isNewConversationFromNewChat) {
        fetchMessages(conversationId);
      } else {
        localStorage.removeItem("lastConversationWasNew");
        setIsLoading(false);
        setIsAwaitingResponse(false);
      }
    }
  }, [conversationId]);

  const fetchMessages = async (convId: string) => {
    // Always show loading state when fetching messages
    setIsLoading(true);
    setIsAwaitingResponse(true);
    console.log(`Fetching messages for conversation: ${convId}`);

    // Reset datasets when loading a new conversation
    setDatasets([]);
    setSelectedDatasetId(null);

    // Initially set form visibility to false when loading any conversation
    setShowForm(false);

    try {
      const response = await axiosInstance.get(
        `${API_BASE_URL}/messages/${convId}?limit=0&offset=0&order=asc`
      );

      if (response.status === 200) {
        console.log("Messages response:", response.data);

        // Initialize form state as false by default
        let hasBusinessInfoForm = false;

        // Process regular messages
        if (response.data.messages) {
          console.log("Messages received:", response.data.messages);
          // Transform backend message format to our app's message format
          const formattedMessages = response.data.messages.map((msg: any) => {
            // Check if this message has an action
            let messageType = "text";

            // For the last message, check if there's an action
            if (msg.action && typeof msg.action === "object") {
              if (msg.action["action-type"] === "collect_business_info") {
                console.log("Found collect_business_info action");
                // Set flag to indicate business form should be shown
                hasBusinessInfoForm = true;
                // This message will be of type "form" - commented out to prevent auto form creation
                // messageType = "form";
              }
            }

            return {
              id: msg.id,
              text: msg.content,
              sender: msg.is_from_agency ? "agent" : "user",
              timestamp: new Date(msg.timestamp),
              type: messageType,
            };
          });

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
            // Always filter out any form messages initially - we'll add a form message
            // only if we find the collect_business_info action
            // Don't filter if we found the business info action
            const messagesToDisplay = hasBusinessInfoForm
              ? formattedMessages
              : formattedMessages.filter((msg) => msg.type !== "form");

            // Add welcome message to the beginning of the conversation
            if (messagesToDisplay.length > 0) {
              setMessages([welcomeMessage, ...messagesToDisplay]);
            } else {
              setMessages([welcomeMessage]);
            }

            // Only set showForm to true after messages are loaded and filtered
            setShowForm(hasBusinessInfoForm);

            setIsLoading(false);
            setIsAwaitingResponse(false);
          }, 100); // Small delay to ensure UI updates properly
        }

        // Check for action in the response data directly
        if (response.data.action && typeof response.data.action === "object") {
          if (response.data.action["action-type"] === "collect_business_info") {
            console.log("Found collect_business_info action in response data");
            // Set flag to indicate business form should be shown
            hasBusinessInfoForm = true;

            // Add this as an update to be processed by ChatComponent
            const businessInfoUpdate: Update = {
              sender: "System",
              data: {
                type: "form",
                action: "show_form",
              },
            };

            setUpdates((prev) => [...prev, businessInfoUpdate]);

            // Directly trigger form display after a slight delay
            setTimeout(() => {
              console.log("Directly setting showForm to true");
              setShowForm(true);
            }, 300);
          }
        }

        // Only set showForm at the end after checking all possible sources
        // This ensures we don't reset it too early
        setShowForm(hasBusinessInfoForm);

        // Process generated content (keyword tables)
        if (
          response.data.generated_content &&
          response.data.generated_content.keyword_tables
        ) {
          console.log(
            "Generated content with keyword tables found:",
            response.data.generated_content.keyword_tables
          );

          const keywordTables = response.data.generated_content.keyword_tables;

          // Process each keyword table in the response
          Object.keys(keywordTables).forEach((tableId) => {
            const tableData = keywordTables[tableId];

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

              console.log(
                "Created dataset from generated content:",
                newDataset
              );

              // Add this dataset to our state
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

              // Select the first dataset we find but don't automatically show the panel
              setSelectedDatasetId(tableData.id);
              console.log(
                "Not showing panel for data from conversation loading"
              );
              // Don't open the panel when loading conversation data
            }
          });
        }
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

      // Close EditProject component if it's open
      if (showEditProject) {
        setShowEditProject(false);
        setEditProjectId(null);
      }

      // Switch back to chat view if we're in integrations
      if (showIntegrations) {
        setShowIntegrations(false);
      }

      // Note: isAwaitingResponse will be set to false in fetchMessages
      // when the messages are successfully loaded
    }
  };

  // Add a new conversation to the recent chats list and select it
  const addNewConversation = (
    id: string,
    name: string,
    initialMessages?: Message[]
  ) => {
    const newChat: RecentChat = { id, title: name };
    setRecentChats((prev) => [newChat, ...prev]);
    localStorage.setItem("lastConversationWasNew", "true");
    setConversationId(id);
    if (initialMessages) {
      setMessages(initialMessages);
      skipNextFetch.current = true;
    }
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
    setIsAwaitingResponse(false);
    setIsLoading(false);
  };

  const selectedDataset = datasets.find((ds) => ds.id === selectedDatasetId);

  // Handler to toggle the DataPanel
  const handleToggleCSVPanel = () => {
    // Only allow opening the panel if there's data to show
    if (!showDataPanel && datasets.length === 0) {
      // Don't open the panel if there's no data
      return;
    }
    setShowDataPanel((open) => !open);
  };

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };

  // Add a function to update messages state
  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  // Add an event listener to handle form cancellation from the ChatComponent
  useEffect(() => {
    const handleFormCancelled = (event: any) => {
      // We don't need to check for conversation ID, any form cancellation should be processed
      console.log("Form cancelled event received, setting showForm to false");
      setShowForm(false);

      // Also force-update the messages to remove any form messages
      setMessages((prev) => prev.filter((msg) => msg.type !== "form"));
    };

    // Add the event listener
    window.addEventListener("formCancelled", handleFormCancelled);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("formCancelled", handleFormCancelled);
    };
  }, []);

  // Add an event listener to handle form request from the ChatComponent
  useEffect(() => {
    const handleFormRequested = (event: any) => {
      // Check if this is for the current conversation
      if (event.detail.conversationId === conversationId) {
        console.log("Form requested event received, setting showForm to true");
        setShowForm(true);
      }
    };

    // Add the event listener
    window.addEventListener("formRequested", handleFormRequested);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("formRequested", handleFormRequested);
    };
  }, [conversationId]);

  // Add an event listener to handle form submission from the ChatComponent
  useEffect(() => {
    const handleFormSubmitted = (event: any) => {
      console.log("Form submitted event received, setting showForm to false");
      setShowForm(false);

      // Also force remove any form messages to be extra safe
      setMessages((prev) => prev.filter((msg) => msg.type !== "form"));
    };

    // Add the event listener
    window.addEventListener("formSubmitted", handleFormSubmitted);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("formSubmitted", handleFormSubmitted);
    };
  }, []);

  // Handler to update the panel width
  const handleDataPanelResize = (width: number) => {
    setDataPanelWidth(width);
  };

  // Add this handler
  const handleIntegrationsClick = () => {
    setShowIntegrations(true);

    // Close EditProject component if it's open
    if (showEditProject) {
      setShowEditProject(false);
      setEditProjectId(null);
    }
  };

  // Add this handler
  const handleChatClick = () => {
    setShowIntegrations(false);
  };

  // Add this handler
  const handleEditProject = (projectId: string) => {
    console.log(`Editing project: ${projectId}`);
    // Always set these states in this order to ensure proper UI transition
    setShowIntegrations(false);
    setTimeout(() => {
      setEditProjectId(projectId);
      setShowEditProject(true);
    }, 0);
  };

  // Update this function or add as needed
  const handleCloseEditProject = () => {
    setShowEditProject(false);
    setEditProjectId(null);
  };

  // Listen for project edit requests
  useEffect(() => {
    const handleProjectEditRequested = (event: CustomEvent) => {
      console.log("Project edit requested event received:", event.detail);
      if (event.detail && event.detail.projectId) {
        console.log(`Handling edit for project: ${event.detail.projectId}`);
        handleEditProject(event.detail.projectId);
      }
    };

    window.addEventListener(
      "projectEditRequested",
      handleProjectEditRequested as EventListener
    );

    return () => {
      window.removeEventListener(
        "projectEditRequested",
        handleProjectEditRequested as EventListener
      );
    };
  }, []);

  // Listen for close edit project requests
  useEffect(() => {
    const handleCloseEditProject = () => {
      if (showEditProject) {
        setShowEditProject(false);
        setEditProjectId(null);
      }
    };

    window.addEventListener("closeEditProject", handleCloseEditProject);

    return () => {
      window.removeEventListener("closeEditProject", handleCloseEditProject);
    };
  }, [showEditProject]);

  // Add a global event listener for debugging
  useEffect(() => {
    const debugEventListener = (event: Event) => {
      if (event.type.includes("project") || event.type.includes("edit")) {
        console.log(`Debug - Event detected: ${event.type}`, event);
      }
    };

    // Add capture phase to ensure we see all events
    window.addEventListener("projectEditRequested", debugEventListener, true);
    window.addEventListener("closeEditProject", debugEventListener, true);
    window.addEventListener("projectUpdated", debugEventListener, true);

    return () => {
      window.removeEventListener(
        "projectEditRequested",
        debugEventListener,
        true
      );
      window.removeEventListener("closeEditProject", debugEventListener, true);
      window.removeEventListener("projectUpdated", debugEventListener, true);
    };
  }, []);

  // Listen for exit integrations view requests
  useEffect(() => {
    const handleExitIntegrationsView = () => {
      console.log("Exiting integrations view");
      setShowIntegrations(false);
    };

    window.addEventListener("exitIntegrationsView", handleExitIntegrationsView);

    return () => {
      window.removeEventListener(
        "exitIntegrationsView",
        handleExitIntegrationsView
      );
    };
  }, []);

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
        hasDataToShow={datasets.length > 0}
      />
      <Box
        sx={{
          height: "calc(100vh - 64px)", // Adjust for app bar height
          width: "100%",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "row",
          overflow: "hidden", // Prevent scrolling
          position: "relative",
          maxHeight: "calc(100vh - 64px)", // Ensure max height is set
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
          onIntegrationsClick={handleIntegrationsClick}
          onChatClick={handleChatClick}
          showIntegrations={showIntegrations}
        />
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            height: "100%",
            transition: "all 0.3s ease",
            overflow: "hidden", // Prevent scrolling
            justifyContent: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Box
            sx={{
              width: showDataPanel
                ? `calc(100% - ${dataPanelWidth}px)`
                : "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden", // Prevent scrolling
            }}
          >
            {showIntegrations ? (
              <Integrations />
            ) : showEditProject && editProjectId ? (
              <EditProject
                projectId={editProjectId}
                onClose={handleCloseEditProject}
              />
            ) : (
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
            )}
          </Box>
          {showDataPanel && (
            <DataPanel
              open={showDataPanel}
              onClose={() => setShowDataPanel(false)}
              datasets={datasets}
              selectedDatasetId={selectedDatasetId}
              onDatasetSelect={handleDatasetSelect}
              data={selectedDataset?.data || []}
              onResize={handleDataPanelResize}
              initialWidth={dataPanelWidth}
            />
          )}
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
      </Box>
    </>
  );
};

export default ChatPage;
