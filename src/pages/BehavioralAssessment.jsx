import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import VideoRecorder from '@/components/VideoRecorder';
import AssessmentReport from '@/components/AssessmentReport';

const BehavioralAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessmentStage, setAssessmentStage] = useState('intro');
  const [assessmentData, setAssessmentData] = useState(null);
  
  const handleStartAssessment = () => {
    setAssessmentStage('recording');
    toast({
      title: "Assessment Started",
      description: "Please follow the on-screen instructions",
    });
  };

  const handleVideoSubmitted = (videoBlob) => {
    setAssessmentStage('processing');
    toast({
      title: "Processing Your Video",
      description: "Our AI is analyzing your responses",
    });
    
    // In a real implementation, we would upload the video for processing
    // For now, simulate processing with a timeout
    setTimeout(() => {
      // Mock assessment data
      const mockAssessmentData = {
        confidence: 85,
        eyeContact: 78,
        facialExpressions: 82,
        speechClarity: 90,
        nervousBehaviors: 25,
        overallScore: 82,
        strengths: ['Good communication skills', 'Positive body language', 'Clear articulation'],
        improvements: ['Occasional nervous gestures', 'Could improve eye contact consistency'],
        summary: 'The candidate demonstrates strong communication abilities with clear articulation and positive body language. Some nervousness was detected but did not significantly impact overall performance.'
      };
      
      setAssessmentData(mockAssessmentData);
      setAssessmentStage('report');
      toast({
        title: "Analysis Complete",
        description: "Your behavioral assessment report is ready",
      });
    }, 5000);
  };

  const handleRetakeAssessment = () => {
    setAssessmentStage('recording');
    setAssessmentData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </Button>
        
        {assessmentStage === 'intro' && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">AI Behavioral Assessment</CardTitle>
              <CardDescription className="text-center">
                Complete a video-based behavioral assessment to receive AI-generated insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
                <ol className="list-decimal pl-5 text-blue-700 space-y-2">
                  <li>You'll be prompted to answer a series of behavioral questions</li>
                  <li>Your video responses will be recorded for analysis</li>
                  <li>Our AI will analyze your communication style, body language, and expressions</li>
                  <li>You'll receive a detailed report with insights and improvement areas</li>
                </ol>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2">Please note:</h3>
                <ul className="list-disc pl-5 text-amber-700">
                  <li>Ensure you're in a well-lit environment with minimal background noise</li>
                  <li>Position yourself clearly in the frame (head and shoulders visible)</li>
                  <li>Speak clearly and at a moderate pace</li>
                  <li>The assessment takes approximately 10-15 minutes to complete</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                size="lg" 
                onClick={handleStartAssessment}
                className="gap-2"
              >
                <Video size={18} />
                Start Assessment
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {assessmentStage === 'recording' && (
          <VideoRecorder onVideoSubmitted={handleVideoSubmitted} />
        )}
        
        {assessmentStage === 'processing' && (
          <Card className="shadow-lg text-center p-6">
            <CardContent className="py-12">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-full bg-blue-200 h-24 w-24 flex items-center justify-center mb-4">
                  <FileText className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">Analyzing Your Responses</h3>
                <p className="text-gray-600 max-w-md">
                  Our AI is reviewing your video responses and generating personalized insights.
                  This usually takes 1-2 minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {assessmentStage === 'report' && assessmentData && (
          <AssessmentReport 
            assessmentData={assessmentData} 
            onRetake={handleRetakeAssessment}
          />
        )}
      </div>
    </div>
  );
};

export default BehavioralAssessment;