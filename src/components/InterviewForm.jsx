import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Copy, Link, Video } from "lucide-react";
import { format } from "date-fns";
import { generateMeetLink, generateCalendarLink } from "@/utils/googleMeet";
import { useToast } from "@/hooks/use-toast";

const InterviewForm = ({ candidateName, candidateEmail, onSchedule }) => {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("10:30");
  const [notes, setNotes] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [calendarLink, setCalendarLink] = useState("");

  const handleGenerateMeetLink = () => {
    const newMeetLink = generateMeetLink();
    setMeetLink(newMeetLink);
    
    // Create calendar start and end times
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute);
    
    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute);
    
    // Generate calendar link
    const newCalendarLink = generateCalendarLink(
      newMeetLink,
      `Interview with ${candidateName}`,
      startDateTime,
      endDateTime,
      notes,
      candidateEmail ? [candidateEmail] : []
    );
    
    setCalendarLink(newCalendarLink);
    
    toast({
      title: "Meet link generated",
      description: "Google Meet link has been created for this interview",
    });
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied to clipboard",
      description: "Link has been copied to your clipboard",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!meetLink) {
      toast({
        title: "Error",
        description: "Please generate a Google Meet link first",
        variant: "destructive",
      });
      return;
    }
    
    // Parse times to create start and end dates
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    
    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute);
    
    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute);
    
    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }
    
    onSchedule({
      candidateName,
      candidateEmail,
      date,
      startTime,
      endTime,
      meetLink,
      calendarLink,
      notes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Interview Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Start Time</label>
          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End Time</label>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Interview Notes</label>
        <Textarea
          placeholder="Add any additional information or interview instructions..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGenerateMeetLink}
      >
        <Video size={16} />
        Generate Google Meet Link
      </Button>

      {meetLink && (
        <div className="p-3 border rounded-md bg-muted/30">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium flex items-center">
              <Video size={16} className="mr-2 text-green-600" />
              Google Meet Link
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleCopyLink(meetLink)}
              className="h-8 px-2"
            >
              <Copy size={14} />
            </Button>
          </div>
          <div className="text-sm break-all text-blue-600">{meetLink}</div>
          
          <div className="flex justify-between items-center mt-4 mb-2">
            <div className="text-sm font-medium flex items-center">
              <Link size={16} className="mr-2 text-blue-600" />
              Calendar Invite Link
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleCopyLink(calendarLink)}
              className="h-8 px-2"
            >
              <Copy size={14} />
            </Button>
          </div>
          <div className="text-sm break-all text-blue-600">
            <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Add to Google Calendar
            </a>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full">Schedule Interview</Button>
    </form>
  );
};

export default InterviewForm;