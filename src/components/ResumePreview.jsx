// Updated ResumePreview component with better logging and scroll
const ResumePreview = ({ applicantId, isOpen, onClose }) => {
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [applicantProfile, setApplicantProfile] = useState(null);
  
    useEffect(() => {
      if (isOpen && applicant_id) {
        console.log('🔄 ResumePreview opened for applicantId:', applicant_id);
        fetchResumeAndProfile();
      }
    }, [isOpen, applicant_id]);
  
    const fetchResumeAndProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📡 Starting to fetch resume data...');
        
        // Fetch resume data from resumes table
        const { data: resumeData, error: resumeError } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', applicant_id)
          
  
        console.log('✅ Resume query completed');
        console.log('📄 Resume data raw:', resumeData);
        console.log('❌ Resume error:', resumeError);
        console.log('🔍 Resume error code:', resumeError?.code);
        console.log('📝 Resume error message:', resumeError?.message);
  
        if (resumeError) {
          if (resumeError.code === 'PGRST116') {
            console.log('ℹ️ No resume found for this user (PGRST116)');
            setError('No resume found for this candidate.');
          } else {
            console.error('🚨 Error fetching resume:', resumeError);
            setError('Failed to load resume: ' + resumeError.message);
          }
        } else {
          console.log('🎉 Resume found, setting state');
          setResume(resumeData);
          
          // Log detailed resume structure
          console.log('📊 Resume structure analysis:');
          console.log('   - Has professional_summary:', !!resumeData.professional_summary);
          console.log('   - Has work_experience:', !!resumeData.work_experience);
          console.log('   - Has education:', !!resumeData.education);
          console.log('   - Has skills:', !!resumeData.skills);
          console.log('   - work_experience type:', typeof resumeData.work_experience);
          console.log('   - education type:', typeof resumeData.education);
          console.log('   - skills type:', typeof resumeData.skills);
          
          if (resumeData.work_experience) {
            console.log('   - work_experience content:', resumeData.work_experience);
          }
          if (resumeData.education) {
            console.log('   - education content:', resumeData.education);
          }
          if (resumeData.skills) {
            console.log('   - skills content:', resumeData.skills);
          }
        }
  
        // Fetch applicant profile from profiles table
        console.log('📡 Fetching profile data...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', applicantId)
          .single();
  
        console.log('✅ Profile query completed');
        console.log('👤 Profile data:', profileData);
        console.log('❌ Profile error:', profileError);
  
        if (profileError) {
          console.error('🚨 Error fetching profile:', profileError);
        } else {
          console.log('🎉 Profile found, setting state');
          setApplicantProfile(profileData);
        }
  
      } catch (err) {
        console.error('💥 Unexpected error:', err);
        setError('Failed to load resume data: ' + err.message);
      } finally {
        console.log('🏁 Fetch completed, setting loading to false');
        setLoading(false);
      }
    };
  
    const handleDownload = () => {
      alert('Download functionality would be implemented here');
    };
  
    // Helper function to safely parse JSON fields with detailed logging
    const parseJsonField = (field, fieldName) => {
      console.log(`🛠️ Parsing ${fieldName}:`, field);
      
      if (!field) {
        console.log(`   - ${fieldName} is null/undefined, returning empty array`);
        return [];
      }
      
      if (Array.isArray(field)) {
        console.log(`   - ${fieldName} is already array, length:`, field.length);
        return field;
      }
      
      if (typeof field === 'string') {
        console.log(`   - ${fieldName} is string, attempting to parse JSON`);
        try {
          const parsed = JSON.parse(field);
          console.log(`   - ${fieldName} parsed successfully:`, parsed);
          return parsed;
        } catch (parseError) {
          console.log(`   - ${fieldName} JSON parse failed:`, parseError);
          return [];
        }
      }
      
      console.log(`   - ${fieldName} is object, returning as-is:`, field);
      return field;
    };
  
    const workExperience = parseJsonField(resume?.work_experience, 'work_experience');
    const education = parseJsonField(resume?.education, 'education');
    const skills = parseJsonField(resume?.skills, 'skills');
  
    console.log('📋 Final parsed data:');
    console.log('   - workExperience:', workExperience);
    console.log('   - education:', education);
    console.log('   - skills:', skills);
  
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="Resume Preview"
        size="max-w-4xl"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading resume...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium mb-2">Error Loading Resume</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={fetchResumeAndProfile}
              >
                Retry
              </Button>
            </div>
          ) : !resume ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No Resume Found</h3>
              <p className="text-muted-foreground">This candidate hasn't created a resume yet.</p>
            </div>
          ) : (
            <Card className="w-full">
              <CardContent className="p-6">
                {/* Header Section */}
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={applicantProfile?.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {resume.full_name ? resume.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold mb-2">
                    {resume.full_name || applicantProfile?.name || 'Unknown Candidate'}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-3">
                    {resume.professional_title || 'Professional'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    {resume.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {resume.email}
                      </div>
                    )}
                    {resume.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {resume.phone}
                      </div>
                    )}
                    {resume.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {resume.location}
                      </div>
                    )}
                  </div>
                </div>
  
                <Separator className="my-6" />
  
                {/* Summary Section */}
                {resume.professional_summary && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Professional Summary
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {resume.professional_summary}
                    </p>
                  </div>
                )}
  
                {/* Experience Section */}
                {workExperience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2" />
                      Work Experience ({workExperience.length})
                    </h2>
                    <div className="space-y-4">
                      {workExperience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-primary pl-4">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold">{exp.position || exp.title || 'Unknown Position'}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {exp.start_date || 'Start date'} - {exp.end_date || 'Present'}
                            </div>
                          </div>
                          <p className="text-muted-foreground mb-1">{exp.company || exp.employer || 'Unknown Company'}</p>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {exp.description}
                            </p>
                          )}
                          {exp.responsibilities && Array.isArray(exp.responsibilities) && (
                            <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                              {exp.responsibilities.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Education Section */}
                {education.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Education ({education.length})
                    </h2>
                    <div className="space-y-3">
                      {education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-green-500 pl-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold">{edu.degree || edu.qualification || 'Unknown Degree'}</h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {edu.start_date || 'Start date'} - {edu.end_date || 'Present'}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{edu.institution || edu.school || 'Unknown Institution'}</p>
                          {edu.gpa && (
                            <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                          )}
                          {edu.field_of_study && (
                            <p className="text-sm text-muted-foreground">Field: {edu.field_of_study}</p>
                          )}
                          {edu.description && (
                            <p className="text-sm text-muted-foreground mt-1">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Skills Section */}
                {skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2" />
                      Skills ({skills.length})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {typeof skill === 'object' ? skill.name || skill.skill : skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
  
                {/* Show message if no detailed data is available */}
                {!resume.professional_summary && workExperience.length === 0 && education.length === 0 && skills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No additional resume information available beyond basic details.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
  
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {resume && (
            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Resume
            </Button>
          )}
        </div>
      </Modal>
    );
  };