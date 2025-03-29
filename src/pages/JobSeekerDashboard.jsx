import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, FileText, Clock, BookmarkPlus } from "lucide-react";
import { InterviewCalendar } from "@/components/InterviewCalendar";
import { ResumeBuilder } from "@/components/ResumeBuilder";
import { Link } from "react-router-dom";
const JobSeekerDashboard = () => {
  const { isAuthenticated, isLoading, user, isRecruiter } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not authenticated or if user is a recruiter
  if (!isLoading && (!isAuthenticated || isRecruiter)) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setLoadingData(true);
      try {
        // Fetch saved jobs
        const { data: savedJobsData, error: savedJobsError } = await supabase
          .from('saved_jobs')
          .select('*, job:jobs(*)')
          .eq('user_id', user.id);

        if (savedJobsError) throw savedJobsError;

        // Fetch applications
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*, job:jobs(*)')
          .eq('applicant_id', user.id);

        if (applicationsError) throw applicationsError;

        // Extract and set the data
        const savedJobsList = savedJobsData.map(item => item.job);
        setSavedJobs(savedJobsList);
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();

    // Set up realtime subscription for saved jobs and applications
    const savedJobsChannel = supabase
      .channel('saved_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_jobs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch saved jobs when changes occur
          fetchDashboardData();
        }
      )
      .subscribe();

    const applicationsChannel = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `applicant_id=eq.${user.id}`,
        },
        () => {
          // Refetch applications when changes occur
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(savedJobsChannel);
      supabase.removeChannel(applicationsChannel);
    };
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-primary/20"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Job Seeker Dashboard</h1>
            <p className="text-muted-foreground">Manage your job search and applications</p>
          </div>
          
          <Tabs defaultValue="applications" className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Applications</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <BookmarkPlus className="h-4 w-4" />
                <span>Saved Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="interviews" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Interviews</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Resume</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Your Applications</CardTitle>
                  <CardDescription>Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border rounded-md animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                          <div className="h-4 bg-muted rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="p-4 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{application.job?.title || 'Job Application'}</h3>
                              <p className="text-sm text-muted-foreground">{application.job?.company || 'Company'}</p>
                            </div>
                            <div className="flex items-center">
                              <span 
                                className={`px-2 py-1 text-xs rounded-full ${
                                  application.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                  application.status === 'Interviewing' ? 'bg-blue-100 text-blue-800' :
                                  application.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  application.status === 'Hired' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {application.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </div>

                          <div className="mt-3 flex justify-end">
                            <Button size="sm" variant="outline">View Details</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                      <p className="mt-1 text-muted-foreground">Start applying to jobs to see them here.</p>
                      <Button className="mt-4" size="sm" asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
                     
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="saved" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Jobs</CardTitle>
                  <CardDescription>Jobs you've bookmarked for later</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border rounded-md animate-pulse">
                          <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                          <div className="h-4 bg-muted rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : savedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {savedJobs.map((job) => (
                        <div key={job.id} className="p-4 border rounded-md">
                          <div>
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-muted-foreground">{job.company}</p>
                            <p className="text-sm">{job.location}</p>
                          </div>
                          
                          <div className="mt-3 flex justify-end space-x-2">
                            <Button size="sm" variant="outline">Remove</Button>
                            <Button size="sm">Apply Now</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <BookmarkPlus className="h-16 w-16 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">No saved jobs</h3>
                      <p className="mt-1 text-muted-foreground">Save jobs you're interested in to apply later.</p>
                      <Button className="mt-4" size="sm" asChild>
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interviews" className="space-y-4">
              <InterviewCalendar />
            </TabsContent>
            
            <TabsContent value="resume" className="space-y-4">
              <ResumeBuilder />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default JobSeekerDashboard;