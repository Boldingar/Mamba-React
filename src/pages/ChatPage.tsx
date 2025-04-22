import React, { useState, useEffect, useCallback } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ChatInterface from "../components/ChatInterface";
import DataPanel from "../components/DataPanel";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";

const API_BASE_URL = "http://127.0.0.1:5000";

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

const ChatPage: React.FC = () => {
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

  // Function to fetch table data
  const fetchTableData = useCallback(async (tableId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/get_table_data?table_id=${tableId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch table data");
      const result: TableResponse = await response.json();

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

        // Process updates
        if (data.updates && data.updates.length > 0) {
          setUpdates(data.updates);
        }
      } catch (error) {
        console.error("Error polling for updates:", error);
      }
    };

    // Initial poll
    pollForUpdates();

    // Set up polling interval (every 3 seconds)
    const intervalId = setInterval(pollForUpdates, 3000);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleDatasetSelect = (datasetId: string) => {
    setSelectedDatasetId(datasetId);
  };

  const selectedDataset = datasets.find((ds) => ds.id === selectedDatasetId);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          "& > *": ScrollbarStyle,
        }}
      >
        <ChatInterface
          onTableReady={fetchTableData}
          updates={updates}
          agentProcessing={agentProcessing}
        />
      </Box>

      {datasets.length > 0 && (
        <Tooltip title="View CSV Data" placement="left">
          <IconButton
            onClick={() => setShowDataPanel(true)}
            sx={{
              position: "fixed",
              width: 56,
              height: 56,
              top: 20,
              right: 20,
              zIndex: 1200,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": {
                bgcolor: "background.paper",
                opacity: 0.8,
              },
            }}
          >
            <DescriptionIcon />
          </IconButton>
        </Tooltip>
      )}

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
  );
};

export default ChatPage;
