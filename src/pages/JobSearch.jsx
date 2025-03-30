import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobCard from "@/components/JobCard";
import { Filter, Calendar, BarChart3, Briefcase, Clock } from "lucide-react";
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
import { useSmartSearch } from "@/hooks/useSmartSearch";
import { Loader2 } from "lucide-react";

const JobSearch = () => {
  const { toast } = useToast();
  const { expandSearchKeywords, isExpanding } = useSmartSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [salary, setSalary] = useState("");
  const [jobListings, setJobListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedKeywords, setRelatedKeywords] = useState([]);
  const [expandedKeywords, setExpandedKeywords] = useState([]);

  // Function to filter jobs client-side based on keywords
  const filterJobsByKeywords = (jobs, keywords) => {
    if (!keywords || keywords.length === 0) return jobs;
    
    return jobs.filter(job => {
      // Check if any keyword is in the title, description, or company
      return keywords.some(keyword => {
        const keywordLower = keyword.toLowerCase();
        const titleMatch = job.title?.toLowerCase().includes(keywordLower);
        const descMatch = job.description?.toLowerCase().includes(keywordLower);
        const companyMatch = job.company?.toLowerCase().includes(keywordLower);
        return titleMatch || descMatch || companyMatch;
      });
    });
  };

  const fetchJobs = async (keywords = []) => {
    try {
      setIsLoading(true);
      
      // Store expanded keywords for client-side filtering
      setExpandedKeywords([...keywords, searchTerm].filter(Boolean));
      
      // Base URL for the API
      const url = "http://localhost:5003/api/jobposts";
      
      // Make API request
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Get all jobs from the API
      let data = await response.json();
      
      // Filter jobs client-side based on all criteria
      const allKeywords = [...keywords, searchTerm].filter(Boolean);
      
      // Apply keyword filtering if keywords exist
      if (allKeywords.length > 0) {
        data = filterJobsByKeywords(data, allKeywords);
      }
      
      // Apply other filters
      if (location) {
        data = data.filter(job => 
          job.location?.toLowerCase().includes(location.toLowerCase())
        );
      }
      
      if (jobType) {
        data = data.filter(job => 
          job.job_type?.toLowerCase() === jobType.toLowerCase()
        );
      }
      
      // Add isNew flag for jobs posted in the last 2 days
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const jobsWithNewFlag = data.map(job => ({
        ...job,
        isNew: new Date(job.created_at) > twoDaysAgo
      }));
      
      setJobListings(jobsWithNewFlag);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch jobs. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchTerm) return;

    try {
      const keywords = await expandSearchKeywords(searchTerm);
      setRelatedKeywords(keywords);
      
      console.log('Searching with keywords:', [searchTerm, ...keywords]);
      
      await fetchJobs(keywords);

      if (keywords.length > 0) {
        toast({
          title: "Smart Search",
          description: `Expanded search to include related keywords: ${keywords.join(', ')}`,
        });
      }
    } catch (error) {
      console.error('Smart search error:', error);
      fetchJobs([searchTerm]); // At least search with the main term
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Set up polling for new jobs instead of real-time subscription
    const pollingInterval = setInterval(() => {
      fetchJobs(relatedKeywords);
    }, 60000); // Poll every minute
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, []);
  
  // No need for additional filtering since we're filtering in fetchJobs
  const filteredJobs = jobListings;
  
  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setJobType("");
    setDatePosted("");
    setExperienceLevel("");
    setSalary("");
    setRelatedKeywords([]);
    setExpandedKeywords([]);
    fetchJobs();
  };

  const handleSearch = () => {
    if (searchTerm) {
      handleSmartSearch();
    } else {
      fetchJobs();
    }
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
          
          <div className="bg-white shadow-sm rounded-xl p-4 glass mb-8 animate-fade-in">
            <form className="flex flex-col md:flex-row gap-3" onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}>
              <div className="flex-grow">
                <Input 
                  type="text" 
                  placeholder="Job title, keywords, or company" 
                  className="h-12"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-semibold">
                  {searchTerm}
                </span>
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
                            onClick={() => {
                              setJobType(jobType === type.toLowerCase() ? "" : type.toLowerCase());
                              setTimeout(() => fetchJobs(relatedKeywords), 0);
                            }}
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
                            onClick={() => {
                              setDatePosted(datePosted === date.toLowerCase() ? "" : date.toLowerCase());
                              setTimeout(() => fetchJobs(relatedKeywords), 0);
                            }}
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
                            onClick={() => {
                              setExperienceLevel(experienceLevel === exp.toLowerCase() ? "" : exp.toLowerCase());
                              setTimeout(() => fetchJobs(relatedKeywords), 0);
                            }}
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
                            onClick={() => {
                              setSalary(salary === sal.toLowerCase() ? "" : sal.toLowerCase());
                              setTimeout(() => fetchJobs(relatedKeywords), 0);
                            }}
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
            
            <div className="lg:w-3/4">
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
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
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl p-6 animate-pulse bg-white/80 border">
                      <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
                      <div className="h-4 bg-muted rounded w-1/3 mb-6"></div>
                      <div className="h-20 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job, index) => (
                      <div key={job.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                        <JobCard 
                          id={job.id}
                          title={job.title || "Untitled Job"}
                          company={job.company || "Unknown Company"}
                          location={job.location || "Remote"}
                          type={job.job_type || "Full-time"}
                          postedDate={new Date(job.created_at).toLocaleDateString()}
                          description={job.description || "No description provided"}
                          salary={job.salary_range || "Salary not specified"}
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
              )}
              
              {filteredJobs.length > 0 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline">Load More Jobs</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobSearch;