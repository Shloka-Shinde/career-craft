import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-3xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          <div className="relative flex-auto p-6">
            {children}
          </div>
          <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
          <button
  className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
  onClick={onClose}
>
  ×
</button>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </div>
  );
};

const SimCand = () => {
  const [candidates, setCandidates] = useState([]);
  const [myResume, setMyResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await fetch('http://localhost:5003/api/resumes');
        if (!response.ok) {
          throw new Error('Failed to fetch resume details');
        }
        const data = await response.json();
        
        // Separate my resume and other candidates
        const resumes = data.map(item => ({
          ...item.resume_data,
          _id: item._id
        }));
        const myResumeCopy = resumes.find(resume => resume.name === 'My Resume');
        const otherCandidates = resumes.filter(resume => resume.name !== 'My Resume');

        setMyResume(myResumeCopy);
        setCandidates(otherCandidates);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'CN';
  };

  const CandidatePlacard = ({ resume, onClick }) => {
    const primaryEducation = resume.education?.[0] || {};
    const primaryExperience = resume.experience?.[0] || {};

    return (
      <div 
        className="border rounded-lg p-4 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onClick(resume)}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-4">
            {getInitials(resume.personalInfo.fullName)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{resume.personalInfo.fullName}</h3>
            <p className="text-gray-600">{resume.personalInfo.title}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p>
            <strong>Institution:</strong> {primaryEducation.institution || 'N/A'}
          </p>
          <p>
            <strong>Location:</strong> {resume.personalInfo.location}
          </p>
          <p className="line-clamp-2">
            <strong>Summary:</strong> {resume.personalInfo.summary}
          </p>
          <p>
            <strong>Company:</strong> {primaryExperience.company || 'N/A'}
          </p>
        </div>
      </div>
    );
  };

  const handleCandidateSelect = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const handleCloseModal = () => {
    setSelectedCandidate(null);
  };

  if (loading) {
    return <div className="text-center mt-10">Loading similar candidates...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Similar Candidates</h1>
        
        {/* My Resume Section */}
        {myResume && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">My Resume</h2>
            <CandidatePlacard 
              resume={myResume} 
              onClick={handleCandidateSelect} 
            />
          </div>
        )}

        {/* Similar Candidates Section */}
        <h2 className="text-xl font-semibold mb-4">Other Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <CandidatePlacard 
              key={candidate._id} 
              resume={candidate} 
              onClick={handleCandidateSelect} 
            />
          ))}
        </div>

        {/* Candidate Details Modal */}
        <Modal 
          isOpen={!!selectedCandidate} 
          onClose={handleCloseModal}
        >
          {selectedCandidate && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-2">
                  <p><strong>Email:</strong> {selectedCandidate.personalInfo.email}</p>
                  <p><strong>Phone:</strong> {selectedCandidate.personalInfo.phone}</p>
                  <p><strong>Location:</strong> {selectedCandidate.personalInfo.location}</p>
                  <p><strong>Title:</strong> {selectedCandidate.personalInfo.title}</p>
                  <p><strong>Summary:</strong> {selectedCandidate.personalInfo.summary}</p>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">Skills</h3>
                <p>{selectedCandidate.skills.join(', ')}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Experience</h3>
                {selectedCandidate.experience.map((exp, index) => (
                  <div key={index} className="mb-4 pb-4 border-b">
                    <p><strong>{exp.company}</strong></p>
                    <p>{exp.role}</p>
                    <p>{exp.startDate} - {exp.endDate}</p>
                    <p>{exp.description}</p>
                  </div>
                ))}

                <h3 className="text-lg font-semibold mt-6 mb-4">Education</h3>
                {selectedCandidate.education.map((edu, index) => (
                  <div key={index} className="mb-4 pb-4 border-b">
                    <p><strong>{edu.institution}</strong></p>
                    <p>{edu.degree}</p>
                    <p>{edu.year}</p>
                    <p>{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default SimCand;