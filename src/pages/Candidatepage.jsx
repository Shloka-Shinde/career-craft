const handleApply = async (jobId) => {
    try {
      // 1. Fetch job details
      const jobResponse = await axios.get(`http://localhost:5003/api/jobposts/${jobId}`);
      const jobData = jobResponse.data;
  
      // 2. Fetch user data (from your auth context)
      const user = getCurrentUser(); // Replace with your actual user fetching
      const userResume = await fetchLatestResume(); // Your existing function
  
      // 3. Prepare application data
      const applicationData = {
        jobId: jobData._id,
        jobTitle: jobData.title,
        company: jobData.company,
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.full_name || user.email.split('@')[0],
        resumeId: userResume?._id
      };
  
      // 4. Submit application
      const response = await axios.post(
        'http://localhost:5003/api/candidates',
        applicationData
      );
  
      if (response.status === 201) {
        alert(`Successfully applied for ${jobData.title}`);
        // Optionally refresh the UI
      }
    } catch (error) {
      console.error('Application error:', error);
      alert('Failed to submit application. Please try again.');
    }
  };