import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import InterviewForm from "./InterviewForm";
import { useToast } from "@/hooks/use-toast";

const ScheduleInterviewDialog = ({ open, onOpenChange, candidate }) => {
  const { toast } = useToast();
  const [isScheduled, setIsScheduled] = useState(false);
  const [interviewData, setInterviewData] = useState(null);

  const handleSchedule = (data) => {
    // In a real app, you would save this to your backend
    console.log("Interview scheduled:", data);
    setInterviewData(data);
    setIsScheduled(true);
    
    toast({
      title: "Interview Scheduled",
      description: `Successfully scheduled interview with ${candidate.name}`,
    });
    
    // Reset dialog state after a delay
    setTimeout(() => {
      onOpenChange(false);
      // Reset the scheduled state after the dialog closes
      setTimeout(() => {
        setIsScheduled(false);
        setInterviewData(null);
      }, 300);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isScheduled ? "Interview Scheduled" : `Schedule Interview with ${candidate.name}`}
          </DialogTitle>
          <DialogDescription>
            {isScheduled
              ? "The interview has been successfully scheduled."
              : `Create a Google Meet link and schedule an interview with ${candidate.name}.`}
          </DialogDescription>
        </DialogHeader>
        
        {isScheduled ? (
          <div className="py-6 flex flex-col items-center">
            <div className="mb-6 text-green-600">
              <CheckCircle2 size={64} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Interview Confirmed</h3>
            <div className="w-full space-y-4 mt-2">
              <div className="flex items-center justify-center gap-2">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <span>
                  {interviewData?.date.toLocaleDateString()} at {interviewData?.startTime} - {interviewData?.endTime}
                </span>
              </div>
              <Badge className="mx-auto">Google Meet</Badge>
              <p className="text-center text-sm text-muted-foreground">
                The interview details and Google Meet link have been copied to your clipboard 
                and can be shared with the candidate.
              </p>
            </div>
          </div>
        ) : (
          <InterviewForm
            candidateName={candidate.name}
            candidateEmail={candidate.email}
            onSchedule={handleSchedule}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;