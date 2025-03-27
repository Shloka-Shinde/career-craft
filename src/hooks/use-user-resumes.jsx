import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUserResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch resumes
  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:5003/api/resumes');
      setResumes(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  // Create resume
  const createResume = async (resumeData) => {
    try {
      const response = await axios.post('http://localhost:5003/api/resumes', resumeData);
      setResumes(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to create resume:', err);
      throw err;
    }
  };

  // Update resume
  const updateResume = async (id, resumeData) => {
    try {
      const response = await axios.put(`http://localhost:5003/api/resumes/${id}`, resumeData);
      setResumes(prev => 
        prev.map(resume => resume._id === id ? response.data : resume)
      );
      return response.data;
    } catch (err) {
      console.error('Failed to update resume:', err);
      throw err;
    }
  };

  // Delete resume
  const deleteResume = async (id) => {
    try {
      await axios.delete(`http://localhost:5003/api/resumes/${id}`);
      setResumes(prev => prev.filter(resume => resume._id !== id));
    } catch (err) {
      console.error('Failed to delete resume:', err);
      throw err;
    }
  };

  // Fetch resumes on component mount
  useEffect(() => {
    fetchResumes();
  }, []);

  return {
    resumes,
    isLoading,
    error,
    createResume,
    updateResume,
    deleteResume,
    fetchResumes
  };
};