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
      console.log("Fetching resumes...");
      const response = await axios.get('http://localhost:5003/api/resumes');
      console.log("Fetched resumes:", response.data);
      setResumes(response.data);
    } catch (err) {
      console.error('Failed to fetch resumes:', err.response?.data || err.message);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new resume
  const createResume = async (resumeData) => {
    try {
      console.log("Creating resume:", resumeData);
      const response = await axios.post('http://localhost:5003/api/resumes', resumeData);
      console.log("Resume created:", response.data);
      setResumes(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Failed to create resume:', err.response?.data || err.message);
      throw err;
    }
  };

  // Update an existing resume
  const updateResume = async (id, resumeData) => {
    try {
      console.log(`Updating resume (ID: ${id}):`, resumeData);
      const response = await axios.put(`http://localhost:5003/api/resumes/${id}`, resumeData);
      console.log("Resume updated:", response.data);
      setResumes(prev => prev.map(resume => (resume._id === id ? response.data : resume)));
      return response.data;
    } catch (err) {
      console.error(`Failed to update resume (ID: ${id}):`, err.response?.data || err.message);
      throw err;
    }
  };

  // Delete a resume
  const deleteResume = async (id) => {
    try {
      if (!id) throw new Error("Invalid resume ID");
      console.log("Deleting resume with ID:", id);
      
      const response = await axios.delete(`http://localhost:5003/api/resumes/${id}`);
      console.log("Resume deleted successfully:", response.data);

      setResumes(prev => prev.filter(resume => resume._id !== id));
    } catch (err) {
      console.error(`Failed to delete resume (ID: ${id}):`, err.response?.data || err.message);
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