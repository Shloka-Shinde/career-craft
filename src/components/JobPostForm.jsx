import React, { useState } from 'react';

const JobPostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    contactEmail: '',
    category: 'General',
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Check required fields
    const requiredFields = ['title', 'company', 'location', 'description', 'contactEmail'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    // Salary validation (optional)
    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Salary must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prevState => ({
        ...prevState,
        [name]: ''
      }));
    }
  };

  const addSkill = (e) => {
    // Prevent default behavior
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const newSkill = skillInput.trim();
    
    // Only add if skill is not empty and not already in the list
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prevState => ({
        ...prevState,
        skills: [...prevState.skills, newSkill]
      }));
      
      // Clear the skill input
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prevState => ({
      ...prevState,
      skills: prevState.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add any pending skill in the input
    if (skillInput.trim()) {
      addSkill();
    }

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    console.log("Skills array length:", formData.skills.length);
    console.log("Skills array contents:", JSON.stringify(formData.skills));

    const jobPostData = {
      ...formData,
      salary: formData.salary ? Number(formData.salary) : null,
      skills: formData.skills // Directly use the array
    };

    console.log("Detailed Job Post Data:", JSON.stringify(jobPostData));

    try {
      const response = await fetch('http://localhost:5003/api/jobposts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobPostData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('SERVER ERROR RESPONSE:', errorData);
        throw new Error(errorData || 'Failed to create job post');
      }

      const responseData = await response.json();
      console.log('SUCCESSFUL Server response:', responseData);

      alert('Job Post Created Successfully!');
      
      // Reset form after successful submission
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        salary: '',
        contactEmail: '',
        category: 'General',
        skills: []
      });
      // Clear any previous errors
      setErrors({});
    } catch (error) {
      console.error('FULL Submission Error:', error);
      alert(`Failed to create job post: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Job Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Job Title"
            className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : ''}`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company Name"
            className={`w-full px-3 py-2 border rounded-md ${errors.company ? 'border-red-500' : ''}`}
          />
          {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Job Location"
            className={`w-full px-3 py-2 border rounded-md ${errors.location ? 'border-red-500' : ''}`}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
        </div>
        <div className="mb-4">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Job Description"
            className={`w-full px-3 py-2 border rounded-md h-32 ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        <div className="mb-4">
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="Salary (optional)"
            className={`w-full px-3 py-2 border rounded-md ${errors.salary ? 'border-red-500' : ''}`}
          />
          {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
        </div>
        <div className="mb-4">
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            placeholder="Contact Email"
            className={`w-full px-3 py-2 border rounded-md ${errors.contactEmail ? 'border-red-500' : ''}`}
          />
          {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
        </div>
        
        {/* Skills Section */}
        <div className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
              placeholder="Add Skills (Press Enter to add)"
              className="flex-grow px-3 py-2 border rounded-md mr-2"
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Add Skill
            </button>
          </div>
          
          {/* Display Added Skills */}
          {formData.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span 
                  key={skill} 
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Submit Job Post
        </button>
      </form>
    </div>
  );
};

export default JobPostForm;