import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInterviews } from '@/hooks/use-interviews';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay, isSameDay } from 'date-fns';

export function InterviewCalendar() {
  const { interviews, isLoading } = useInterviews();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const interviewsForDay = interviews.filter(interview => 
    isSameDay(new Date(interview.scheduled_at), selectedDate)
  );

  const interviewDates = interviews.map(interview => 
    startOfDay(new Date(interview.scheduled_at)).toISOString()
  );
  
  const uniqueInterviewDates = [...new Set(interviewDates)].map(date => new Date(date));

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'rescheduled': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[350px] w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Interview Calendar</CardTitle>
            <CardDescription>
              Select a date to view scheduled interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasInterview: uniqueInterviewDates,
              }}
              modifiersStyles={{
                hasInterview: {
                  fontWeight: 'bold',
                  border: '2px solid var(--primary)',
                }
              }}
            />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>
              Interviews for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
            <CardDescription>
              {interviewsForDay.length} 
              {interviewsForDay.length === 1 ? ' interview' : ' interviews'} scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {interviewsForDay.length > 0 ? (
              <div className="space-y-4">
                {interviewsForDay.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No interviews scheduled for this day
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InterviewCard({ interview }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'rescheduled': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{format(new Date(interview.scheduled_at), 'h:mm a')}</h3>
            <p className="font-bold">{interview.job?.title || 'Job Interview'}</p>
            <p className="text-sm text-muted-foreground">{interview.job?.company || 'Company'}</p>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(interview.status)} text-white`}
          >
            {interview.status}
          </Badge>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm">
            <p>{interview.location || 'Location not specified'}</p>
            <p>{interview.interview_type || 'Interview type not specified'}</p>
          </div>
          <Button size="sm" variant="outline">Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
