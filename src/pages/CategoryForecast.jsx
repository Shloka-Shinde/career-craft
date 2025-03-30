import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import axios from 'axios';
import { Search, Briefcase, Building, MapPin, Calendar, Clock } from 'lucide-react';

// Register ChartJS components
ChartJS.register(ArcElement, ChartTooltip, Legend);

// JobCard Component
const JobCard = ({ job }) => {
  return (
    <div className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 hover:border-blue-200">
      <div>
        <h3 className="text-base font-bold text-blue-800 mb-1">{job.job_title}</h3>
        <div className="flex items-center text-sm text-blue-600 mb-2">
          <Building className="h-4 w-4 mr-1" />
          {job.company_name}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{job.job_description}</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {job.city}
          </span>
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {job.post_date}
          </span>
        </div>
        <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
};

// Interview Stats Chart Component
const InterviewStatsChart = ({ jobs }) => {
  const staticJobs = [
    { id: 1, title: "Software Engineer", company: "TechCorp", status: "Pending" },
    { id: 2, title: "Designer", company: "XYZ", status: "Accepted" },
    { id: 3, title: "Data Analyst", company: "ABC", status: "Interviewed" },
    { id: 4, title: "Backend Developer", company: "DEF", status: "Rejected" },
    { id: 5, title: "DevOps Engineer", company: "GHI", status: "Accepted" },
    { id: 6, title: "Product Manager", company: "JKL", status: "Interviewed" },
  ];

  const jobData = jobs && jobs.length > 0 ? jobs : staticJobs;

  const jobStatusCount = jobData.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: ["Pending", "Accepted", "Interviewed", "Rejected"],
    datasets: [
      {
        data: [
          jobStatusCount["Pending"] || 0,
          jobStatusCount["Accepted"] || 0,
          jobStatusCount["Interviewed"] || 0,
          jobStatusCount["Rejected"] || 0,
        ],
        backgroundColor: ["#3b82f6", "#10b981", "#6366f1", "#ef4444"], // Blue, Green, Indigo, Red
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 w-full max-w-xs mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-center text-blue-800">Interview Status</h2>
      <div className="w-64 h-64 mx-auto">
        <Doughnut 
          data={data} 
          options={{ 
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#1e3a8a'
                }
              }
            }
          }} 
        />
      </div>
    </div>
  );
};

// Main Component
const CategoryForecast = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [forecastData, setForecastData] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/api/categories');
        const sortedCategories = (response.data.categories || []).sort((a, b) => a.localeCompare(b));
        setCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`http://127.0.0.1:5000/api/forecast/${selectedCategory}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const formattedData = data.map((d) => ({
              date: new Date(d.date).getTime(),
              forecast: Number(d.forecast) || 0,
            }));
            setForecastData(formattedData);
          } else {
            console.error("Invalid data format:", data);
            setForecastData([]);
          }
        })
        .catch((error) => console.error("Error fetching forecast:", error));
    }
  }, [selectedCategory]);

  const fetchJobs = async (category) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/data/${category}`);
      setJobs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs', error);
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchJobs(category);
  };

  const filteredJobs = jobs.filter(job => 
    job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-blue-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex">
          {/* Sidebar Filter */}
          <div className="w-64 mr-6">
            <div className="w-64 p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                <Search className="mr-2 w-5 h-5 text-blue-600" /> Filters
              </h2>

              <div className="mb-4 relative">
                <h3 className="text-sm font-medium mb-2 text-blue-700">Job Category</h3>
                <select 
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="w-full border border-blue-200 rounded px-3 py-2 text-blue-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4 relative">
                <h3 className="text-sm font-medium mb-2 text-blue-700">Location</h3>
                <select 
                  className="w-full border border-blue-200 rounded px-3 py-2 text-blue-800"
                  disabled
                >
                  <option>Select City</option>
                </select>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 text-blue-700">Salary Range</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-blue-600">$300</span>
                  <input 
                    type="range" 
                    min="300" 
                    max="5000" 
                    value="5000" 
                    disabled
                    className="flex-grow opacity-50 cursor-not-allowed accent-blue-600"
                  />
                  <span className="text-xs text-blue-600">$5000k</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2 text-blue-700">Job Type</h3>
                {['Remote', 'Full-Time', 'Entry Level'].map(filter => (
                  <div key={filter} className="flex items-center mb-2">
                    <input 
                      type="checkbox" 
                      disabled 
                      className="mr-2 opacity-50 cursor-not-allowed accent-blue-600"
                    />
                    <span className="text-blue-800">{filter}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow">
            <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100 mb-6">
              <h1 className="text-2xl font-bold text-blue-900 mb-2 flex items-center">
                <Briefcase className="h-6 w-6 mr-2 text-blue-600" />
                Job Market Insights Dashboard
              </h1>
              <p className="text-blue-600">Explore job opportunities and market trends</p>
            </div>

            {selectedCategory && (
              <div className="mb-6">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" size={18} />
                  <input
                    type="text"
                    placeholder={`Search ${selectedCategory} jobs...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-800"
                  />
                </div>
              </div>
            )}

            {/* Forecast and Interview Stats */}
            {selectedCategory && (
              <div className="flex space-x-4 mb-6">
                <div className="w-1/3">
                  <InterviewStatsChart jobs={jobs} />
                </div>

                <div className="w-2/3">
                  {forecastData.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-100">
                      <h2 className="text-xl font-semibold mb-4 text-blue-800">
                        {selectedCategory} Job Market Forecast
                      </h2>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={forecastData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                          <XAxis
                            dataKey="date"
                            type="number"
                            scale="time"
                            domain={["dataMin", "dataMax"]}
                            tickFormatter={(tick) => new Date(tick).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            stroke="#3b82f6"
                          />
                          <YAxis stroke="#3b82f6" />
                          <Tooltip 
                            labelFormatter={(label) => new Date(label).toDateString()}
                            contentStyle={{
                              backgroundColor: '#1e40af',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="forecast" 
                            stroke="#3b82f6" 
                            strokeWidth={2} 
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, stroke: '#1e40af', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Job Listings */}
            {selectedCategory && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-800">
                    {selectedCategory} Jobs ({filteredJobs.length})
                  </h2>
                  <div className="flex items-center text-sm text-blue-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredJobs.map((job, index) => (
                      <JobCard key={index} job={job} />
                    ))}
                  </div>
                )}

                {!loading && filteredJobs.length === 0 && (
                  <div className="bg-white p-8 rounded-lg border border-blue-100 text-center">
                    <p className="text-blue-600">No jobs found matching your criteria</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-4 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {!selectedCategory && (
              <div className="bg-white p-12 rounded-lg border border-blue-100 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-xl font-medium text-blue-800 mb-2">Select a job category to begin</h3>
                <p className="text-blue-600 mb-6">Choose from our list of professional categories to explore opportunities</p>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="border border-blue-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-800"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForecast;