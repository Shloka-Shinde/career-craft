const JobDetailPlacard = ({ jobData, onClose }) => {
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleApply = async () => {
    if (!user || !user.token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for this job",
        variant: "destructive"
      });
      return;
    }

    setIsApplying(true);
    
    try {
      // Prepare headers with authorization
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`
      };

      // Fetch user data in parallel
      const [resumeResponse, profileResponse] = await Promise.all([
        fetch('http://localhost:5003/api/resumes/latest', { headers }),
        fetch('http://localhost:5003/api/profile', { headers })
      ]);

      // Handle failed responses
      if (!resumeResponse.ok) {
        throw new Error(resumeResponse.status === 401 
          ? "Session expired. Please log in again."
          : "Failed to fetch resume data");
      }

      if (!profileResponse.ok) {
        throw new Error(profileResponse.status === 401
          ? "Session expired. Please log in again."
          : "Failed to fetch profile data");
      }

      const [resumeData, profileData] = await Promise.all([
        resumeResponse.json(),
        profileResponse.json()
      ]);

      // Prepare application payload
      const applicationData = {
        job_id: jobData._id,
        job_title: jobData.title,
        company: jobData.company,
        applicant_id: user.id,
        applicant_email: user.email,
        applicant_name: profileData.fullName || user.name,
        resume_id: resumeData?._id,
        skills: resumeData?.skills || [],
        status: "Applied",
        applied_at: new Date().toISOString()
      };

      // Submit application
      const response = await fetch('http://localhost:5003/api/candidates', {
        method: 'POST',
        headers,
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Application failed');
      }

      toast({
        title: "Success!",
        description: `Application submitted for ${jobData.title}`,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Application Error",
        description: error.message,
        variant: "destructive"
      });
      
      // If unauthorized, suggest re-login
      if (error.message.includes("expired")) {
        // You might want to trigger logout here
      }
    } finally {
      setIsApplying(false);
    }
  };

  // ... rest of your component code ...
};
    
    try {
      // First fetch the user's live data (resume, profile, etc.)
      const [resumeResponse, profileResponse] = await Promise.all([
        fetch('http://localhost:5003/api/resumes/latest', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }),
        fetch('http://localhost:5003/api/profile', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        })
      ]);

      if (!resumeResponse.ok || !profileResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const [resumeData, profileData] = await Promise.all([
        resumeResponse.json(),
        profileResponse.json()
      ]);

      // Prepare the application data
      const applicationData = {
        job_id: jobData._id,
        job_title: jobData.title,
        company: jobData.company,
        applicant_id: user.id,
        applicant_email: user.email,
        applicant_name: profileData.fullName || `${user.firstName} ${user.lastName}`,
        resume_id: resumeData?._id,
        resume_data: resumeData?.content || null,
        skills: resumeData?.skills || profileData.skills || [],
        status: "Applied",
        applied_at: new Date().toISOString()
      };

      // Submit to candidates API
      const response = await fetch('http://localhost:5003/api/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      toast({
        title: "Application Submitted!",
        description: `You've successfully applied for ${jobData.title} at ${jobData.company}`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }


  if (!jobData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* ... (keep all your existing JSX for displaying job details) ... */}

        {/* Modified Apply Button */}
        <div className="flex space-x-4">
          <Button 
            className="flex items-center space-x-2"
            onClick={handleApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <MailOpen size={16} />
                <span>Apply Now</span>
              </>
            )}
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
