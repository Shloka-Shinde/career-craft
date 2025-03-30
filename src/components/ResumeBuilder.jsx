import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUserResumes } from '@/hooks/use-user-resumes';
import { useResumeTemplates } from '@/hooks/use-resume-templates';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, GraduationCap, User, Mail, Phone, MapPin, Plus, Github, Linkedin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';



export const ResumeBuilder = () => {
  const { resumes, createResume, updateResume, deleteResume, analyzeProfiles, profileRating, isRatingLoading, clearProfileRating } = useUserResumes();
  const { templates, isLoading: isLoadingTemplates } = useResumeTemplates();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('edit');
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [showProfileAnalysis, setShowProfileAnalysis] = useState(false);

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
      linkedinUrl: '',
      githubUrl: '',
    },
    experience: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
    education: [{ institution: '', degree: '', year: '', description: '' }],
    skills: [''],
    ...selectedResume?.resume_data
  });

  // Update form state when selected resume changes
  React.useEffect(() => {
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
      if (selectedResume) {
        await updateResume(selectedResume.id, {
          name: formState.name,
          resume_data: {
            personalInfo: formState.personalInfo,
            experience: formState.experience,
            education: formState.education,
            skills: formState.skills,
          }
        });
        toast({
          title: 'Resume updated',
          description: 'Your resume has been successfully updated.'
        });
      } else {
        const newResume = await createResume({
          name: formState.name,
          resume_data: {
            personalInfo: formState.personalInfo,
            experience: formState.experience,
            education: formState.education,
            skills: formState.skills,
          },
          is_primary: resumes.length === 0, // Make primary if first resume
          template_id: null
        });
        setSelectedResumeId(newResume.id);
        toast({
          title: 'Resume created',
          description: 'Your resume has been successfully created.'
        });
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your resume. Please try again.',
        variant: 'destructive'
      });
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
        linkedinUrl: '',
        githubUrl: '',
      },
      experience: [{ company: '', role: '', startDate: '', endDate: '', description: '' }],
      education: [{ institution: '', degree: '', year: '', description: '' }],
      skills: [''],
    });
    setActiveTab('edit');
    clearProfileRating();
    setShowProfileAnalysis(false);
  };

  const handleAnalyzeProfiles = async () => {
    const { linkedinUrl, githubUrl } = formState.personalInfo;
    
    if (!linkedinUrl && !githubUrl) {
      toast({
        title: 'Missing information',
        description: 'Please provide at least one profile URL (LinkedIn or GitHub)',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await analyzeProfiles(linkedinUrl || '', githubUrl || '');
      setShowProfileAnalysis(true);
      toast({
        title: 'Analysis complete',
        description: 'Your profiles have been successfully analyzed.'
      });
    } catch (error) {
      console.error('Error analyzing profiles:', error);
      toast({
        title: 'Analysis failed',
        description: 'There was a problem analyzing your profiles. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const renderScoreIndicator = (score) => {
    return (
      <div className="flex items-center gap-2">
        <Progress value={score * 10} className="h-2 flex-1" />
        <span className="text-sm font-medium">{score}/10</span>
      </div>
    );
  };

  const renderProfileAnalysis = () => {
    if (!profileRating) return null;
    
    return (
      <Card className="mt-6 border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Profile Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Overall Score</Label>
                {renderScoreIndicator(profileRating.overall_score)}
              </div>
              <div className="flex justify-between items-center">
                <Label>Skills Match</Label>
                {renderScoreIndicator(profileRating.skills_match)}
              </div>
              <div className="flex justify-between items-center">
                <Label>Experience Rating</Label>
                {renderScoreIndicator(profileRating.experience_rating)}
              </div>
            </div>

            <Separator />

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="strengths">
                <AccordionTrigger className="text-green-600 font-medium">Key Strengths</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 list-disc pl-5">
                    {profileRating.strengths.map((strength, index) => (
                      <li key={index} className="text-sm">{strength}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="improve">
                <AccordionTrigger className="text-amber-600 font-medium">Areas to Improve</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 list-disc pl-5">
                    {profileRating.areas_to_improve.map((area, index) => (
                      <li key={index} className="text-sm">{area}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="recommendations">
                <AccordionTrigger className="text-blue-600 font-medium">Recommendations</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 list-disc pl-5">
                    {profileRating.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    );
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
                    
                    {/* New Online Profiles Section */}
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-semibold text-base">Online Profiles</Label>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" /> LinkedIn Profile URL
                          </Label>
                          <Input 
                            id="linkedin" 
                            value={formState.personalInfo.linkedinUrl || ''}
                            onChange={(e) => handleInputChange('personalInfo', 'linkedinUrl', e.target.value)}
                            placeholder="https://www.linkedin.com/in/username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="github" className="flex items-center gap-2">
                            <Github className="h-4 w-4" /> GitHub Profile URL
                          </Label>
                          <Input 
                            id="github" 
                            value={formState.personalInfo.githubUrl || ''}
                            onChange={(e) => handleInputChange('personalInfo', 'githubUrl', e.target.value)}
                            placeholder="https://github.com/username"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            type="button" 
                            onClick={handleAnalyzeProfiles}
                            disabled={isRatingLoading}
                            className="flex items-center gap-2"
                          >
                            {isRatingLoading ? 'Analyzing...' : 'Analyze Profiles'}
                            {isRatingLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        
                        {/* Profile Analysis Results */}
                        {showProfileAnalysis && renderProfileAnalysis()}
                      </div>
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
        
        {/* Social Profiles */}
        {(resume.personalInfo.linkedinUrl || resume.personalInfo.githubUrl) && (
          <div className="flex justify-center gap-3 mt-3">
            {resume.personalInfo.linkedinUrl && (
              <a 
                href={resume.personalInfo.linkedinUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <Linkedin className="h-3.5 w-3.5" />
                <span>LinkedIn</span>
              </a>
            )}
            
            {resume.personalInfo.githubUrl && (
              <a 
                href={resume.personalInfo.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-700 hover:underline"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
            )}
          </div>
        )}
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