import axiosInstance from "./axios";

/**
 * Checks if the current user has any projects
 * @returns Promise<boolean> True if user has at least one project, false otherwise
 */
export const hasProjects = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get("/projects");
    const projects = response.data;
    return Array.isArray(projects) && projects.length > 0;
  } catch (error) {
    console.error("Error checking projects:", error);
    return false;
  }
};

/**
 * Redirects to new project page if user has no projects
 * @param navigate React Router's navigate function
 * @returns Promise<boolean> True if user has projects, false if redirected
 */
export const redirectIfNoProjects = async (navigate: any): Promise<boolean> => {
  const hasUserProjects = await hasProjects();
  if (!hasUserProjects) {
    navigate("/new-project", { replace: true });
    return false;
  }
  return true;
};
