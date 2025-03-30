import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, Briefcase, Calendar, Clock, Eye, Filter, MessageCircle, Plus, Search, Star, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CandidateCard from "@/components/CandidateCard";

// Mock data for candidates (will be replaced with matched candidates)
const initialCandidates = [
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
    email: "emily.johnson@example.com",
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
    email: "michael.williams@example.com",
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
    email: "david.martinez@example.com",
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
    email: "sarah.thompson@example.com",
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
  const [jobListings, setJobListings] = useState([]);
  const [candidateMatches, setCandidateMatches] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  // New state for filters
  const [filters, setFilters] = useState({
    experienceLevel: [],
    status: [],
    skills: [],
    location: [],
    rating: null,
    educationLevel: []
  });

  // Available filter options
  const filterOptions = {
    experienceLevel: [
      { value: "entry", label: "Entry Level (0-2 years)" },
      { value: "mid", label: "Mid Level (3-5 years)" },
      { value: "senior", label: "Senior (6-10 years)" },
      { value: "executive", label: "Executive (10+ years)" }
    ],
    status: [
      { value: "New", label: "New" },
      { value: "Reviewed", label: "Reviewed" },
      { value: "Interview", label: "Interview" },
      { value: "Rejected", label: "Rejected" },
      { value: "Hired", label: "Hired" }
    ],
    educationLevel: [
      { value: "highschool", label: "High School" },
      { value: "bachelors", label: "Bachelor's Degree" },
      { value: "masters", label: "Master's Degree" },
      { value: "phd", label: "PhD" }
    ],
    rating: [
      { value: 4, label: "4+ Stars" },
      { value: 3, label: "3+ Stars" },
      { value: 2, label: "2+ Stars" }
    ]
  };

  // Extract unique skills and locations from candidates
  const allSkills = [...new Set(
    candidateMatches.flatMap(candidate => 
      Array.isArray(candidate.skills) ? candidate.skills : []
    )
  )].filter(Boolean);

  const allLocations = [...new Set(
    candidateMatches.map(candidate => candidate.location)
  )].filter(Boolean);

  // Filter candidates based on selected filters
  const filteredCandidates = candidateMatches.filter(candidate => {
    // Experience level filter
    if (filters.experienceLevel.length > 0) {
      const candidateExp = parseInt(candidate.experience) || 0;
      const matches = filters.experienceLevel.some(level => {
        switch(level) {
          case "entry": return candidateExp <= 2;
          case "mid": return candidateExp >= 3 && candidateExp <= 5;
          case "senior": return candidateExp >= 6 && candidateExp <= 10;
          case "executive": return candidateExp > 10;
          default: return true;
        }
      });
      if (!matches) return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(candidate.status)) {
      return false;
    }

    // Skills filter
    if (filters.skills.length > 0) {
      const candidateSkills = Array.isArray(candidate.skills) ? 
        candidate.skills.map(s => s.toLowerCase()) : [];
      const hasAllSkills = filters.skills.every(skill => 
        candidateSkills.includes(skill.toLowerCase())
      );
      if (!hasAllSkills) return false;
    }

    // Location filter
    if (filters.location.length > 0 && !filters.location.includes(candidate.location)) {
      return false;
    }

    // Rating filter
    if (filters.rating && candidate.rating < filters.rating) {
      return false;
    }

    // Education level filter
    if (filters.educationLevel.length > 0) {
      const candidateEducation = candidate.education.toLowerCase();
      const matches = filters.educationLevel.some(level => {
        switch(level) {
          case "highschool": 
            return candidateEducation.includes("high school") || 
                   candidateEducation.includes("diploma");
          case "bachelors": 
            return candidateEducation.includes("bachelor") || 
                   candidateEducation.includes("b.s") || 
                   candidateEducation.includes("ba") ||
                   candidateEducation.includes("undergraduate");
          case "masters": 
            return candidateEducation.includes("master") || 
                   candidateEducation.includes("m.s") || 
                   candidateEducation.includes("ma") ||
                   candidateEducation.includes("mba") ||
                   candidateEducation.includes("graduate");
          case "phd": 
            return candidateEducation.includes("phd") || 
                   candidateEducation.includes("doctorate");
          default: return true;
        }
      });
      if (!matches) return false;
    }

    return true;
  });

  // Toggle filter selection
  const toggleFilter = (filterType, value) => {
    setFilters(prev => {
      // For single-select filters (like rating)
      if (filterType === 'rating') {
        return { ...prev, rating: prev.rating === value ? null : value };
      }
      
      // For multi-select filters
      const currentValues = prev[filterType] || [];
      return {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      experienceLevel: [],
      status: [],
      skills: [],
      location: [],
      rating: null,
      educationLevel: []
    });
  };

  // Function to normalize skills
  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) {
      return skills.flatMap(skill => 
        typeof skill === 'string' 
          ? skill.split(',').map(s => s.trim().toLowerCase())
          : []
      );
    }
    
    if (typeof skills === 'string') {
      return skills.split(',').map(skill => skill.trim().toLowerCase());
    }
    
    return [];
  };

  // Function to calculate similarity score
  const calculateSimilarity = (jobSkills, resumeSkills) => {
    if (!jobSkills || !resumeSkills) return 0;

    const processedJobSkills = normalizeSkills(jobSkills);
    const processedResumeSkills = normalizeSkills(resumeSkills);

    const jobSet = new Set(processedJobSkills);
    const resumeSet = new Set(processedResumeSkills);

    const intersection = [...jobSet].filter((skill) => resumeSet.has(skill));
    
    return jobSet.size > 0 ? (intersection.length / jobSet.size) * 100 : 0;
  };

  // Function to find top matching candidates
  const findMatchingCandidates = (job) => {
    if (!job.skills || job.skills.length === 0 || !resumes || resumes.length === 0) {
      return [];
    }

    return resumes
      .map((resume) => {
        const resumeSkills = resume.resume_data?.skills || [];
        const similarity = calculateSimilarity(job.skills, resumeSkills);
        
        // Convert resume data to candidate format
        return {
          id: resume.id || `resume-${Math.random().toString(36).substr(2, 9)}`,
          name: resume.resume_data?.personalInfo?.fullName || "Unknown Candidate",
          title: resume.resume_data?.personalInfo?.title || "Candidate",
          location: resume.resume_data?.personalInfo?.location || "Unknown Location",
          appliedFor: job.title,
          appliedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: "New",
          skills: resumeSkills,
          experience: resume.resume_data?.experience?.[0]?.years || "Unknown",
          education: resume.resume_data?.education?.[0]?.degree || "Unknown Education",
          rating: (similarity / 20).toFixed(1) > 5 ? 5 : (similarity / 20).toFixed(1),
          avatar: "",
          similarity: similarity.toFixed(1),
          email: resume.resume_data?.personalInfo?.email || ""
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch both job listings and resumes
        const [jobResponse, resumeResponse] = await Promise.all([
          fetch('http://localhost:5003/api/jobposts'),
          fetch('http://localhost:5003/api/resumes')
        ]);

        if (!jobResponse.ok || !resumeResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const jobData = await jobResponse.json();
        const resumeData = await resumeResponse.json();

        setJobListings(jobData);
        setResumes(resumeData);
        
        // Select the first job by default to show matched candidates
        if (jobData.length > 0) {
          setSelectedJob(jobData[0]);
          const matches = findMatchingCandidates(jobData[0]);
          setCandidateMatches(matches.length > 0 ? matches : initialCandidates);
        } else {
          setCandidateMatches(initialCandidates);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setCandidateMatches(initialCandidates);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle job selection to update matched candidates
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    const matches = findMatchingCandidates(job);
    setCandidateMatches(matches.length > 0 ? matches : initialCandidates);
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
              
              <Link to="/job-post-form">
                <Button size="sm" className="flex items-center gap-2">
                  <Plus size={16} />
                  Post Job
                </Button>
              </Link>
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
                    {isLoading ? (
                      <div className="text-center text-muted-foreground">Loading job listings...</div>
                    ) : jobListings.slice(0, 3).map((job) => (
                      <div 
                        key={job.id} 
                        className={`flex flex-col md:flex-row justify-between p-4 border ${selectedJob && selectedJob.id === job.id ? 'border-primary bg-secondary/20' : 'border-border'} rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer`}
                        onClick={() => handleJobSelect(job)}
                      >
                        <div className="mb-4 md:mb-0">
                          <h4 className="font-medium mb-1">{job.title}</h4>
                          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-3">
                            <span>{job.location}</span>
                            <span>•</span>
                            <span>{job.type}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex items-center">
                            <Users size={16} className="text-muted-foreground mr-1" />
                            <span className="text-sm">{job.applicants} applicants</span>
                          </div>
                          <Badge className={job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {job.status}
                          </Badge>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="glass rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Recent Candidates</h3>
                    <Button variant="ghost" size="sm" className="text-primary">
                      View All
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="text-center text-muted-foreground">Loading candidates...</div>
                    ) : (
                      candidateMatches.slice(0, 3).map((candidate) => (
                        <div key={candidate.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/20 transition-colors">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={candidate.avatar} alt={candidate.name} />
                              <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{candidate.name}</h4>
                              <p className="text-sm text-muted-foreground">Applied for {candidate.appliedFor}</p>
                              {candidate.similarity && (
                                <p className="text-xs text-green-600 font-medium">{candidate.similarity}% match</p>
                              )}
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
                  <Button size="sm">
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
                      {isLoading ? (
                        <tr>
                          <td colSpan="7" className="text-center p-4 text-muted-foreground">
                            Loading job listings...
                          </td>
                        </tr>
                      ) : (
                        jobListings.map((job) => (
                          <tr key={job.id} 
                              className={`border-b hover:bg-secondary/10 ${selectedJob && selectedJob.id === job.id ? 'bg-secondary/20' : ''}`}
                              onClick={() => handleJobSelect(job)}
                              style={{ cursor: 'pointer' }}
                          >
                            <td className="p-4">{job.title}</td>
                            <td className="p-4">{job.location}</td>
                            <td className="p-4">{job.type}</td>
                            <td className="p-4">{job.datePosted}</td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <Users size={16} className="mr-2 text-muted-foreground" />
                                {job.applicants}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {job.status}
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
                                  <DropdownMenuItem>View Applicants</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Job</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500">
                                    {job.status === 'Active' ? 'Close Job' : 'Delete Job'}
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
                {isLoading ? (
                  <div className="text-center text-muted-foreground p-8">Loading candidates...</div>
                ) : (
                  filteredCandidates.map((candidate) => (
                    <CandidateCard key={candidate.id} candidate={candidate} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;