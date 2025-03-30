import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../SupabaseClient';

const LiveData = () => {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('match'); // 'match', 'title', 'company'

  // Initialize axios interceptors
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      async (config) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // Check auth state and setup listener
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Normalize skills function
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

  // Calculate similarity
  const calculateSimilarity = (jobSkills, resumeSkills) => {
    if (!jobSkills || !resumeSkills) return 0;
    const processedJobSkills = normalizeSkills(jobSkills);
    const processedResumeSkills = normalizeSkills(resumeSkills);
    const jobSet = new Set(processedJobSkills);
    const resumeSet = new Set(processedResumeSkills);
    const intersection = [...jobSet].filter(skill => resumeSet.has(skill));
    return jobSet.size > 0 ? (intersection.length / jobSet.size) * 100 : 0;
  };

  // Fetch latest resume with auth - updated to filter by user email
  const fetchLatestResume = useCallback(async () => {
    if (!user?.email) return null;
    
    try {
      const response = await axios.get(`http://localhost:5003/api/resumes?email=${encodeURIComponent(user.email)}`);
      if (response.data.length === 0) {
        setLatestResume(null);
        return null;
      }
      
      const mostRecent = response.data.reduce((latest, current) => 
        new Date(current.created_at) > new Date(latest.created_at) ? current : latest,
        response.data[0]
      );
      
      setLatestResume(mostRecent);
      return mostRecent;
    } catch (error) {
      console.error('Fetch resume error:', error);
      if (error.response?.status === 401) {
        await supabase.auth.signOut();
      }
      return null;
    }
  }, [user?.email]);

  // Fetch all data with error handling - updated to filter resumes by user email
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      
      setLoading(true);
      try {
        const [jobsResponse, resumesResponse] = await Promise.all([
          axios.get("http://localhost:5003/api/jobposts"),
          axios.get(`http://localhost:5003/api/resumes?email=${encodeURIComponent(user.email)}`)
        ]);

        setJobs(jobsResponse.data);
        setResumes(resumesResponse.data);
        
        if (resumesResponse.data.length > 0) {
          const mostRecent = resumesResponse.data.reduce((latest, current) => 
            new Date(current.created_at) > new Date(latest.created_at) ? current : latest,
            resumesResponse.data[0]
          );
          setLatestResume(mostRecent);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
        if (error.response?.status === 401) {
          await supabase.auth.signOut();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchLatestResume, 30000);
    return () => clearInterval(interval);
  }, [fetchLatestResume, user?.email]);

  // Handle job click
  const handleJobClick = async (job) => {
    const latest = await fetchLatestResume();
    if (!job.skills?.length) {
      alert("No skills specified for this job.");
      return;
    }
    setSelectedJob(job);
    setShowResumeModal(true);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = jobs
    .filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.skills && job.skills.some(skill => 
        typeof skill === 'string' && skill.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    )
    .sort((a, b) => {
      if (sortBy === 'match' && latestResume) {
        const matchA = calculateSimilarity(a.skills, latestResume.resume_data?.skills);
        const matchB = calculateSimilarity(b.skills, latestResume.resume_data?.skills);
        return matchB - matchA;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });

  // Resume Modal Component - Improved UI with tabs
  const ResumeModal = () => {
    const [activeTab, setActiveTab] = useState('overview');
    
    if (!showResumeModal || !latestResume) return null;
    
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'experience', label: 'Experience' },
      { id: 'education', label: 'Education' },
      { id: 'skills', label: 'Skills' },
      { id: 'projects', label: 'Projects' },
      { id: 'certifications', label: 'Certifications' }
    ];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-lg w-3/4 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-2xl font-bold">Your Resume Profile</h2>
              <p className="text-gray-600">{latestResume.email}</p>
            </div>
            <button
              onClick={() => setShowResumeModal(false)}
              className="text-gray-500 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="border-b px-6 overflow-x-auto">
            <div className="flex space-x-4">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`py-3 px-1 font-medium border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-grow">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {latestResume.resume_data?.personal_info && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 text-blue-700">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(latestResume.resume_data.personal_info).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-medium w-32 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span>{value || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-sm text-gray-500 text-right">
                  Created: {new Date(latestResume.created_at).toLocaleString()}
                </div>
              </div>
            )}
            
            {activeTab === 'skills' && latestResume.resume_data?.skills && (
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Skills</h3>
                <div className="flex flex-wrap gap-2 mt-4">
                  {latestResume.resume_data.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                
                {selectedJob && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-xl font-semibold mb-3 text-blue-700">Skills Match Analysis</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Match with "{selectedJob.title}"</span>
                        <span className="font-bold text-lg">
                          {calculateSimilarity(selectedJob.skills, latestResume.resume_data?.skills).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ width: `${calculateSimilarity(selectedJob.skills, latestResume.resume_data?.skills)}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Job Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.skills.map((skill, index) => (
                              <span 
                                key={index} 
                                className={`px-3 py-1 rounded-full text-sm ${
                                  latestResume.resume_data?.skills.some(s => 
                                    s.toLowerCase() === skill.toLowerCase()
                                  )
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Your Additional Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {latestResume.resume_data?.skills
                              .filter(skill => 
                                !selectedJob.skills.some(s => 
                                  s.toLowerCase() === skill.toLowerCase()
                                )
                              )
                              .map((skill, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'experience' && latestResume.resume_data?.experience && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Work Experience</h3>
                <div className="space-y-6">
                  {latestResume.resume_data.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <h4 className="font-bold text-lg">{exp.job_title || 'Untitled Position'}</h4>
                        <span className="text-sm text-gray-600 md:text-right">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-700 mb-2">{exp.company}</p>
                      {exp.description && (
                        <p className="text-gray-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'education' && latestResume.resume_data?.education && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Education</h3>
                <div className="space-y-6">
                  {latestResume.resume_data.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                      <div className="flex flex-col md:flex-row justify-between mb-2">
                        <h4 className="font-bold text-lg">{edu.degree || 'Degree'}</h4>
                        <span className="text-sm text-gray-600 md:text-right">
                          {edu.start_year} - {edu.end_year || 'Present'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-700 mb-2">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="text-gray-600">Field: {edu.field_of_study}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'projects' && latestResume.resume_data?.projects && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Projects</h3>
                <div className="space-y-6">
                  {latestResume.resume_data.projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-bold text-lg mb-2">{project.name || 'Project'}</h4>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-2 my-3">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.description && (
                        <p className="text-gray-600 mt-2">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'certifications' && latestResume.resume_data?.certifications && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-700">Certifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestResume.resume_data.certifications.map((cert, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-bold mb-1">{cert.name}</h4>
                      {cert.issuer && <p className="text-gray-700">{cert.issuer}</p>}
                      {cert.date && <p className="text-sm text-gray-500 mt-2">Issued: {cert.date}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Header Component with search and user info
  const Header = () => {
    if (authLoading) return <div className="w-full h-12 bg-gray-200 animate-pulse rounded mb-4"></div>;
    
    return (
      <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Job Match Dashboard</h1>
            {user && <p className="text-gray-600">Welcome back, {user.email}</p>}
          </div>
          
          {user && (
            <div className="flex items-center space-x-2">
              <span className="hidden md:inline text-gray-600">
                {latestResume ? (
                  <span>Last update: {new Date(latestResume.created_at).toLocaleDateString()}</span>
                ) : (
                  <span className="text-yellow-600">No resume found</span>
                )}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Job card component
  const JobCard = ({ job }) => {
    const matchPercentage = latestResume ? 
      calculateSimilarity(job.skills, latestResume.resume_data?.skills) : 0;
    
    let matchColor = 'bg-gray-600';
    if (matchPercentage >= 80) matchColor = 'bg-green-600';
    else if (matchPercentage >= 60) matchColor = 'bg-blue-600';
    else if (matchPercentage >= 40) matchColor = 'bg-yellow-500';
    else if (matchPercentage > 0) matchColor = 'bg-orange-500';
    
    return (
      <div 
        className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col"
        onClick={() => handleJobClick(job)}
      >
        <div className="p-5 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{job.title}</h3>
            {latestResume && (
              <span className={`px-2 py-1 text-white text-xs font-bold rounded-full ${matchColor}`}>
                {matchPercentage.toFixed(0)}%
              </span>
            )}
          </div>
          <p className="text-gray-700 font-medium mb-3">{job.company}</p>
          
          {job.skills && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {job.skills.slice(0, 5).map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {latestResume && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`${matchColor} h-1.5 rounded-full`} 
                style={{ width: `${matchPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Click to view detailed match analysis
            </div>
          </div>
        )}
      </div>
    );
  };

  // Filter and sort controls
  const FilterControls = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row gap-4">
      <div className="flex-grow">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by title, company, or skill..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 w-full md:w-48">
        <select
          className="w-full px-4 py-2 border rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="match">Sort by Match %</option>
          <option value="title">Sort by Title</option>
          <option value="company">Sort by Company</option>
        </select>
      </div>
    </div>
  );

  // No data or empty states
  const EmptyState = ({ type }) => {
    if (type === 'noUser') {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-4">Please sign in to view your job matches</p>
        </div>
      );
    }
    
    if (type === 'noResume') {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Resume Found</h3>
          <p className="text-gray-600 mb-4">Please upload your resume to see job matches</p>
        </div>
      );
    }
    
    if (type === 'noJobs') {
      return (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Jobs Found</h3>
          <p className="text-gray-600">No jobs match your current search criteria</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Header />
        
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white h-32 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {!user ? (
              <EmptyState type="noUser" />
            ) : !latestResume ? (
              <EmptyState type="noResume" />
            ) : (
              <>
                <FilterControls />
                
                {filteredAndSortedJobs.length === 0 ? (
                  <EmptyState type="noJobs" />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedJobs.map(job => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        <ResumeModal />
      </div>
    </div>
  );
};

export default LiveData;