import React, { useState, useEffect, useCallback } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ChatComponent from "../components/ChatComponent";
import DataPanel from "../components/DataPanel";
import UserPanel from "../components/UserPanel";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import axios from "axios";
import TopAppBar from "../components/TopAppBar";
import { API_BASE_URL } from "../utils/axios";
import UserProfile from "../components/UserProfile";

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
  sender: "user" | "agent";
  type?: "text" | "form" | "form_submitted" | "csv_data";
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
  setIsAuthenticated?: (auth: boolean) => void;
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
  const [conversationId, setConversationId] = useState("1");
  const [recentChats, setRecentChats] = useState<
    { id: string; title: string }[]
  >([]);

  // Function to fetch table data
  const fetchTableData = useCallback(async (tableId: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get_table_data?table_id=${tableId}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status !== 200)
        throw new Error("Failed to fetch table data");
      const result: TableResponse = response.data;

      if (result.status === "success" && result.data) {
        const tableData = result.data;

        // Create dataset from table data
        const newDataset: Dataset = {
          id: tableData.id,
          name: tableData.id,
          displayName: tableData.id,
          data: tableData.rows,
          timestamp: new Date(),
        };

        setDatasets((prev) => [...prev, newDataset]);
        setSelectedDatasetId(newDataset.id);
        setShowDataPanel(true);
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      setError(`Failed to load table data: ${error.message}`);
    }
  }, []);

  // Start polling when component mounts
  useEffect(() => {
    let isPolling = true;
    let retryCount = 0;
    const maxRetries = 3;
    let pollInterval = 3000; // Start with 3 seconds

    // const pollForUpdates = async () => {
    //   if (!isPolling) return;

    //   try {
    //     const response = await axios.get(`${API_BASE_URL}/get_updates`, {
    //       headers: { "Content-Type": "application/json" },
    //     });

    //     if (response.status !== 200) throw new Error("Failed to fetch updates");
    //     const data: APIResponse = response.data;

    //     // Reset retry count and interval on successful request
    //     retryCount = 0;
    //     pollInterval = 3000;

    //     // Update agent processing state
    //     setAgentProcessing(data.agent_processing || false);

    //     // Update form visibility
    //     setShowForm(data.show_form || false);

    //     // Process updates
    //     if (data.updates && data.updates.length > 0) {
    //       setUpdates(data.updates);
    //     }
    //   } catch (error) {
    //     console.error("Error polling for updates:", error);
    //     retryCount++;

    //     // If we've failed maxRetries times, stop polling
    //     if (retryCount >= maxRetries) {
    //       console.log("Max retries reached, stopping polling");
    //       isPolling = false;
    //       return;
    //     }

    //     // Exponential backoff: double the interval each time
    //     pollInterval = Math.min(pollInterval * 2, 30000); // Max 30 seconds
    //   }

    //   // Schedule next poll
    //   if (isPolling) {
    //     setTimeout(pollForUpdates, pollInterval);
    //   }
    // };

    // // Initial poll
    // pollForUpdates();

    // Cleanup on unmount
    return () => {
      isPolling = false;
    };
  }, []);

  useEffect(() => {
    // Add two dummy CSV datasets on mount for testing
    setDatasets([
      {
        id: "dummy1",
        name: "Dummy Dataset",
        displayName: "Dummy Dataset",
        data: [
          { Name: "Alice", Email: "alice@example.com", Age: 25 },
          { Name: "Bob", Email: "bob@example.com", Age: 30 },
          { Name: "Charlie", Email: "charlie@example.com", Age: 22 },
        ],
        timestamp: new Date(),
      },
      {
        id: "dummy2",
        name: "Sales Data",
        displayName: "Sales Data",
        data: [
          { Product: "Widget", Region: "North", Sales: 120 },
          { Product: "Gadget", Region: "South", Sales: 95 },
          { Product: "Doohickey", Region: "East", Sales: 150 },
        ],
        timestamp: new Date(),
      },
    ]);
    setSelectedDatasetId("dummy1");
  }, []);

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };

  const selectedDataset = datasets.find((ds) => ds.id === selectedDatasetId);

  // Handler to toggle the DataPanel
  const handleToggleCSVPanel = () => setShowDataPanel((open) => !open);

  const handleNewChat = () => {
    setRecentChats((prev) => [
      ...prev,
      { id: conversationId, title: `Conversation ${conversationId}` },
    ]);
    setConversationId((prev) => {
      const nextId = (parseInt(prev, 10) + 1).toString();
      return nextId;
    });
  };

  const handleSelectChat = (id: string) => {
    setConversationId(id);
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
        <DataPanel
          open={showDataPanel}
          onClose={() => setShowDataPanel(false)}
          datasets={datasets}
          selectedDatasetId={selectedDatasetId}
          onDatasetSelect={handleDatasetSelect}
          data={selectedDataset?.data || []}
        />
      </Box>
    </>
  );
};

export default ChatPage;
