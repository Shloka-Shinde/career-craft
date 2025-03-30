import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  MailOpen, X, Loader2, Briefcase, MapPin,
  DollarSign, Calendar, User, AlertCircle
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const JobDetailPlacard = ({ jobData, onClose }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [latestResume, setLatestResume] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLatestResume = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/resumes', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch resumes');
      
      const resumes = await response.json();
      if (resumes.length === 0) return null;
      
      // Find most recent resume by created_at date
      const mostRecent = resumes.reduce((latest, current) => {
        return new Date(current.created_at) > new Date(latest.created_at) 
          ? current 
          : latest;
      }, resumes[0]);
      
      return mostRecent;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return null;
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for this job",
        variant: "destructive"
      });
      return;
    }

    setIsApplying(true);
    
    try {
      // Get the most recent resume (either from state or fresh fetch)
      const resume = latestResume || await fetchLatestResume();
      setLatestResume(resume);

      const applicationData = {
        job_id: jobData._id,
        applicant_id: user.id,
        status: "Pending",
        ...(resume ? { resume_data: resume.resume_data } : {}),
        applied_at: new Date().toISOString()
      };

    
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit application');
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been successfully submitted.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error.message.includes('resume') 
          ? "We'll use your profile information for this application"
          : error.message,
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
    }
  };

  // Load resume when component mounts
  useEffect(() => {
    if (user) {
      fetchLatestResume().then(setLatestResume);
    }
  }, [user]);

  if (!jobData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={24} />
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{jobData.title}</h1>
          <div className="flex items-center space-x-4 mt-2">
            <span className="flex items-center">
              <Briefcase size={16} className="mr-1" />
              {jobData.company}
            </span>
            <span className="flex items-center">
              <MapPin size={16} className="mr-1" />
              {jobData.location}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded">
            <Briefcase size={20} className="text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Job Type</div>
              <div className="font-semibold">{jobData.job_type}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded">
            <DollarSign size={20} className="text-green-500" />
            <div>
              <div className="text-sm text-gray-500">Salary</div>
              <div className="font-semibold">{jobData.salary_range}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded">
            <Calendar size={20} className="text-purple-500" />
            <div>
              <div className="text-sm text-gray-500">Posted</div>
              <div className="font-semibold">
                {new Date(jobData.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <User className="h-5 w-5" /> Job Description
          </h2>
          <div className="prose max-w-none">
            {jobData.description}
          </div>
        </div>

        {jobData.skills?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {jobData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          {latestResume ? (
            <p className="text-blue-800">
              <strong>Using resume:</strong> {latestResume.name || "Untitled"} 
              (created {new Date(latestResume.created_at).toLocaleDateString()})
            </p>
          ) : (
            <p className="text-blue-800 flex items-center gap-2">
              <AlertCircle size={16} />
              <span>No resume found - using profile information</span>
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <Button 
            onClick={handleApply}
            disabled={isApplying}
            className="flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <Loader2 className="animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <MailOpen size={16} />
                Apply Now
              </>
            )}
          </Button>
          <Button variant="outline">Save Job</Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPlacard;