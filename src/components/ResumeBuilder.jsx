import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserResumes } from '@/hooks/use-user-resumes';
import { useResumeTemplates } from '@/hooks/use-resume-templates';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, GraduationCap, User, Mail, Phone, MapPin, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const ResumeBuilder = () => {
  const { resumes, createResume, updateResume, deleteResume } = useUserResumes();
  const { templates, isLoading: isLoadingTemplates } = useResumeTemplates();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('edit');
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  // Find the primary resume or the first resume
  const primaryResume = resumes.find(r => r.is_primary) || resumes[0];
  const selectedResume = selectedResumeId 
    ? resumes.find(r => r.id === selectedResumeId) 
    : primaryResume;

  // Initialize form state based on selected resume or with empty values
  const [formState, setFormState] = useState({
    name: selectedResume?.name || 'My Resume',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      summary: '',
    },
    experience: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
    education: [{ institution: '', degree: '', year: '', description: '' }],
    skills: [''],
    ...selectedResume?.resume_data
  });

  // Update form state when selected resume changes
  useEffect(() => {
    if (selectedResume) {
      setFormState({
        name: selectedResume.name,
        ...selectedResume.resume_data,
      });
    }
  }, [selectedResume]);

  const handleInputChange = (section, field, value, index) => {
    setFormState(prev => {
      if (index !== undefined && Array.isArray(prev[section])) {
        // Handle array fields (experience, education, skills)
        const newArray = [...prev[section]];
        if (field) {
          newArray[index] = { ...newArray[index], [field]: value };
        } else {
          newArray[index] = value; // For simple arrays like skills
        }
        return { ...prev, [section]: newArray };
      } else if (section === 'personalInfo') {
        // Handle nested objects
        return { 
          ...prev, 
          personalInfo: { 
            ...prev.personalInfo, 
            [field]: value 
          } 
        };
      } else {
        // Handle top-level fields
        return { ...prev, [section]: value };
      }
    });
  };

  const addListItem = (section) => {
    setFormState(prev => {
      const currentItems = [...prev[section]];
      
      if (section === 'experience') {
        currentItems.push({ company: '', role: '', startDate: '', endDate: '', description: '' });
      } else if (section === 'education') {
        currentItems.push({ institution: '', degree: '', year: '', description: '' });
      } else if (section === 'skills') {
        currentItems.push('');
      }
      
      return { ...prev, [section]: currentItems };
    });
  };

  const removeListItem = (section, index) => {
    setFormState(prev => {
      const currentItems = [...prev[section]];
      currentItems.splice(index, 1);
      return { ...prev, [section]: currentItems };
    });
  };
  const saveResume = async () => {
    try {
      // Log the full form state before saving
      console.log('Full Form State:', JSON.stringify(formState, null, 2));
  
      // Sanitize and prepare data
      const sanitizedData = {
        name: formState.name || 'Untitled Resume',
        is_primary: resumes.length === 0,
        template_id: null,
        resume_data: {
          personalInfo: {
            fullName: formState.personalInfo.fullName || '',
            email: formState.personalInfo.email || '',
            phone: formState.personalInfo.phone || '',
            location: formState.personalInfo.location || '',
            title: formState.personalInfo.title || '',
            summary: formState.personalInfo.summary || ''
          },
          experience: formState.experience
            .filter(exp => exp.company || exp.role)
            .map(exp => ({
              company: exp.company || '',
              role: exp.role || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              description: exp.description || ''
            })),
          education: formState.education
            .filter(edu => edu.institution || edu.degree)
            .map(edu => ({
              institution: edu.institution || '',
              degree: edu.degree || '',
              year: edu.year || '',
              description: edu.description || ''
            })),
          skills: formState.skills.filter(skill => skill.trim())
        }
      };
  
      console.log('Sanitized Data:', JSON.stringify(sanitizedData, null, 2));
  
      if (selectedResume) {
        // Existing code for updating resume
        await updateResume(selectedResume.id, sanitizedData);
        toast({
          title: 'Resume updated',
          description: 'Your resume has been successfully updated.'
        });
      } else {
        // Existing code for creating resume
        const newResume = await createResume(sanitizedData);
        setSelectedResumeId(newResume.id);
        toast({
          title: 'Resume created',
          description: 'Your resume has been successfully created.'
        });
      }
    } catch (error) {
      // Detailed error logging
      console.error('Full Error Object:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Error Response Data:', error.response.data);
        console.error('Error Response Status:', error.response.status);
        
        toast({
          title: 'Error',
          description: error.response.data.message || 'Failed to save your resume. Please check your data.',
          variant: 'destructive'
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        toast({
          title: 'Network Error',
          description: 'No response from server. Please check your internet connection.',
          variant: 'destructive'
        });
      } else {
        // Something happened in setting up the request
        console.error('Error Message:', error.message);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleDeleteResume = async (id) => {
    if (confirm('Are you sure you want to delete this resume?')) {
      try {
        await deleteResume(id);
        setSelectedResumeId(null);
        toast({
          title: 'Resume deleted',
          description: 'Your resume has been successfully deleted.'
        });
      } catch (error) {
        console.error('Error deleting resume:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete your resume. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await updateResume(id, { is_primary: true });
      toast({
        title: 'Primary resume updated',
        description: 'This is now your primary resume.'
      });
    } catch (error) {
      console.error('Error setting primary resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to set primary resume. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const createNewResume = () => {
    setSelectedResumeId(null);
    setFormState({
      name: 'New Resume',
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        title: '',
        summary: '',
      },
      experience: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
      education: [{ institution: '', degree: '', year: '', description: '' }],
      skills: [''],
    });
    setActiveTab('edit');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resume Builder</h2>
        <Button onClick={createNewResume} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Resume
        </Button>
      </div>

      {resumes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {resumes.map(resume => (
            <Card 
              key={resume.id} 
              className={`cursor-pointer ${selectedResumeId === resume.id ? 'border-primary' : ''}`}
              onClick={() => setSelectedResumeId(resume.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span className="truncate">{resume.name}</span>
                  {resume.is_primary && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Primary
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteResume(resume.id);
                  }}
                >
                  Delete
                </Button>
                {!resume.is_primary && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(resume.id);
                    }}
                  >
                    Set as Primary
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {(selectedResume || selectedResumeId === null) && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Input 
                    value={formState.name} 
                    onChange={(e) => handleInputChange('name', '', e.target.value)} 
                    className="text-xl font-bold"
                    placeholder="Resume Name"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" /> Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={formState.personalInfo.fullName} 
                        onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Professional Title</Label>
                      <Input 
                        id="title" 
                        value={formState.personalInfo.title} 
                        onChange={(e) => handleInputChange('personalInfo', 'title', e.target.value)}
                        placeholder="Software Developer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formState.personalInfo.email}
                        onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                        placeholder="johndoe@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        value={formState.personalInfo.phone}
                        onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={formState.personalInfo.location}
                        onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea 
                        id="summary" 
                        value={formState.personalInfo.summary}
                        onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
                        placeholder="A brief summary of your professional background and goals"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" /> Work Experience
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addListItem('experience')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  
                  {formState.experience.map((exp, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2"
                          onClick={() => removeListItem('experience', index)}
                          disabled={formState.experience.length === 1}
                        >
                          Remove
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Company</Label>
                            <Input 
                              value={exp.company}
                              onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                              placeholder="Company Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Job Title</Label>
                            <Input 
                              value={exp.role}
                              onChange={(e) => handleInputChange('experience', 'role', e.target.value, index)}
                              placeholder="Job Title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input 
                              value={exp.startDate}
                              onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, index)}
                              placeholder="Jan 2020"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input 
                              value={exp.endDate}
                              onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, index)}
                              placeholder="Present"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea 
                              value={exp.description}
                              onChange={(e) => handleInputChange('experience', 'description', e.target.value, index)}
                              placeholder="Describe your responsibilities and achievements"
                              rows={3}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Education */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" /> Education
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addListItem('education')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  
                  {formState.education.map((edu, index) => (
                    <Card key={index} className="relative">
                      <CardHeader className="pb-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="absolute top-2 right-2"
                          onClick={() => removeListItem('education', index)}
                          disabled={formState.education.length === 1}
                        >
                          Remove
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Institution</Label>
                            <Input 
                              value={edu.institution}
                              onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                              placeholder="University or School Name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Degree/Program</Label>
                            <Input 
                              value={edu.degree}
                              onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Year</Label>
                            <Input 
                              value={edu.year}
                              onChange={(e) => handleInputChange('education', 'year', e.target.value, index)}
                              placeholder="2015 - 2019"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>Description</Label>
                            <Textarea 
                              value={edu.description}
                              onChange={(e) => handleInputChange('education', 'description', e.target.value, index)}
                              placeholder="Relevant coursework, honors, activities"
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Skills</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addListItem('skills')}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formState.skills.map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input 
                          value={skill}
                          onChange={(e) => handleInputChange('skills', '', e.target.value, index)}
                          placeholder="JavaScript, React, SQL, etc."
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeListItem('skills', index)}
                          disabled={formState.skills.length === 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveResume} className="ml-auto">Save Resume</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <ResumePreview resume={formState} />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab('edit')}>
                  Edit
                </Button>
                <Button>Download PDF</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const ResumePreview = ({ resume }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow-sm border rounded-md">
      {/* Header */}
      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{resume.personalInfo.fullName || 'Your Name'}</h1>
        <p className="text-gray-600 mt-1">{resume.personalInfo.title || 'Professional Title'}</p>
        
        <div className="flex flex-wrap justify-center gap-x-4 mt-3 text-sm text-gray-600">
          {resume.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{resume.personalInfo.email}</span>
            </div>
          )}
          
          {resume.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              <span>{resume.personalInfo.phone}</span>
            </div>
          )}
          
          {resume.personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{resume.personalInfo.location}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Summary */}
      {resume.personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-1 mb-2">Summary</h2>
          <p className="text-gray-700">{resume.personalInfo.summary}</p>
        </div>
      )}
      
      {/* Experience */}
      {resume.experience && resume.experience.length > 0 && resume.experience[0].company && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Experience</h2>
          
          <div className="space-y-4">
            {resume.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{exp.role || 'Position'}</h3>
                    <p className="text-gray-600">{exp.company || 'Company'}</p>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {exp.startDate || 'Start'} - {exp.endDate || 'End'}
                  </p>
                </div>
                {exp.description && <p className="mt-1 text-gray-700">{exp.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Education */}
      {resume.education && resume.education.length > 0 && resume.education[0].institution && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Education</h2>
          
          <div className="space-y-4">
            {resume.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{edu.institution || 'University'}</h3>
                    <p className="text-gray-600">{edu.degree || 'Degree'}</p>
                  </div>
                  <p className="text-gray-500 text-sm">{edu.year || 'Year'}</p>
                </div>
                {edu.description && <p className="mt-1 text-gray-700">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && resume.skills[0] && (
        <div>
          <h2 className="text-lg font-semibold border-b pb-1 mb-3">Skills</h2>
          
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, index) => (
              skill && (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                >
                  {skill}
                </span>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;