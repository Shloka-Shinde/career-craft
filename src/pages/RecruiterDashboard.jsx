import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InterviewScheduler from "@/components/InterviewScheduler";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, Briefcase, Calendar, Clock, Eye, Filter, MessageCircle, Plus, Search, Star, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

// Mock data for job listings
const jobListings = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA",
    type: "Full-time",
    datePosted: "September 15, 2023",
    applicants: 24,
    views: 187,
    status: "Active",
  },
  {
    id: "2",
    title: "UX/UI Designer",
    location: "Remote",
    type: "Remote",
    datePosted: "September 10, 2023",
    applicants: 18,
    views: 143,
    status: "Active",
  },
  {
    id: "3",
    title: "Product Manager",
    location: "New York, NY",
    type: "Full-time",
    datePosted: "August 28, 2023",
    applicants: 32,
    views: 256,
    status: "Closed",
  },
];

// Mock data for candidates
const candidates = [
  {
    id: "1",
    name: "Emily Johnson",
    title: "Senior Frontend Developer",
    location: "San Francisco, CA",
    appliedFor: "Senior Frontend Developer",
    appliedDate: "September 16, 2023",
    status: "New",
    skills: ["React", "TypeScript", "CSS", "JavaScript"],
    experience: "7 years",
    education: "B.S. Computer Science, Stanford University",
    rating: 4.5,
    avatar: "",
  },
  {
    id: "2",
    name: "Michael Williams",
    title: "UX/UI Designer",
    location: "Los Angeles, CA",
    appliedFor: "UX/UI Designer",
    appliedDate: "September 12, 2023",
    status: "Reviewed",
    skills: ["Figma", "Adobe XD", "UI Design", "Prototyping"],
    experience: "5 years",
    education: "B.A. Design, Rhode Island School of Design",
    rating: 4.0,
    avatar: "",
  },
  {
    id: "3",
    name: "David Martinez",
    title: "Product Manager",
    location: "Chicago, IL",
    appliedFor: "Product Manager",
    appliedDate: "September 5, 2023",
    status: "Interview",
    skills: ["Product Strategy", "Agile", "User Research", "Roadmapping"],
    experience: "6 years",
    education: "MBA, University of Chicago",
    rating: 4.8,
    avatar: "",
  },
  {
    id: "4",
    name: "Sarah Thompson",
    title: "Senior Frontend Developer",
    location: "Boston, MA",
    appliedFor: "Senior Frontend Developer",
    appliedDate: "September 18, 2023",
    status: "New",
    skills: ["Vue.js", "React", "JavaScript", "HTML/CSS"],
    experience: "6 years",
    education: "B.S. Computer Science, MIT",
    rating: 4.2,
    avatar: "",
  },
];

// Mock data for analytics
const analytics = {
  jobViews: {
    total: 586,
    change: 12.5,
    data: [20, 40, 30, 45, 60, 55, 70, 80, 75, 85, 90, 100]
  },
  applications: {
    total: 74,
    change: 8.2,
    data: [5, 8, 6, 10, 12, 9, 14, 15, 10, 12, 16, 18]
  },
  interviews: {
    total: 18,
    change: -3.5,
    data: [2, 3, 1, 2, 3, 2, 4, 3, 2, 1, 3, 2]
  },
  conversionRate: {
    value: "24.3%",
    change: 5.7,
  }
};

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingResume, setLoadingResume] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [generatedMeetLink, setGeneratedMeetLink] = useState('');
  const [interviewDetails, setInterviewDetails] = useState(null);
  const navigate = useNavigate();

  // Fetch posted jobs from Supabase
  useEffect(() => {
    const fetchPostedJobs = async () => {
      try {
        setLoading(true);
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching jobs:', error);
          setError(error.message);
        } else {
          setPostedJobs(jobs || []);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchPostedJobs();
  }, []);

  // Function to fetch applicants for a specific job and switch to candidates tab
  const handleViewApplicants = async (jobId, jobTitle) => {
    try {
      setSelectedJob({ id: jobId, title: jobTitle });
      setLoadingApplicants(true);
      
      // First, fetch applications for the job
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jobId);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        setError(applicationsError.message);
        return;
      }

      if (applications && applications.length > 0) {
        // Get all applicant IDs
        const applicantIds = applications.map(app => app.applicant_id);
        
        // Fetch profiles for all applicants
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', applicantIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          setError(profilesError.message);
          return;
        }

        // Combine applications with profile data
        const applicationsWithProfiles = applications.map(application => {
          const profile = profiles.find(p => p.id === application.applicant_id);
          return {
            ...application,
            applicant: profile || null
          };
        });

        console.log('Applications with profiles:', applicationsWithProfiles);
        setJobApplicants(applicationsWithProfiles);
      } else {
        setJobApplicants([]);
      }
      
      // Switch to candidates tab after fetching data
      setActiveTab("candidates");
    } catch (err) {
      console.error('Error fetching job applicants:', err);
      setError('Failed to fetch job applicants');
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Function to handle view applicants from dropdown
  const handleDropdownViewApplicants = (job) => {
    handleViewApplicants(job.id, job.title);
  };

  // Function to handle viewing resume
  const handleViewProfile = async (applicantId) => {
    try {
      setLoadingResume(true);
      
      // Fetch resumes from resumes table using applicant_id
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', applicantId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching resume:', error);
        setError('Failed to fetch resume');
        return;
      }

      if (resumes && resumes.length > 0) {
        // Use the primary resume if available, otherwise use the most recent one
        const resume = resumes.find(r => r.is_primary) || resumes[0];
        
        console.log('Raw resume data:', resume);
        
        // Parse JSON fields safely - handle both strings and objects
        const parsedResume = {
          ...resume,
          work_experience: parseField(resume.work_experience),
          education: parseField(resume.education),
          skills: parseField(resume.skills),
        };
        
        console.log('Parsed resume:', parsedResume);
        
        setSelectedResume(parsedResume);
        setShowPopup(true);
      } else {
        setError('No resume found for this applicant');
      }
    } catch (err) {
      console.error('Error fetching resume:', err);
      setError('Failed to fetch resume');
    } finally {
      setLoadingResume(false);
    }
  };

  // Helper function to parse fields safely
  const parseField = (field) => {
    if (field === null || field === undefined) {
      return [];
    }
    
    // If it's already an array, return it
    if (Array.isArray(field)) {
      return field;
    }
    
    // If it's already an object (but not array), wrap it in array
    if (typeof field === 'object' && field !== null) {
      return [field];
    }
    
    // If it's a string, try to parse it
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        // Ensure we always return an array
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (error) {
        console.warn('Failed to parse JSON field:', error, 'Field value:', field);
        return [];
      }
    }
    
    return [];
  };

  // Function to generate Google Meet link
  const generateMeetLink = () => {
    // Create a more professional meeting ID
    const adjectives = ['quick', 'brief', 'technical', 'interview', 'career', 'professional', 'team'];
    const nouns = ['meeting', 'discussion', 'interview', 'call', 'session', 'review'];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    
    const meetingId = `${randomAdjective}-${randomNoun}-${randomNum}`;
    return `https://meet.google.com/${meetingId}`;
  };

  // Function to handle schedule interview
  const handleScheduleInterview = (applicantName, applicantEmail, jobTitle, applicantId) => {
    const meetLink = generateMeetLink();
    
    const details = {
      link: meetLink,
      applicantName: applicantName || 'Applicant',
      applicantEmail: applicantEmail,
      jobTitle: jobTitle || 'Position',
      applicantId: applicantId,
      scheduledBy: 'Recruiter',
      createdAt: new Date().toISOString()
    };
    
    setGeneratedMeetLink(meetLink);
    setInterviewDetails(details);
    setShowInterviewModal(true);
  };

  const confirmInterview = () => {
    // Save to database if needed
    if (interviewDetails) {
      saveInterviewToDatabase(interviewDetails);
    }
    setShowInterviewModal(false);
    // Show success message
    alert('Interview scheduled successfully!');
  };

  // Optional: Save interview to your database
  const saveInterviewToDatabase = async (meetingDetails) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([
          {
            applicant_id: meetingDetails.applicantId,
            job_id: selectedJob?.id,
            meet_link: meetingDetails.link,
            scheduled_by: meetingDetails.scheduledBy,
            scheduled_for: new Date().toISOString(),
            status: 'scheduled'
          }
        ]);

      if (error) {
        console.error('Error saving interview:', error);
      } else {
        console.log('Interview saved to database:', data);
      }
    } catch (err) {
      console.error('Error saving interview to database:', err);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Tech Innovations Inc.</p>
            </div>
            
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Users size={16} />
                Candidates
              </Button>
              <Button size="sm" className="flex items-center gap-2" onClick={() => navigate('/post-job')}>
                <Plus size={16} />
                Post Job
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full bg-white glass mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="jobs">Job Listings</TabsTrigger>
              <TabsTrigger value="candidates">Candidates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="animate-fade-in space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardDescription>Job Views</CardDescription>
                    <CardTitle className="text-2xl">
                      {analytics.jobViews.total}
                      <span className={`ml-2 text-sm font-normal ${analytics.jobViews.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {analytics.jobViews.change >= 0 ? '+' : ''}{analytics.jobViews.change}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 flex items-end space-x-1">
                      {analytics.jobViews.data.map((value, index) => (
                        <div
                          key={index}
                          className="bg-primary/60 hover:bg-primary transition-colors rounded-sm w-full"
                          style={{ height: `${value}%` }}
                        ></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardDescription>Applications</CardDescription>
                    <CardTitle className="text-2xl">
                      {analytics.applications.total}
                      <span className={`ml-2 text-sm font-normal ${analytics.applications.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {analytics.applications.change >= 0 ? '+' : ''}{analytics.applications.change}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 flex items-end space-x-1">
                      {analytics.applications.data.map((value, index) => (
                        <div
                          key={index}
                          className="bg-blue-400/60 hover:bg-blue-400 transition-colors rounded-sm w-full"
                          style={{ height: `${value * 5}%` }}
                        ></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardDescription>Interviews</CardDescription>
                    <CardTitle className="text-2xl">
                      {analytics.interviews.total}
                      <span className={`ml-2 text-sm font-normal ${analytics.interviews.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {analytics.interviews.change >= 0 ? '+' : ''}{analytics.interviews.change}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 flex items-end space-x-1">
                      {analytics.interviews.data.map((value, index) => (
                        <div
                          key={index}
                          className="bg-green-400/60 hover:bg-green-400 transition-colors rounded-sm w-full"
                          style={{ height: `${value * 25}%` }}
                        ></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardDescription>Conversion Rate</CardDescription>
                    <CardTitle className="text-2xl">
                      {analytics.conversionRate.value}
                      <span className={`ml-2 text-sm font-normal ${analytics.conversionRate.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {analytics.conversionRate.change >= 0 ? '+' : ''}{analytics.conversionRate.change}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-10 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                        style={{ width: analytics.conversionRate.value }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Recent Job Listings</h3>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading jobs...</p>
                      </div>
                    ) : error ? (
                      <div className="text-center py-4">
                        <p className="text-red-500">Error: {error}</p>
                      </div>
                    ) : postedJobs.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No jobs posted yet</p>
                      </div>
                    ) : (
                      postedJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="flex flex-col md:flex-row justify-between p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                          <div className="mb-4 md:mb-0">
                            <h4 className="font-medium mb-1">{job.title}</h4>
                            <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3">
                              <span>{job.location}</span>
                              <span>•</span>
                              <span>{job.job_type || 'Full-time'}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center">
                              <Users size={16} className="text-muted-foreground mr-1" />
                              <span className="text-sm">{job.applications_count || 0} applicants</span>
                            </div>
                            <Badge className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {job.status || 'Active'}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewApplicants(job.id, job.title)}
                            >
                              View Applicants
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="glass rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">
                      {selectedJob ? `Candidates for ${selectedJob.title}` : 'Recent Candidates'}
                    </h3>
                    {selectedJob && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary"
                        onClick={() => {
                          setSelectedJob(null);
                          setJobApplicants([]);
                        }}
                      >
                        Show All
                      </Button>
                    )}
                    {!selectedJob && (
                      <Button variant="ghost" size="sm" className="text-primary">
                        View All
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {selectedJob ? (
                      // Show applicants for selected job
                      loadingApplicants ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading applicants...</p>
                        </div>
                      ) : jobApplicants.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No applicants for this job yet</p>
                        </div>
                      ) : (
                        jobApplicants.slice(0, 3).map((application) => {
                          const applicant = application.applicant;
                          const applicantName = applicant?.full_name || applicant?.name || 'Unknown Applicant';
                          const initials = applicantName !== 'Unknown Applicant' 
                            ? applicantName.split(' ').map(n => n[0]).join('') 
                            : 'U';
                          
                          return (
                            <div key={application.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarImage src={applicant?.avatar_url} alt={applicantName} />
                                  <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{applicantName}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Applied on {new Date(application.created_at).toLocaleDateString()}
                                    {applicant?.email && (
                                      <span className="block text-xs text-muted-foreground">
                                        {applicant.email}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge className={
                                  application.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 
                                  application.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' : 
                                  application.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                  application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-amber-100 text-amber-800'
                                }>
                                  {application.status}
                                </Badge>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewProfile(application.applicant_id)}
                                  disabled={loadingResume}
                                >
                                  {loadingResume ? 'Loading...' : 'View Profile'}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : (
                      // Show default candidates
                      candidates.slice(0, 3).map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={candidate.avatar} alt={candidate.name} />
                              <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">Applied for {candidate.appliedFor}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={
                              candidate.status === 'New' ? 'bg-blue-100 text-blue-800' : 
                              candidate.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' : 
                              'bg-amber-100 text-amber-800'
                            }>
                              {candidate.status}
                            </Badge>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="jobs" className="animate-fade-in space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input placeholder="Search jobs..." className="pl-10" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    Active
                  </Button>
                  <Button variant="outline" size="sm">
                    Closed
                  </Button>
                  <Button size="sm" onClick={() => navigate('/post-job')}>
                    Post New Job
                  </Button>
                </div>
              </div>
              
              <div className="glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium">Job Title</th>
                        <th className="text-left p-4 font-medium">Location</th>
                        <th className="text-left p-4 font-medium">Type</th>
                        <th className="text-left p-4 font-medium">Date Posted</th>
                        <th className="text-left p-4 font-medium">Applicants</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-2">Loading jobs...</p>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan="7" className="text-center py-8">
                            <p className="text-red-500">Error: {error}</p>
                          </td>
                        </tr>
                      ) : postedJobs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-8">
                            <p className="text-muted-foreground">No jobs posted yet</p>
                          </td>
                        </tr>
                      ) : (
                        postedJobs.map((job) => (
                          <tr key={job.id} className="border-b hover:bg-secondary/10">
                            <td className="p-4">{job.title}</td>
                            <td className="p-4">{job.location}</td>
                            <td className="p-4">{job.job_type || 'Full-time'}</td>
                            <td className="p-4">
                              {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <Users size={16} className="mr-2 text-muted-foreground" />
                                {job.applications_count || 0}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {job.status || 'Active'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDropdownViewApplicants(job)}>
                                    View Applicants
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Edit Job</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500">
                                    {job.status === 'active' ? 'Close Job' : 'Delete Job'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="candidates" className="animate-fade-in space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input placeholder="Search candidates..." className="pl-10" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter size={16} className="mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    All Candidates
                  </Button>
                  <Button variant="outline" size="sm">
                    New
                  </Button>
                  <Button variant="outline" size="sm">
                    Shortlisted
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {selectedJob && jobApplicants.length > 0 ? (
                  // Show actual applicants from the database
                  jobApplicants.map((application) => {
                    const applicant = application.applicant;
                    const applicantName = applicant?.full_name || applicant?.name || 'Unknown Applicant';
                    const initials = applicantName !== 'Unknown Applicant' 
                      ? applicantName.split(' ').map(n => n[0]).join('') 
                      : 'U';
                    const applicantTitle = applicant?.title || 'Applicant';
                    const applicantLocation = applicant?.location || ' ';
                    
                    return (
                      <div key={application.id} className="glass rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                          <div className="flex items-start lg:items-center mb-4 lg:mb-0">
                            <Avatar className="h-12 w-12 mr-4">
                              <AvatarImage src={applicant?.avatar_url} alt={applicantName} />
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-lg">{applicantName}</h4>
                              <p className="text-muted-foreground">{applicantTitle}</p>
                              <div className="flex items-center mt-1 text-sm">
                                <Badge variant="outline" className="mr-2">
                                  Applied on {new Date(application.created_at).toLocaleDateString()}
                                </Badge>
                                <span>{applicantLocation}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge className={
                              application.status === 'Pending' ? 'bg-blue-100 text-blue-800' : 
                              application.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' : 
                              application.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                              application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-amber-100 text-amber-800'
                            }>
                              {application.status || 'Pending'}
                            </Badge>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        {applicant?.skills && applicant.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="text-sm font-medium mb-2">Skills</div>
                            <div className="flex flex-wrap gap-2">
                              {applicant.skills.map((skill, index) => (
                                <Badge key={index} variant="secondary" className="font-normal">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap justify-between items-center mt-4">
                          <div className="text-sm text-muted-foreground">
                            Applied for: <strong>{selectedJob.title}</strong>
                          </div>
                          
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <MessageCircle size={14} />
                              <span>Message</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => handleScheduleInterview(
                                applicantName, 
                                applicant?.email, 
                                selectedJob.title,
                                application.applicant_id
                              )}
                            >
                              <Calendar size={14} />
                              <span>Schedule Interview</span>
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleViewProfile(application.applicant_id)}
                              disabled={loadingResume}
                            >
                              {loadingResume ? 'Loading...' : 'View Profile'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : selectedJob && jobApplicants.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No applicants found for this job</p>
                  </div>
                ) : (
                  // Show default candidates when no job is selected
                  candidates.map((candidate) => (
                    <div key={candidate.id} className="glass rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                        <div className="flex items-start lg:items-center mb-4 lg:mb-0">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarImage src={candidate.avatar} alt={candidate.name} />
                            <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-lg flex items-center">
                              {candidate.name}
                              <div className="ml-2 flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={i < Math.floor(candidate.rating) ? "text-yellow-400 fill-yellow-400" : i < candidate.rating ? "text-yellow-400 fill-yellow-400 opacity-50" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                            </h4>
                            <p className="text-muted-foreground">{candidate.title}</p>
                            <div className="flex items-center mt-1 text-sm">
                              <Badge variant="outline" className="mr-2">
                                {candidate.experience} exp
                              </Badge>
                              <span>{candidate.location}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className={
                            candidate.status === 'New' ? 'bg-blue-100 text-blue-800' : 
                            candidate.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' : 
                            'bg-amber-100 text-amber-800'
                          }>
                            {candidate.status}
                          </Badge>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Clock size={14} className="mr-1" />
                            Applied {candidate.appliedDate}
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <div className="mb-4">
                        <div className="text-sm font-medium mb-2">Skills</div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <div className="font-medium mb-1">Applied For</div>
                          <div className="text-muted-foreground">{candidate.appliedFor}</div>
                        </div>
                        
                        <div>
                          <div className="font-medium mb-1">Education</div>
                          <div className="text-muted-foreground">{candidate.education}</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          <Eye size={14} className="inline mr-1" /> Resume viewed 2 days ago
                        </div>
                        
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            <span>Message</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleScheduleInterview(
                              candidate.name, 
                              '', 
                              candidate.appliedFor,
                              candidate.id
                            )}
                          >
                            <Calendar size={14} />
                            <span>Schedule Interview</span>
                          </Button>
                          <Button size="sm">View Profile</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Resume Popup */}
      {showPopup && selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {selectedResume.full_name || 'Resume'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPopup(false);
                    setSelectedResume(null);
                  }}
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact Information</h3>
                  <p><strong>Email:</strong> {selectedResume.email || 'Not provided'}</p>
                  <p><strong>Phone:</strong> {selectedResume.phone || 'Not provided'}</p>
                  <p><strong>Location:</strong> {selectedResume.location || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Professional Details</h3>
                  <p><strong>Title:</strong> {selectedResume.professional_title || 'Not provided'}</p>
                </div>
              </div>

              {/* Professional Summary */}
              {selectedResume.professional_summary && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Professional Summary</h3>
                  <p className="text-gray-700">{selectedResume.professional_summary}</p>
                </div>
              )}

              {/* Skills */}
              {selectedResume.skills && selectedResume.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {selectedResume.work_experience && selectedResume.work_experience.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Work Experience</h3>
                  <div className="space-y-4">
                    {selectedResume.work_experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium">{exp.role} at {exp.company}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exp.startDate} - {exp.endDate}
                        </p>
                        <p className="mt-1 text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedResume.education && selectedResume.education.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Education</h3>
                  <div className="space-y-4">
                    {selectedResume.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">
                          {edu.institution} • {edu.year}
                        </p>
                        <p className="mt-1 text-sm">{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPopup(false);
                    setSelectedResume(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleScheduleInterview(
                    selectedResume.full_name,
                    selectedResume.email,
                    selectedJob?.title || 'Position',
                    selectedResume.user_id
                  )}
                >
                  Schedule Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interview Scheduler Component */}
      // In the InterviewScheduler section of RecruiterDashboard:
{showInterviewModal && interviewDetails && (
  <InterviewScheduler
    applicantName={interviewDetails.applicantName}
    applicantEmail={interviewDetails.applicantEmail}
    jobTitle={interviewDetails.jobTitle}
    applicantId={interviewDetails.applicantId}
    jobId={selectedJob?.id} // This is automatically passed from the selected job
    meetLink={generatedMeetLink}
    onClose={() => setShowInterviewModal(false)}
    onConfirm={confirmInterview}
  />
)}
      
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;