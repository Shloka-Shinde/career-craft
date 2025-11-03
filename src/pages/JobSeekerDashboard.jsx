import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, FileText, Clock, BookmarkPlus, Video, MapPin, Building } from "lucide-react";
import { InterviewCalendar } from "@/components/InterviewCalendar";
import { ResumeBuilder } from "@/components/ResumeBuilder";
import JobCard from "@/components/JobCard";
import JobPlacard from "@/components/JobPlacard";
import { Badge } from "@/components/ui/badge";

const JobSeekerDashboard = () => {
  const { isAuthenticated, isLoading, user, isRecruiter } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [dashboardTab, setDashboardTab] = useState("applications");
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPlacardOpen, setIsPlacardOpen] = useState(false);

  const handlePlacardApply = async () => {
    if (!selectedJob) return;

    const { error: deleteError } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', selectedJob.id);

    if (deleteError) {
      alert(`Error removing from saved jobs: ${deleteError.message}`);
    } else {
      const appliedJob = savedJobs.find(j => j.id === selectedJob.id);
      if (appliedJob) {
        setApplications(currentApplications => [...currentApplications, { job: appliedJob, ...selectedJob }]);
        setSavedJobs(currentSavedJobs => currentSavedJobs.filter(j => j.id !== selectedJob.id));
      }
    }

    setIsPlacardOpen(false);
  };

  // Fetch interviews for the current user
  const fetchInterviews = async () => {
    if (!user) return;
    
    setLoadingInterviews(true);
    try {
      const { data: interviewsData, error } = await supabase
        .from('interviews')
        .select(`
          *,
          jobs (
            title,
            company,
            location
          )
        `)
        .eq('applicant_id', user.id)
        .order('interview_date', { ascending: true })
        .order('interview_time', { ascending: true });
  
      if (error) {
        console.error('Error fetching interviews:', error);
        setInterviews([]);
      } else {
        console.log('Fetched interviews:', interviewsData);
        setInterviews(interviewsData || []);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setInterviews([]);
    } finally {
      setLoadingInterviews(false);
    }
  };

  useEffect(() => {
    if (!user) return;
  
    const fetchDashboardData = async () => {
      setLoadingData(true);
      try {
        // Fetch applications with jobs
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select('*')
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false });

        if (applicationsError) {
          console.error('Error fetching applications:', applicationsError);
          setApplications([]);
        } else {
          console.log('Applications:', applicationsData);

          if (applicationsData && applicationsData.length > 0) {
            const jobIds = applicationsData.map(app => app.job_id).filter(id => id);
            console.log('Job IDs to fetch:', jobIds);

            const { data: jobsData, error: jobsError } = await supabase
              .from('jobs')
              .select('*')
              .in('id', jobIds);

            if (jobsError) {
              console.error('Error fetching jobs:', jobsError);
              setApplications([]);
            } else {
              console.log('Fetched jobs:', jobsData);

              const applicationsWithJobs = applicationsData.map(application => {
                const job = jobsData.find(job => job.id === application.job_id);
                return {
                  ...application,
                  job: job || null
                };
              });

              console.log('Applications with jobs:', applicationsWithJobs);
              setApplications(applicationsWithJobs);
            }
          } else {
            setApplications([]);
          }
        }

        // Fetch saved jobs with job details
        const { data: savedJobsData, error: savedJobsError } = await supabase
          .from('saved_jobs')
          .select(`
            *,
            jobs (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (savedJobsError) {
          console.error('Error fetching saved jobs:', savedJobsError);
          setSavedJobs([]);
        } else {
          console.log('Saved jobs data:', savedJobsData);
          
          // Extract the job objects from the saved_jobs data
          const savedJobsList = savedJobsData
            .map(item => item.jobs)
            .filter(job => job !== null);
          
          console.log('Processed saved jobs:', savedJobsList);
          setSavedJobs(savedJobsList);
        }

        // Fetch interviews
        await fetchInterviews();
  
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setApplications([]);
        setSavedJobs([]);
        setInterviews([]);
      } finally {
        setLoadingData(false);
      }
    };
  
    fetchDashboardData();
  
    // Set up realtime subscriptions
    if (user) {
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
            fetchDashboardData();
          }
        )
        .subscribe();

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
            fetchDashboardData();
          }
        )
        .subscribe();

      const interviewsChannel = supabase
        .channel('interviews_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'interviews',
            filter: `applicant_id=eq.${user.id}`,
          },
          () => {
            fetchInterviews();
          }
        )
        .subscribe();
        
  
      return () => {
        supabase.removeChannel(applicationsChannel);
        supabase.removeChannel(savedJobsChannel);
        supabase.removeChannel(interviewsChannel);
      };
    }
  }, [user]);

  // Format interview date and time
  const formatInterviewDateTime = (interview) => {
    const date = new Date(interview.interview_date);
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `${formattedDate} at ${interview.interview_time}`;
  };

  // Check if interview is upcoming
  const isUpcomingInterview = (interview) => {
    const interviewDateTime = new Date(`${interview.interview_date}T${interview.interview_time}`);
    return interviewDateTime > new Date();
  };

  // Redirect if not authenticated or if user is a recruiter
  if (!isLoading && (!isAuthenticated || isRecruiter)) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto rounded-full bg-blue-200"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('Current user ID:', user.id);
  console.log('Applications data:', applications);
  console.log('Saved jobs data:', savedJobs);
  console.log('Interviews data:', interviews);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Job Seeker Dashboard</h1>
            <p className="text-slate-600">Manage your job search and applications</p>
          </div>
          
          <Tabs defaultValue="applications" className="space-y-8" value={dashboardTab} onValueChange={setDashboardTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
              <TabsTrigger value="applications" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                <Briefcase className="h-4 w-4" />
                <span>Applications</span>
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                <BookmarkPlus className="h-4 w-4" />
                <span>Saved Jobs</span>
              </TabsTrigger>
              <TabsTrigger value="interviews" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                <Calendar className="h-4 w-4" />
                <span>Interviews</span>
              </TabsTrigger>
              <TabsTrigger value="resume" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                <span>Resume</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications" className="space-y-4">
              <Card className="border-blue-200 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-b border-blue-200">
                  <CardTitle className="text-white">Your Applications</CardTitle>
                  <CardDescription className="text-blue-100">Track the status of your job applications</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
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
                  ) : applications.length === 0 ? (
                    <div className="text-center py-10">
                      <Briefcase className="h-16 w-16 mx-auto text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                      <p className="mt-1 text-muted-foreground">Start applying to jobs to see them here.</p>
                      <Button className="mt-4" size="sm" onClick={() => navigate('/jobs')}>Browse Jobs</Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {applications.map(application => (
                        application.job ? (
                          <JobCard
                            key={application.id}
                            id={application.job.id}
                            title={application.job.title}
                            company={application.job.company}
                            location={application.job.location}
                            type={application.job.job_type || application.job.type}
                            postedDate={new Date(application.job.created_at).toLocaleDateString()}
                            description={application.job.description}
                            salary={application.job.salary}
                            isNew={false}
                            actionButton={
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                                >
                                  {application.status || 'Applied'}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                  Applied on {new Date(application.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            }
                          />
                        ) : (
                          <div key={application.id} className="p-4 border rounded-md bg-muted/50">
                            <p className="text-muted-foreground">Application for job ID: {application.job_id}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                            >
                              {application.status || 'Applied'}
                            </Button>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="saved" className="space-y-4">
              <Card className="border-green-200 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-b border-green-200">
                  <CardTitle className="text-white">Saved Jobs</CardTitle>
                  <CardDescription className="text-green-100">Jobs you've bookmarked for later</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingData ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 border border-green-200 rounded-lg animate-pulse bg-green-50/50">
                          <div className="h-5 bg-green-200 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-green-200 rounded w-1/4 mb-4"></div>
                          <div className="h-4 bg-green-200 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : savedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {savedJobs.map((job) =>
                        job ? (
                          <JobCard
                            key={job.id}
                            id={job.id}
                            title={job.title}
                            company={job.company}
                            location={job.location}
                            type={job.job_type || job.type}
                            postedDate={new Date(job.created_at).toLocaleDateString()}
                            description={job.description}
                            salary={job.salary}
                            isNew={false}
                            onViewJob={() => {
                              setSelectedJob(job);
                              setIsPlacardOpen(true);
                            }}
                          />
                        ) : null
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4">
                        <BookmarkPlus className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-slate-700">No saved jobs</h3>
                      <p className="mt-1 text-slate-500">Save jobs you're interested in to apply later.</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" 
                        size="sm"
                        onClick={() => navigate('/jobs')}
                      >
                        Browse Jobs
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interviews" className="space-y-4">
              <div className="rounded-lg border border-purple-200 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white border-b border-purple-200 p-6">
                  <h2 className="text-xl font-semibold text-white">Interview Schedule</h2>
                  <p className="text-purple-100">Manage your upcoming interviews</p>
                </div>
                <div className="p-6">
                  {/* Upcoming Interviews List */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-slate-800">Upcoming Interviews</h3>
                    {loadingInterviews ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 border rounded-lg animate-pulse">
                            <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                            <div className="h-4 bg-muted rounded w-full"></div>
                          </div>
                        ))}
                      </div>
                    ) : interviews.filter(interview => isUpcomingInterview(interview)).length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/50">
                        <Calendar className="h-12 w-12 mx-auto text-purple-300 mb-4" />
                        <h4 className="text-lg font-medium text-slate-700 mb-2">No upcoming interviews</h4>
                        <p className="text-slate-500 mb-4">You don't have any scheduled interviews yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {interviews
                          .filter(interview => isUpcomingInterview(interview))
                          .map((interview) => (
                            <div key={interview.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Building className="h-5 w-5 text-purple-600" />
                                    <h4 className="font-semibold text-slate-800">
                                      {interview.jobs?.title || 'Interview'}
                                    </h4>
                                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                                      Upcoming
                                    </Badge>
                                  </div>
                                  <p className="text-slate-600 mb-1 flex items-center gap-2">
                                    <span className="font-medium">{interview.jobs?.company}</span>
                                    {interview.jobs?.location && (
                                      <>
                                        <span>•</span>
                                        <MapPin className="h-3 w-3" />
                                        <span>{interview.jobs.location}</span>
                                      </>
                                    )}
                                  </p>
                                  <p className="text-slate-500 text-sm flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {formatInterviewDateTime(interview)}
                                  </p>
                                  <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                                    <Clock className="h-3 w-3" />
                                    Duration: {interview.duration} minutes
                                  </p>
                                  <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
                                    <Video className="h-3 w-3" />
                                    Type: {interview.interview_type}
                                  </p>
                                  {interview.meet_link && (
                                    <div className="mt-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                        onClick={() => window.open(interview.meet_link, '_blank')}
                                      >
                                        Join Meeting
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {interview.additional_notes && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                                  <p className="text-sm text-slate-600">
                                    <span className="font-medium">Notes: </span>
                                    {interview.additional_notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Past Interviews */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-800">Past Interviews</h3>
                    {interviews.filter(interview => !isUpcomingInterview(interview)).length === 0 ? (
                      <div className="text-center py-4 text-slate-500">
                        No past interviews
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {interviews
                          .filter(interview => !isUpcomingInterview(interview))
                          .map((interview) => (
                            <div key={interview.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <Building className="h-4 w-4 text-slate-500" />
                                    <h4 className="font-medium text-slate-700">
                                      {interview.jobs?.title || 'Interview'}
                                    </h4>
                                    <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-300">
                                      Completed
                                    </Badge>
                                  </div>
                                  <p className="text-slate-500 text-sm">
                                    {interview.jobs?.company} • {formatInterviewDateTime(interview)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Interview Calendar Component */}
                  <div className="mt-8">
                    <InterviewCalendar interviews={interviews} />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="resume" className="space-y-4">
              <div className="rounded-lg border border-orange-200 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-b border-orange-200 p-6">
                  <h2 className="text-xl font-semibold text-white">Resume Builder</h2>
                  <p className="text-orange-100">Create and manage your professional resume</p>
                </div>
                <div className="p-6">
                  <ResumeBuilder onShowResumeTab={() => setDashboardTab("resume")} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />

      {isPlacardOpen && selectedJob && (
        <JobPlacard
          job={selectedJob}
          isOpen={isPlacardOpen}
          onClose={() => setIsPlacardOpen(false)}
          onApplied={handlePlacardApply}
        />
      )}
    </div>
  );
};

export default JobSeekerDashboard;