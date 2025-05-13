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
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";
import {
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

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

  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [activeProject, setActiveProject] = React.useState<Project | null>(
    null
  );

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    project: Project
  ) => {
    event.stopPropagation(); // Prevent the Select from opening
    setMenuAnchorEl(event.currentTarget);
    setActiveProject(project);
  };

  const handleMenuClose = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent the Select from opening
    setMenuAnchorEl(null);
  };

  const handleEditClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent the Select from opening
    setMenuAnchorEl(null);

    if (activeProject) {
      // Dispatch a custom event to notify the ChatPage that a project edit was requested
      const editEvent = new CustomEvent("projectEditRequested", {
        detail: { projectId: activeProject.id },
      });
      window.dispatchEvent(editEvent);

      // Close the select dropdown
      onClose();
    }
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // Prevent the Select from opening
    setMenuAnchorEl(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeProject) return;

    try {
      await axiosInstance.delete(`/projects/${activeProject.id}`);

      // Remove the project from the list
      setProjects(projects.filter((p) => p.id !== activeProject.id));

      // If the deleted project was selected, select another project
      if (selectedProject === activeProject.id) {
        const remainingProjects = projects.filter(
          (p) => p.id !== activeProject.id
        );
        if (remainingProjects.length > 0) {
          setSelectedProject(remainingProjects[0].id);
          localStorage.setItem(
            "currentProject",
            JSON.stringify(remainingProjects[0])
          );
          if (onProjectChange) {
            onProjectChange();
          }
        } else {
          localStorage.removeItem("currentProject");
          setSelectedProject("");
        }
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }

    setDeleteDialogOpen(false);
    setActiveProject(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setActiveProject(null);
  };

  // Listen for project updated events
  React.useEffect(() => {
    const handleProjectUpdated = () => {
      // Refresh the projects list
      fetchProjects();
    };

    window.addEventListener("projectUpdated", handleProjectUpdated);

    return () => {
      window.removeEventListener("projectUpdated", handleProjectUpdated);
    };
  }, []);

  // Add a function to fetch projects that can be called independently
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
          localStorage.setItem("currentProject", JSON.stringify(firstProject));
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

  React.useEffect(() => {
    // Load projects from API
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
    <>
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
            "& .project-menu-button": {
              display: "none", // Hide the menu button in the selected display
            },
          },
          "&.Mui-disabled": {
            opacity: 0.5,
          },
        }}
        renderValue={(selected) => {
          if (selected === "new") {
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
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
              </Box>
            );
          }

          const project = projects.find((p) => p.id === selected);
          if (!project) return null;

          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <ListItemAvatar>
                <Avatar>
                  <DevicesRoundedIcon sx={{ fontSize: "1rem" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <span style={{ fontWeight: 600 }}>{project.name}</span>
                }
                secondary={
                  project.website_url
                    ? project.website_url
                        .replace(/^https?:\/\//, "")
                        .replace(/\/[a-z]{2}-[a-z]{2}$/, "")
                    : ""
                }
              />
            </Box>
          );
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
            <Box
              className="project-menu-button"
              onClick={(e) => handleMenuOpen(e, project)}
              sx={{
                ml: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <MoreVertIcon fontSize="small" />
            </Box>
          </MenuItem>
        ))}
      </Select>

      {/* Project Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Project</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {activeProject?.name}? This action
          cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
