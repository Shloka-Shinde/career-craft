import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Importing Pages
import Index from "./pages/Index";
import JobSearch from "./pages/JobSearch";
import JobPost from "./pages/JobPost";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Auth from "./pages/Auth";
import CategoryForecast from "./pages/CategoryForecast";
import SetupProfile from "./pages/SetupProfile";
import CandidateProfile from "./pages/CandidateProfile";
import InterviewStatsChart from "./pages/InterviewStatsChart";
import FilterSidebar from "./pages/FilterSidebar";
import NotFound from "./pages/NotFound";
import ForecastChart from "./pages/ForecastChart"; 
import JobPostForm from "./components/JobPostForm";
import LiveData from "./pages/LiveData"
import ResumeBuilder from "./components/ResumeBuilder.jsx"
import ResumeList from "./pages/ResumeList.jsx";
import JobSeekerDashboard from "./pages/JobSeekerDashboard.jsx"
import SimCard from "./components/SimCard.jsx";

// Create Query Client for React Query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        {/* Toast Notifications */}
        <Toaster />
        <Sonner />

        {/* App Routing */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/post-job" element={<JobPost />} />
            <Route path="/interview-stats-chart" element={<InterviewStatsChart />} />
            <Route path="/category-forecast" element={<CategoryForecast />} />
            <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
            <Route path="/job-post-form" element={<JobPostForm/>} />
            <Route path="/filter-sidebar" element={<FilterSidebar />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup-profile" element={<SetupProfile />} />
            <Route path="/job-post-form" element={<JobPostForm />}  />
            <Route path="/job-post" element={<JobPost />}  />
            <Route path="/job-seeker-dashboard" element={<JobSeekerDashboard />}  />
            <Route path="/candidate-profile" element={<CandidateProfile />} />
            <Route path="/resume-list" element={<ResumeList />} />
  
            <Route path="/live-data" element={<LiveData />} />

            <Route path="/sim-card" element={<SimCard />} />

           
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/forecast-chart" element={<ForecastChart />} /> {/* SARIMA Forecast Page */}
            <Route path="*" element={<NotFound />} /> {/* Catch-All 404 Page */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
