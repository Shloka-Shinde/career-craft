import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Copy, Check, Video, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const InterviewScheduler = ({
  applicantName,
  applicantEmail,
  jobTitle,
  applicantId,
  jobId, // Now receiving jobId as prop from RecruiterDashboard
  meetLink,
  onClose,
  onConfirm
}) => {
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [interviewType, setInterviewType] = useState("video");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to upload interview data to Supabase
  const uploadInterviewToSupabase = async (interviewData) => {
    try {
      setLoading(true);
      
      // Validate jobId
      if (!jobId) {
        throw new Error('Job ID is missing. Please select a job first.');
      }

      // Get current user (recruiter)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user logged in');
      }

      console.log('Uploading interview data:', {
        applicant_id: applicantId,
        job_id: jobId, // Using the jobId from props
        meet_link: meetLink,
        interview_date: interviewDate,
        interview_time: interviewTime,
        duration: parseInt(duration),
        interview_type: interviewType,
        additional_notes: additionalNotes,
        scheduled_by: user.id
      });

      // Upload to Supabase
      const { data, error } = await supabase
        .from('interviews')
        .insert([
          {
            applicant_id: applicantId,
            job_id: jobId, // Using the jobId from props
            meet_link: meetLink,
            interview_date: interviewDate,
            interview_time: interviewTime,
            duration: parseInt(duration),
            interview_type: interviewType,
            additional_notes: additionalNotes,
            status: 'scheduled',
            scheduled_by: user.id
          }
        ])
        .select();

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(error.message);
      }

      console.log('Interview uploaded to Supabase:', data);
      return { success: true, data };

    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    // Validate form
    if (!interviewDate || !interviewTime) {
      alert("Please select date and time for the interview");
      return;
    }

    // Validate jobId
    if (!jobId) {
      alert("Error: No job selected. Please go back and select a job first.");
      return;
    }

    // Prepare interview data
    const interviewData = {
      applicantName,
      applicantEmail,
      jobTitle,
      applicantId,
      jobId,
      meetLink,
      interviewDate,
      interviewTime,
      duration,
      interviewType,
      additionalNotes
    };

    console.log("Scheduling interview:", interviewData);
    
    // Upload to Supabase
    const result = await uploadInterviewToSupabase(interviewData);
    
    if (result.success) {
      // Call the confirm function passed from parent
      onConfirm(interviewData);
      alert('Interview scheduled successfully!');
    } else {
      alert(`Failed to schedule interview: ${result.error}`);
    }
  };

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Schedule Interview</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X size={20} />
            </Button>
          </div>

          <p className="text-muted-foreground mb-6">
            Schedule an interview with {applicantName} for the {jobTitle} position.
            {jobId && (
              <span className="block text-xs mt-1">Job ID: {jobId.slice(0, 8)}...</span>
            )}
          </p>

          <div className="space-y-6">
            {/* Applicant Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Applicant Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {applicantName}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {applicantEmail || "Not provided"}
                </div>
                <div>
                  <span className="font-medium">Position:</span> {jobTitle}
                </div>
                <div>
                  <span className="font-medium">Applicant ID:</span> {applicantId?.slice(0, 8)}...
                </div>
                {jobId && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Job ID:</span> {jobId}
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Link */}
            <div className="space-y-3">
              <Label htmlFor="meetLink" className="text-sm font-medium">
                Google Meet Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="meetLink"
                  value={meetLink}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link has been automatically generated for the interview.
              </p>
            </div>

            {/* Interview Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Interview Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Interview Time
                </Label>
                <Select value={interviewTime} onValueChange={setInterviewTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interview Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Interview Type</Label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional information, agenda items, or preparation materials for the candidate..."
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Interview Summary */}
            {(interviewDate || interviewTime || duration || interviewType) && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Interview Summary</h4>
                <div className="space-y-1 text-sm">
                  {interviewDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-green-600" />
                      <span>Date: {new Date(interviewDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {interviewTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-green-600" />
                      <span>Time: {interviewTime}</span>
                    </div>
                  )}
                  {duration && (
                    <div>
                      <span>Duration: {duration} minutes</span>
                    </div>
                  )}
                  {interviewType && (
                    <div>
                      <span>Type: </span>
                      <Badge variant="secondary" className="ml-1 capitalize">
                        {interviewType.replace('-', ' ')}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                onClick={handleSchedule}
                disabled={!interviewDate || !interviewTime || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScheduler;