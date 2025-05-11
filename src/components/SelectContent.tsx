import * as React from "react";
import MuiAvatar from "@mui/material/Avatar";
import MuiListItemAvatar from "@mui/material/ListItemAvatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListSubheader from "@mui/material/ListSubheader";
import Select, { SelectChangeEvent, selectClasses } from "@mui/material/Select";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import DevicesRoundedIcon from "@mui/icons-material/DevicesRounded";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

interface Project {
  id: string;
  name: string;
  website_url: string;
  project_data: any;
  user_email: string;
}

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 28,
  height: 28,
  backgroundColor: (theme as any).vars
    ? (theme as any).vars.palette.background.paper
    : theme.palette.background.paper,
  color: (theme as any).vars
    ? (theme as any).vars.palette.text.secondary
    : theme.palette.text.secondary,
  border: `1px solid ${
    (theme as any).vars
      ? (theme as any).vars.palette.divider
      : theme.palette.divider
  }`,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 30,
});

interface SelectContentProps {
  onClose: () => void;
  onProjectChange?: () => void;
  isDisabled?: boolean;
}

export default function SelectContent({
  onClose,
  onProjectChange,
  isDisabled = false,
}: SelectContentProps) {
  const [selectedProject, setSelectedProject] = React.useState("");
  const [projects, setProjects] = React.useState<Project[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Load projects from API
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/projects");
        setProjects(response.data);

        // Get current project from storage
        const currentProject =
          localStorage.getItem("currentProject") ||
          sessionStorage.getItem("currentProject");

        if (currentProject) {
          const project = JSON.parse(currentProject);
          // Check if the stored project still exists in the fetched projects
          if (response.data.some((p: Project) => p.id === project.id)) {
            setSelectedProject(project.id);
          } else if (response.data.length > 0) {
            // If stored project doesn't exist, select first project
            const firstProject = response.data[0];
            setSelectedProject(firstProject.id);
            localStorage.setItem(
              "currentProject",
              JSON.stringify(firstProject)
            );
          }
        } else if (response.data.length > 0) {
          // No project in storage, select first project
          const firstProject = response.data[0];
          setSelectedProject(firstProject.id);
          localStorage.setItem("currentProject", JSON.stringify(firstProject));
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = async (event: SelectChangeEvent) => {
    const projectId = event.target.value;

    // Handle new project selection
    if (projectId === "new") {
      navigate("/new-project");
      onClose();
      return;
    }

    setSelectedProject(projectId);

    try {
      // Find the selected project
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        // Clear existing conversations first
        localStorage.setItem("conversations", JSON.stringify([]));
        // Store the selected project
        localStorage.setItem("currentProject", JSON.stringify(project));

        // Notify parent about project change to trigger loading state and fetch conversations
        if (onProjectChange) {
          onProjectChange();
        }

        onClose();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  return (
    <Select
      labelId="project-select"
      id="project-simple-select"
      value={selectedProject}
      onChange={handleChange}
      displayEmpty
      inputProps={{ "aria-label": "Select project" }}
      fullWidth
      disabled={isDisabled}
      sx={{
        maxHeight: 56,
        width: 250,
        borderRadius: 2,
        "&.MuiList-root": {
          p: "8px",
        },
        [`& .${selectClasses.select}`]: {
          display: "flex",
          alignItems: "center",
          gap: "2px",
          pl: 1,
        },
        "&.Mui-disabled": {
          opacity: 0.5,
        },
      }}
    >
      <MenuItem value="new" sx={{ color: "primary.main" }}>
        <ListItemAvatar>
          <AddIcon sx={{ fontSize: "1.9rem", paddingTop: "6px" }} />
        </ListItemAvatar>
        <ListItemText
          primary={
            <span style={{ fontWeight: 600, color: "inherit" }}>
              New Project
            </span>
          }
        />
      </MenuItem>
      <Divider sx={{ my: 1 }} />
      <ListSubheader sx={{ backgroundColor: "transparent", pt: 0 }}>
        Projects
      </ListSubheader>
      {projects.map((project) => (
        <MenuItem key={project.id} value={project.id}>
          <ListItemAvatar>
            <Avatar>
              <DevicesRoundedIcon sx={{ fontSize: "1rem" }} />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<span style={{ fontWeight: 600 }}>{project.name}</span>}
            secondary={
              project.website_url
                ? project.website_url
                    .replace(/^https?:\/\//, "")
                    .replace(/\/[a-z]{2}-[a-z]{2}$/, "")
                : ""
            }
          />
        </MenuItem>
      ))}
    </Select>
  );
}
