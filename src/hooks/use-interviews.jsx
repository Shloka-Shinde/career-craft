import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useInterviews() {
  const { user, isRecruiter } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setInterviews([]);
      setIsLoading(false);
      return;
    }

    const fetchInterviews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const query = supabase
          .from('interviews')
          .select(`
            *,
            job:jobs(title, company)
          `);

        if (isRecruiter) {
          query.eq('recruiter_id', user.id);
        } else {
          query.eq('applicant_id', user.id);
        }

        const { data, error: fetchError } = await query.order('scheduled_at');

        if (fetchError) throw fetchError;
        setInterviews(data || []);
      } catch (err) {
        console.error('Error fetching interviews:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();

    const channel = supabase
      .channel('public:interviews')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interviews',
          filter: isRecruiter 
            ? `recruiter_id=eq.${user.id}` 
            : `applicant_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Interview change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setInterviews(prev => [...prev, payload.new].sort(
              (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
            ));
          } else if (payload.eventType === 'UPDATE') {
            setInterviews(prev => 
              prev.map(interview => 
                interview.id === payload.new.id ? payload.new : interview
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setInterviews(prev => 
              prev.filter(interview => interview.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isRecruiter]);

  const scheduleInterview = async (interviewData) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert(interviewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error scheduling interview:', err);
      throw err;
    }
  };

  const updateInterview = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating interview:', err);
      throw err;
    }
  };

  const cancelInterview = async (id) => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status: 'Cancelled' })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error cancelling interview:', err);
      throw err;
    }
  };

  return {
    interviews,
    isLoading,
    error,
    scheduleInterview,
    updateInterview,
    cancelInterview
  };
}
