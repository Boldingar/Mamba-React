import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Store integration statuses in localStorage
export const saveIntegrationStatus = (service: string, status: boolean) => {
  try {
    const currentStatuses = JSON.parse(
      localStorage.getItem("integrationStatuses") || "{}"
    );
    currentStatuses[service] = status;
    localStorage.setItem(
      "integrationStatuses",
      JSON.stringify(currentStatuses)
    );
  } catch (error) {
    console.error("Error saving integration status:", error);
  }
};

// Get integration status
export const getIntegrationStatus = (service: string): boolean => {
  try {
    const currentStatuses = JSON.parse(
      localStorage.getItem("integrationStatuses") || "{}"
    );
    return !!currentStatuses[service];
  } catch (error) {
    console.error("Error getting integration status:", error);
    return false;
  }
};

// Hook to handle redirects from Google OAuth
export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse the query parameters
    const params = new URLSearchParams(location.search);
    const googleAuthStatus = params.get("google_auth_status");
    const service = params.get("service");

    // If we have redirect parameters, process them
    if (googleAuthStatus && service) {
      if (googleAuthStatus === "success") {
        // Save the successful integration status
        saveIntegrationStatus(service, true);

        // Redirect to chat page
        navigate("/chat");
      } else if (googleAuthStatus === "error") {
        // Handle error if needed
        console.error(`Authentication failed for service: ${service}`);

        // Still redirect to chat page
        navigate("/chat");
      }
    }
  }, [location, navigate]);
};
