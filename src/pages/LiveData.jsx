import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';

const LiveData = () => {
  // State variables
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Jobs based on Category
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const url = selectedCategory 
          ? `http://localhost:5000/api/jobs?category=${encodeURIComponent(selectedCategory)}` 
          : 'http://localhost:5003/api/jobposts';
        
        const response = await axios.get(url);
        setJobs(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs', error);
        setLoading(false);
      }
    };
    fetchJobs();
  }, [selectedCategory]);

  // Filter Jobs
  const filteredJobs = jobs.filter(job => 
    (searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Job Card Component
  const JobCard = ({ job }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 space-y-3">
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-1">{job.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{job.company}</p>
        <p className="text-xs text-gray-600 line-clamp-2">{job.description}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px]">
            {job.location}
          </span>
          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px]">
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-medium text-gray-700">
          ${job.salary ? job.salary.toLocaleString() : 'Not specified'}
        </span>
        <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full text-[10px]">
          {job.Category}
        </span>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>

      {/* Filters and Search */}
      <div className="mb-6 flex space-x-4">
        {/* Category Selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Job Listings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedCategory ? `${selectedCategory} Jobs` : 'All Jobs'} 
          <span className="ml-2 text-gray-500 text-sm">({filteredJobs.length} results)</span>
        </h2>

        {loading ? (
          <p>Loading jobs...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <p className="text-center text-gray-500">No jobs found.</p>
        )}
      </div>
    </div>
  );
};

export default LiveData;