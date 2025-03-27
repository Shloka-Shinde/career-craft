import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResumeList = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch resumes when the component loads
  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5003/api/resumes'); // Adjust endpoint for resumes
        console.log(response.data);  // Log fetched data to verify the structure
        setResumes(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resumes', error);
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  // Resume Card Component
  const ResumeCard = ({ resume }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">{resume.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{resume.resume_data.personalInfo.fullName}</p>
        <p className="text-xs text-gray-600 line-clamp-2">{resume.resume_data.personalInfo.summary}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px]">
            {resume.resume_data.personalInfo.location}
          </span>
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px]">
            {new Date(resume.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-medium text-gray-700">
          {resume.resume_data.skills.join(', ')}
        </span>
        <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full text-[10px]">
          {resume.resume_data.personalInfo.title}
        </span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Resume Listings</h1>

      {/* Resume Listings */}
      <div>
        {loading ? (
          <p>Loading resumes...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {resumes.map((resume) => (
              <ResumeCard key={resume._id} resume={resume} />
            ))}
          </div>
        )}

        {!loading && resumes.length === 0 && (
          <p className="text-center text-gray-500">No resumes found.</p>
        )}
      </div>
    </div>
  );
};

export default ResumeList;