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

  // Fetch latest resume with auth
  const fetchLatestResume = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5003/api/resumes");
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
  }, []);

  // Fetch all data with error handling
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsResponse, resumesResponse] = await Promise.all([
          axios.get("http://localhost:5003/api/jobposts"),
          axios.get("http://localhost:5003/api/resumes")
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
  }, [fetchLatestResume]);

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

  // Resume Modal Component
  const ResumeModal = () => (
    showResumeModal && latestResume && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-3/4 max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Latest Resume</h2>
            <p className="text-sm text-gray-500">
              Created: {new Date(latestResume.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => setShowResumeModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <ResumeModal />
    </div>
  );
};

export default LiveData;