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

  // Resume Modal Component - Updated to show all resume details
const ResumeModal = () => (
    showResumeModal && latestResume && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-3/4 max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Resume Details</h2>
              <p className="text-gray-600">{latestResume.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Created: {new Date(latestResume.created_at).toLocaleString()}
              </p>
              <button
                onClick={() => setShowResumeModal(false)}
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
  
          <div className="space-y-6">
            {/* Personal Information Section */}
            {latestResume.resume_data?.personal_info && (
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Personal Information</h3>
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
  
            {/* Skills Section */}
            {latestResume.resume_data?.skills && (
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {latestResume.resume_data.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
  
            {/* Experience Section */}
            {latestResume.resume_data?.experience && (
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Work Experience</h3>
                <div className="space-y-4">
                  {latestResume.resume_data.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{exp.job_title || 'Untitled Position'}</h4>
                        <span className="text-sm text-gray-600">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-700">{exp.company}</p>
                      {exp.description && (
                        <p className="mt-2 text-gray-600">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Education Section */}
            {latestResume.resume_data?.education && (
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Education</h3>
                <div className="space-y-4">
                  {latestResume.resume_data.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{edu.degree || 'Degree'}</h4>
                        <span className="text-sm text-gray-600">
                          {edu.start_year} - {edu.end_year || 'Present'}
                        </span>
                      </div>
                      <p className="font-medium text-gray-700">{edu.institution}</p>
                      {edu.field_of_study && (
                        <p className="mt-1 text-gray-600">Field: {edu.field_of_study}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Projects Section */}
            {latestResume.resume_data?.projects && (
              <div className="border-b pb-4">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Projects</h3>
                <div className="space-y-4">
                  {latestResume.resume_data.projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold">{project.name || 'Project'}</h4>
                      {project.technologies && (
                        <div className="flex flex-wrap gap-2 my-2">
                          {project.technologies.map((tech, techIndex) => (
                            <span key={techIndex} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      {project.description && (
                        <p className="mt-1 text-gray-600">{project.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
  
            {/* Certifications Section */}
            {latestResume.resume_data?.certifications && (
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Certifications</h3>
                <div className="space-y-3">
                  {latestResume.resume_data.certifications.map((cert, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-1">
                        <h4 className="font-bold">{cert.name}</h4>
                        {cert.issuer && <p className="text-gray-700">{cert.issuer}</p>}
                        {cert.date && <p className="text-sm text-gray-500">Issued: {cert.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );

  // User Info Component
  const UserInfo = () => {
    if (authLoading) return <div className="text-right mb-4">Loading auth...</div>;
    
    return user ? (
      <div className="flex justify-between items-center mb-4 bg-gray-100 p-3 rounded-lg">
        <div>
          <p className="font-medium">Logged in as: {user.email}</p>
          <p className="text-sm text-gray-600">User ID: {user.id}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Sign Out
        </button>
      </div>
    ) : (
      <div className="text-right mb-4">
        <span className="text-gray-600">Not logged in</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <UserInfo />
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {user && (
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Your Resume Matches</h2>
              {latestResume ? (
                <p className="text-gray-600">
                  Showing matches for your most recent resume uploaded on {new Date(latestResume.created_at).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-yellow-600">No resumes found for your account ({user.email})</p>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
              <div 
                key={job.id} 
                className="border p-4 rounded-lg hover:shadow-md cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <h3 className="font-bold text-lg">{job.title}</h3>
                <p className="text-gray-600">{job.company}</p>
                {latestResume && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">
                      Match: {calculateSimilarity(job.skills, latestResume.resume_data?.skills).toFixed(0)}%
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${calculateSimilarity(job.skills, latestResume.resume_data?.skills)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      
      <ResumeModal />
    </div>
  );
};

export default LiveData;