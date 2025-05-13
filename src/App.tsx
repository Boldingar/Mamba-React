import React, { useEffect, useState } from "react";
import { CssBaseline, Box } from "@mui/material";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import AppTheme from "../shared-theme/AppTheme";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewProject from "./pages/NewProject";
import TopAppBar from "./components/TopAppBar";
import SignInSide from "./pages/sign-in-side/SignInSide";
import { useAuthRedirect } from "./utils/authRedirect";
import { redirectIfNoProjects } from "./utils/projectUtils";

function checkAuth() {
  const localToken = localStorage.getItem("authToken");
  const sessionToken = sessionStorage.getItem("authToken");
  return !!(localToken || sessionToken);
}

// Wrapper component to handle route-level auth redirects
function AuthRedirectHandler({ children }: { children: React.ReactNode }) {
  useAuthRedirect(); // Use our custom hook
  return <>{children}</>;
}

// Project Guard component to check if user has projects
const ProjectGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has projects and redirect if not
    const checkUserProjects = async () => {
      try {
        await redirectIfNoProjects(navigate);
        setLoading(false);
      } catch (error) {
        console.error("Error in ProjectGuard:", error);
        setLoading(false);
      }
    };

    checkUserProjects();
  }, [navigate]);

  if (loading) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());

  useEffect(() => {
    function handleStorageChange() {
      setIsAuthenticated(checkAuth());
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <CssVarsProvider>
      <ThemeProvider>
        <AppTheme>
          <CssBaseline />
          <Box
            sx={{
              width: "100vw",
              height: "90vh",
              marginTop: "0vh",
              padding: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <BrowserRouter>
              <AuthRedirectHandler>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      isAuthenticated ? (
                        <Navigate to="/" replace />
                      ) : (
                        <SignInSide setIsAuthenticated={setIsAuthenticated} />
                      )
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      isAuthenticated ? (
                        <Navigate to="/" replace />
                      ) : (
                        <RegisterPage />
                      )
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      isAuthenticated ? (
                        <Navigate to="/chat" replace />
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      isAuthenticated ? (
                        <ProjectGuard>
                          <TopAppBar
                            csvPanelOpen={false}
                            onToggleCSVPanel={() => {}}
                          />
                          <ChatPage setIsAuthenticated={setIsAuthenticated} />
                        </ProjectGuard>
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/new-project"
                    element={
                      isAuthenticated ? (
                        <>
                          {/* <TopAppBar
                            csvPanelOpen={false}
                            onToggleCSVPanel={() => {}}
                          /> */}
                          <NewProject />
                        </>
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                  <Route
                    path="/"
                    element={
                      isAuthenticated ? (
                        <ProjectGuard>
                          <Navigate to="/chat" replace />
                        </ProjectGuard>
                      ) : (
                        <Navigate to="/login" replace />
                      )
                    }
                  />
                </Routes>
              </AuthRedirectHandler>
            </BrowserRouter>
          </Box>
        </AppTheme>
      </ThemeProvider>
    </CssVarsProvider>
  );
}

export default App;
