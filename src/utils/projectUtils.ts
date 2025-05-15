import axiosInstance from "./axios";

// Projects cache to prevent duplicate API calls
let projectsCache: any[] | null = null;
let lastFetchTimestamp: number = 0;
const CACHE_EXPIRY = 60000; // Cache expires after 1 minute

/**
 * Clears the projects cache, forcing next call to fetch from API
 */
export const clearProjectsCache = () => {
  projectsCache = null;
  lastFetchTimestamp = 0;
};

/**
 * Gets projects from cache or API
 * @returns Promise<any[]> Array of projects
 */
export const getProjects = async (): Promise<any[]> => {
  const now = Date.now();
  // Use cache if it exists and isn't expired
  if (projectsCache && now - lastFetchTimestamp < CACHE_EXPIRY) {
    return projectsCache;
  }

  try {
    const response = await axiosInstance.get("/projects");
    projectsCache = response.data;
    lastFetchTimestamp = now;
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

/**
 * Checks if the current user has any projects
 * @returns Promise<boolean> True if user has at least one project, false otherwise
 */
export const hasProjects = async (): Promise<boolean> => {
  try {
    const projects = await getProjects();
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
