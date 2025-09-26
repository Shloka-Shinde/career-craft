import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import JobSearch from "./pages/JobSearch";
import JobPost from "./pages/JobPost";
import JobSeekerDashboard from "./pages/JobSeekerDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Auth from "./pages/Auth";
import SetupProfile from "./pages/SetupProfile";
import NotFound from "./pages/NotFound";
import GitHubToGemini from "./components/gemini";


const queryClient = new QueryClient();

// Protected route component that checks user role
const ProtectedRoute = ({ 
  element, 
  requiresAuth = true, 
  requiresRecruiter = false,
  fallbackPath = "/auth"
}) => {
  const { isAuthenticated, isLoading, isRecruiter } = useAuth();
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-primary/20"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Only redirect if we're not loading and the conditions are not met
  if (!isLoading) {
    if (requiresAuth && !isAuthenticated) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    if (requiresRecruiter && !isRecruiter) {
      return <Navigate to="/job-seeker-dashboard" replace />;
    }
  }
  
  // If all conditions are met, render the element
  return element;
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/jobs" element={<JobSearch />} />
                <Route path="/gemini" element={<GitHubToGemini />} />
                <Route path="/post-job" element={
                  <ProtectedRoute 
                    element={<JobPost />} 
                    requiresAuth={true} 
                    requiresRecruiter={true} 
                  />
                } />
                <Route path="/job-seeker-dashboard" element={
                  <ProtectedRoute 
                    element={<JobSeekerDashboard />} 
                    requiresAuth={true} 
                    requiresRecruiter={false} 
                  />
                } />
                <Route path="/recruiter-dashboard" element={
                  <ProtectedRoute 
                    element={<RecruiterDashboard />} 
                    requiresAuth={true} 
                    requiresRecruiter={true} 
                  />
                } />
                <Route path="/auth" element={<Auth />} />
                <Route path="/setup-profile" element={
                  <ProtectedRoute 
                    element={<SetupProfile />}
                    requiresAuth={true}
                  />
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;