import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Mail } from "lucide-react";

const LiveData = () => {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [emailDetails, setEmailDetails] = useState({
    to: "",
    subject: "",
    body: ""
  });

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

  const calculateSimilarity = (jobSkills, resumeSkills) => {
    if (!jobSkills || !resumeSkills) return 0;

    const processedJobSkills = normalizeSkills(jobSkills);
    const processedResumeSkills = normalizeSkills(resumeSkills);

    const jobSet = new Set(processedJobSkills);
    const resumeSet = new Set(processedResumeSkills);

    const intersection = [...jobSet].filter((skill) => resumeSet.has(skill));
    
    return jobSet.size > 0 ? (intersection.length / jobSet.size) * 100 : 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobResponse, resumeResponse] = await Promise.all([
          axios.get("http://localhost:5003/api/jobposts"),
          axios.get("http://localhost:5003/api/resumes"),
        ]);

        setJobs(jobResponse.data);
        setResumes(resumeResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5003/api/send-email', {
        to: emailDetails.to,
        subject: emailDetails.subject,
        body: emailDetails.body
      }, {
        // Add timeout and error logging
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Full server response:', response);
      
      if (response.data.success) {
        alert('Email sent successfully!');
        setShowEmailModal(false);
      } else {
        throw new Error(response.data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Detailed Error Information:');
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error Response Data:', error.response.data);
        console.error('Error Status:', error.response.status);
        console.error('Error Headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('Error Setup:', error.message);
      }
  
      alert(`Failed to send email: ${error.message}`);
    }
  };

  const handleJobClick = (job) => {
    if (!job.skills || job.skills.length === 0) {
      alert("No skills specified for this job.");
      return;
    }

    const rankedResumes = resumes
      .map((resume) => {
        const resumeSkills = resume.resume_data.skills || [];
        const similarity = calculateSimilarity(job.skills, resumeSkills);
        return { 
          ...resume, 
          similarity,
          resumeSkills: resumeSkills 
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    const recipientEmail = rankedResumes[0]?.resume_data?.personalInfo?.email || '';
    
    setSelectedJob(job);
    setEmailDetails({
      to: recipientEmail,
      subject: `Job Application: ${job.title} at ${job.company}`,
      body: `I am interested in the ${job.title} position at ${job.company}.\n\nJob Description:\n${job.description}\n\nSkills Required: ${job.skills.join(', ')}`
    });
    setShowEmailModal(true);

    alert(
      rankedResumes.length > 0
        ? rankedResumes.map((r) => `${r.resume_data.personalInfo.fullName}: ${r.similarity.toFixed(2)}% match (Skills: ${r.resumeSkills})`).join("\n")
        : "No suitable resumes found."
    );
  };

  const categories = [...new Set(jobs.map((job) => job.category))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearchTerm =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? job.category === selectedCategory : true;
    return matchesSearchTerm && matchesCategory;
  });

  const JobCard = ({ job }) => (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 cursor-pointer"
      onClick={() => handleJobClick(job)}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <span className="text-sm text-gray-500">{job.category}</span>
      </div>
      <div className="text-sm text-gray-600">{job.company}</div>
      <p className="text-sm text-gray-500 line-clamp-3">{job.description}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {job.skills && job.skills.map((skill, index) => (
          <span 
            key={index} 
            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );

  const EmailModal = () => {
    if (!showEmailModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Send Job Application Email</h2>
          <form onSubmit={handleSendEmail}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={emailDetails.to}
                onChange={(e) => setEmailDetails({...emailDetails, to: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter recipient email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={emailDetails.subject}
                onChange={(e) => setEmailDetails({...emailDetails, subject: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Body
              </label>
              <textarea
                value={emailDetails.body}
                onChange={(e) => setEmailDetails({...emailDetails, body: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md h-32"
                required
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Send Email
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center space-x-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md"
          />
          <Search className="absolute left-3 top-3 text-gray-400" />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">No jobs found</div>
      )}

      <EmailModal />
    </div>
  );
};

export default LiveData;