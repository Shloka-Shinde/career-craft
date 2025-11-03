import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building, X, Clock, DollarSign, Users, Briefcase, Star, Share2, Bookmark, BookmarkPlus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const JobPlacard = ({ job, isOpen, onClose, onApplied }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkAlreadyApplied = async () => {
      if (user && job && job.id) {
        const { data, error } = await supabase
          .from('applications')
          .select('id')
          .eq('applicant_id', user.id)
          .eq('job_id', job.id)
          .maybeSingle();
        if (data) setAlreadyApplied(true);
      }
    };
    checkAlreadyApplied();

    const checkBookmarked = async () => {
      if (user && job && job.id) {
        const { data } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('user_id', user.id)
          .eq('job_id', job.id)
          .maybeSingle();
        if (data) setIsBookmarked(true);
      }
    };
    checkBookmarked();
  }, [user, job]);

  if (!isOpen || !job) return null;

  const getTypeColor = (type) => {
    switch (type) {
      case "Full-time":
        return "bg-emerald-500 text-white";
      case "Part-time":
        return "bg-blue-500 text-white";
      case "Contract":
        return "bg-purple-500 text-white";
      case "Remote":
        return "bg-indigo-500 text-white";
      case "Internship":
        return "bg-amber-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleApply = async () => {
    if (!user) {
      alert('You must be logged in to apply for a job.');
      return;
    }
    setIsApplying(true);
    try {
      console.log('Applying for job:', job.id, 'as user:', user.id);
      const { data, error, status, statusText } = await supabase
        .from('applications')
        .insert([
          {
            applicant_id: user.id,
            job_id: job.id,
            status: 'Pending',
          },
        ])
        .select();
      console.log('Supabase response:', { data, error, status, statusText });
      if (error) {
        console.error('Supabase error:', error);
        alert('Failed to apply: ' + (error.message || JSON.stringify(error)) + ` (status: ${status}, statusText: ${statusText})`);
        return;
      }
      alert('Application submitted successfully!');
      
      // Also remove from saved jobs if it exists there
      const { error: deleteError } = await supabase
        .from('saved_jobs')
        .delete()
        .match({ user_id: user.id, job_id: job.id });

      if (deleteError) {
        // Non-critical error, so we just log it and don't block the user
        console.error('Could not remove from saved jobs:', deleteError.message);
      }

      if (onApplied) onApplied();
      if (onClose) onClose();
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('Failed to apply: ' + (error.message || JSON.stringify(error)));
    } finally {
      setIsApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert('You must be logged in to save a job.');
      return;
    }

    setIsSaving(true);
    
    if (!isBookmarked) {
      // Save job to saved_jobs table
      try {
        const { data, error } = await supabase
          .from('saved_jobs')
          .insert([
            {
              user_id: user.id,
              job_id: job.id,
            },
          ])
          .select();

        if (error) {
          console.error('Failed to save job:', error);
          alert('Failed to save job: ' + error.message);
          return;
        }
        
        console.log('Job saved successfully:', data);
        setIsBookmarked(true);
        alert('Job saved successfully!');
      } catch (error) {
        console.error('Unexpected error while saving:', error);
        alert('Failed to save job: ' + error.message);
      }
    } else {
      // Remove job from saved_jobs table
      try {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', job.id);

        if (error) {
          console.error('Failed to unsave job:', error);
          alert('Failed to unsave job: ' + error.message);
          return;
        }
        
        console.log('Job removed from saved jobs');
        setIsBookmarked(false);
        alert('Job removed from saved jobs!');
      } catch (error) {
        console.error('Unexpected error while unsaving:', error);
        alert('Failed to unsave job: ' + error.message);
      }
    }
    
    setIsSaving(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        text: job.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Job link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <p className="text-blue-100">{job.company}</p>
                </div>
                {job.isNew && (
                  <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-300">
                    ✨ New
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>Posted {job.postedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={16} />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white hover:bg-white/20"
              >
                <Share2 size={16} />
              </Button>
              {!alreadyApplied && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={isSaving}
                  className={`hover:bg-white/20 ${isBookmarked ? 'text-yellow-400' : 'text-white'}`}
                >
                  <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Job Type</p>
                  <p className="text-green-800 font-semibold">{job.type}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Salary</p>
                  <p className="text-blue-800 font-semibold">
                    {job.salary && job.salary !== 'Salary not specified' && job.salary !== ''
                      ? (typeof job.salary === 'number' || !isNaN(Number(job.salary)) ? `₹${job.salary}` : job.salary)
                      : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Experience</p>
                  <p className="text-purple-800 font-semibold">{job.experience || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Job Description</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About {job.company}</h3>
            <p className="text-gray-700 mb-4">
              {job.companyDescription || 'No company description provided.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            {alreadyApplied ? (
              <Button
                className="flex-1 bg-red-50 text-red-400 border-2 border-red-100 font-semibold py-3 rounded-xl cursor-not-allowed text-xl"
                disabled
              >
                Already Applied
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </Button>
                <Button
                  onClick={handleBookmark}
                  disabled={isSaving}
                  variant="outline"
                  className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all duration-300 ${
                    isBookmarked 
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100' 
                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isBookmarked ? 'Unsaving...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Bookmark 
                        size={20} 
                        className="mr-2" 
                        fill={isBookmarked ? 'currentColor' : 'none'} 
                      />
                      {isBookmarked ? 'Saved' : 'Save Job'}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPlacard;