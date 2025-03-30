import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Eye, MessageCircle, Star } from "lucide-react";
import ScheduleInterviewDialog from "./ScheduleInterviewDialog";

const CandidateCard = ({ candidate }) => {
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);

  return (
    <div className="glass rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
        <div className="flex items-start lg:items-center mb-4 lg:mb-0">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src={candidate.avatar} alt={candidate.name} />
            <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-lg flex items-center">
              {candidate.name}
              <div className="ml-2 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(candidate.rating) ? "text-yellow-400 fill-yellow-400" : i < candidate.rating ? "text-yellow-400 fill-yellow-400 opacity-50" : "text-gray-300"}
                  />
                ))}
              </div>
            </h4>
            <p className="text-muted-foreground">{candidate.title}</p>
            <div className="flex items-center mt-1 text-sm">
              <Badge variant="outline" className="mr-2">
                {candidate.experience} exp
              </Badge>
              <span>{candidate.location}</span>
              {candidate.similarity && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  {candidate.similarity}% match
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={
            candidate.status === 'New' ? 'bg-blue-100 text-blue-800' : 
            candidate.status === 'Reviewed' ? 'bg-purple-100 text-purple-800' : 
            'bg-amber-100 text-amber-800'
          }>
            {candidate.status}
          </Badge>
          <div className="text-sm text-muted-foreground flex items-center">
            <Clock size={14} className="mr-1" />
            Applied {candidate.appliedDate}
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Skills</div>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(candidate.skills) ? candidate.skills : []).map((skill, index) => (
            <Badge key={index} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="font-medium mb-1">Applied For</div>
          <div className="text-muted-foreground">{candidate.appliedFor}</div>
        </div>
        
        <div>
          <div className="font-medium mb-1">Education</div>
          <div className="text-muted-foreground">{candidate.education}</div>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          <Eye size={14} className="inline mr-1" /> Resume viewed 2 days ago
        </div>
        
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <MessageCircle size={14} />
            <span>Message</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsInterviewDialogOpen(true)}
          >
            <Calendar size={14} />
            <span>Schedule Interview</span>
          </Button>
          <Button size="sm">View Profile</Button>
        </div>
      </div>

      <ScheduleInterviewDialog
        open={isInterviewDialogOpen}
        onOpenChange={setIsInterviewDialogOpen}
        candidate={{
          id: candidate.id,
          name: candidate.name,
          title: candidate.title,
          email: candidate.email
        }}
      />
    </div>
  );
};

export default CandidateCard;