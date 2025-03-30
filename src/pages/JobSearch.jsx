import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { X, Search, MapPin, Filter, Calendar, BarChart3, Briefcase, Clock, MailOpen, DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import axios from "axios";

// Job Detail Placard Component
const JobDetailPlacard = ({ jobData, onClose }) => {
  if (!jobData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        {/* Job Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{jobData.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-2">
              <Briefcase size={16} />
              <span>{jobData.company}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>{jobData.location || 'Remote'}</span>
            </div>
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded">
            <Briefcase size={20} className="text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Job Type</div>
              <div className="font-semibold">{jobData.category}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded">
            <DollarSign size={20} className="text-green-500" />
            <div>
              <div className="text-sm text-gray-500">Salary</div>
              <div className="font-semibold">{jobData.salary ? `$${jobData.salary}` : 'Competitive'}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded">
            <Calendar size={20} className="text-purple-500" />
            <div>
              <div className="text-sm text-gray-500">Posted</div>
              <div className="font-semibold">
                {jobData.createdAt 
                  ? new Date(jobData.createdAt).toLocaleDateString() 
                  : 'Recently'}
              </div>
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Job Description</h2>
          <p className="text-gray-700 leading-relaxed">{jobData.description}</p>
        </div>

        {/* Skills */}
        {jobData.skills && jobData.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {jobData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact Information */}
        {jobData.contactEmail && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
            <p className="text-gray-700">{jobData.contactEmail}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button 
            className="flex items-center space-x-2"
            onClick={() => alert('Job Applied!')}
          >
            <MailOpen size={16} />
            <span>Apply Now</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => alert('Saved to favorites!')}
          >
            Save Job
          </Button>
        </div>
      </div>
    </div>
  );
};

const JobSearch = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salary, setSalary] = useState("");
  const [isExpanding, setIsExpanding] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [relatedKeywords, setRelatedKeywords] = useState([]);
  
  // Fetch all jobs initially
  useEffect(() => {
    fetchJobs();
  }, []);
  
  // Fetch jobs from MongoDB
  const fetchJobs = async (smartSearchResults = null) => {
    setLoading(true);
    try {
      // If we have smart search results, use those
      if (smartSearchResults) {
        setJobs(smartSearchResults);
        setLoading(false);
        return;
      }
      
      // Otherwise fetch all jobs
      const response = await axios.get('http://localhost:5003/api/jobposts');
      
      // Add isNew flag for jobs created in the last 48 hours
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const jobsWithNewFlag = response.data.map(job => ({
        ...job,
        isNew: new Date(job.createdAt) > twoDaysAgo
      }));
      
      setJobs(jobsWithNewFlag);
    } catch (error) {
      console.error("Error fetching jobs", error);
      toast({
        title: "Error",
        description: "Failed to fetch job listings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Smart Search using Gemini API
  const handleSmartSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a search term",
        description: "Enter job titles, skills, or keywords to find relevant positions",
        variant: "default"
      });
      return;
    }
    
    setIsExpanding(true);
    setRelatedKeywords([]);
    
    try {
      // First call Gemini API to expand search keywords
      const expandResponse = await axios.post('/api/gemini/expand-search', {
        query: searchTerm
      });
      
      const expandedKeywords = expandResponse.data.keywords || [];
      setRelatedKeywords(expandedKeywords);
      
      // Then search jobs with expanded keywords
      const searchResponse = await axios.post('/api/jobs/smart-search', {
        query: searchTerm,
        expandedKeywords,
        location,
        jobType,
        experienceLevel,
        datePosted,
        salary
      });
      
      const smartSearchResults = searchResponse.data;
      
      // Update jobs with the smart search results
      setJobs(smartSearchResults);
      
      if (expandedKeywords.length > 0) {
        toast({
          title: "Smart Search",
          description: `Found ${smartSearchResults.length} jobs using smart search with related keywords`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Smart search error", error);
      toast({
        title: "Smart Search Failed",
        description: "Failed to perform smart search. Reverting to regular search.",
        variant: "destructive"
      });
      
      // Fall back to regular search if smart search fails
      fetchJobs();
    } finally {
      setIsExpanding(false);
    }
  };
  
  // Filter jobs based on criteria
  const filteredJobs = jobs.filter((job) => {
    const matchesLocation = 
      !location || 
      (job.location && job.location.toLowerCase().includes(location.toLowerCase()));
      
    const matchesJobType = 
      !jobType || 
      (job.category && job.category.toLowerCase() === jobType.toLowerCase());
      
    return matchesLocation && matchesJobType;
  });
  
  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setJobType("");
    setDatePosted("");
    setExperienceLevel("");
    setSalary("");
    setRelatedKeywords([]);
    fetchJobs();
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Find Your Perfect Job</h1>
            <p className="text-muted-foreground">Browse through thousands of job listings and find your next opportunity</p>
          </div>
          
          {/* Search Bar */}
          <div className="bg-white shadow-sm rounded-xl p-4 glass mb-8 animate-fade-in">
            <form className="flex flex-col md:flex-row gap-3" onSubmit={handleSmartSearch}>
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    type="text" 
                    placeholder="Job title, keywords, or company" 
                    className="pl-10 h-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:w-1/3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    type="text" 
                    placeholder="Location" 
                    className="pl-10 h-12"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="h-12 px-6"
                disabled={isExpanding}
              >
                {isExpanding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Expanding Search...
                  </>
                ) : (
                  "Smart Search"
                )}
              </Button>
            </form>
            
            {relatedKeywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Related Keywords:</span>
                {relatedKeywords.map((keyword) => (
                  <span 
                    key={keyword} 
                    className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-xl shadow-sm glass p-6 animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Filter size={18} className="mr-2" /> Filters
                  </h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Clear all
                  </Button>
                </div>
                
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="job-type" className="border-b-0">
                    <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                      <div className="flex items-center">
                        <Briefcase size={16} className="mr-2" /> Job Type
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map((type) => (
                          <div 
                            key={type} 
                            className={`flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                              jobType === type.toLowerCase() ? "bg-primary/10 text-primary" : "hover:bg-accent"
                            }`}
                            onClick={() => setJobType(type.toLowerCase())}
                          >
                            <span className="text-sm">{type}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="date-posted" className="border-b-0">
                    <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2" /> Date Posted
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {["Last 24 hours", "Last week", "Last 2 weeks", "Last month"].map((date) => (
                          <div 
                            key={date} 
                            className={`flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                              datePosted === date.toLowerCase() ? "bg-primary/10 text-primary" : "hover:bg-accent"
                            }`}
                            onClick={() => setDatePosted(date.toLowerCase())}
                          >
                            <span className="text-sm">{date}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="experience" className="border-b-0">
                    <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" /> Experience Level
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {["Entry level", "Mid level", "Senior level", "Executive"].map((exp) => (
                          <div 
                            key={exp} 
                            className={`flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                              experienceLevel === exp.toLowerCase() ? "bg-primary/10 text-primary" : "hover:bg-accent"
                            }`}
                            onClick={() => setExperienceLevel(exp.toLowerCase())}
                          >
                            <span className="text-sm">{exp}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="salary" className="border-b-0">
                    <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                      <div className="flex items-center">
                        <BarChart3 size={16} className="mr-2" /> Salary Range
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {["$0 - $50K", "$50K - $100K", "$100K - $150K", "$150K+"].map((sal) => (
                          <div 
                            key={sal} 
                            className={`flex items-center space-x-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
                              salary === sal.toLowerCase() ? "bg-primary/10 text-primary" : "hover:bg-accent"
                            }`}
                            onClick={() => setSalary(sal.toLowerCase())}
                          >
                            <span className="text-sm">{sal}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            
            {/* Job Listings */}
            <div className="lg:w-3/4">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    {loading ? "Loading..." : `${filteredJobs.length} job${filteredJobs.length !== 1 ? "s" : ""} found`}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && (
                      <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground">
                        Search: {searchTerm}
                      </Badge>
                    )}
                    {location && (
                      <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground">
                        Location: {location}
                      </Badge>
                    )}
                    {jobType && (
                      <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground">
                        Type: {jobType}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                  <Select>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Sort by: Relevance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Sort by: Relevance</SelectItem>
                      <SelectItem value="date">Sort by: Date</SelectItem>
                      <SelectItem value="salary-high">Sort by: Salary (High to Low)</SelectItem>
                      <SelectItem value="salary-low">Sort by: Salary (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  // Loading skeleton
                  [1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl p-6 animate-pulse bg-white/80 border">
                      <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-muted rounded w-1/3 mb-6"></div>
                      <div className="h-20 bg-muted rounded w-full"></div>
                    </div>
                  ))
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job, index) => (
                    <div 
                      key={job._id} 
                      className="animate-slide-up cursor-pointer" 
                      style={{ animationDelay: `${index * 0.05}s` }}
                      onClick={() => handleJobClick(job)}
                    >
                      <JobCard 
                        id={job._id}
                        title={job.title}
                        company={job.company}
                        location={job.location || "Remote"}
                        type={job.category}
                        postedDate={job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}
                        description={job.description}
                        salary={job.salary ? `$${job.salary}` : "Competitive"}
                        isNew={job.isNew}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No jobs match your search criteria. Try adjusting your filters.</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
              
              {!loading && filteredJobs.length > 10 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline">Load More Jobs</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Job Detail Placard */}
      {selectedJob && (
        <JobDetailPlacard 
          jobData={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
      
      <Footer />
    </div>
  );
};

export default JobSearch;