import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setResumes([]);
      setIsLoading(false);
      return;
    }

    const fetchResumes = async () => {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('user_resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setResumes(data || []);
      } catch (err) {
        console.error('Error fetching user resumes:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResumes();
  }, [user]);

  const createResume = async (resume) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (resume.is_primary) {
        await supabase
          .from('user_resumes')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .eq('is_primary', true);
      } else if (resumes.length === 0) {
        resume.is_primary = true;
      }
      
      const { data, error } = await supabase
        .from('user_resumes')
        .insert({ ...resume, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      
      if (resume.is_primary) {
        setResumes(prev => prev.map(r => ({ ...r, is_primary: r.id === data.id })));
      } else {
        setResumes(prev => [...prev, data]);
      }
      
      return data;
    } catch (err) {
      console.error('Error creating resume:', err);
      throw err;
    }
  };

  const updateResume = async (id, updates) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (updates.is_primary) {
        await supabase
          .from('user_resumes')
          .update({ is_primary: false })
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .neq('id', id);
      }
      
      const { data, error } = await supabase
        .from('user_resumes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setResumes(prev => {
        return prev.map(r => {
          if (r.id === id) return data;
          if (updates.is_primary && r.is_primary) {
            return { ...r, is_primary: false };
          }
          return r;
        });
      });
      
      return data;
    } catch (err) {
      console.error('Error updating resume:', err);
      throw err;
    }
  };

  const deleteResume = async (id) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const resumeToDelete = resumes.find(r => r.id === id);
      const { error } = await supabase
        .from('user_resumes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      const updatedResumes = resumes.filter(r => r.id !== id);
      setResumes(updatedResumes);
      
      if (resumeToDelete?.is_primary && updatedResumes.length > 0) {
        const newPrimaryId = updatedResumes[0].id;
        await updateResume(newPrimaryId, { is_primary: true });
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      throw err;
    }
  };

  return {
    resumes,
    isLoading,
    error,
    createResume,
    updateResume,
    deleteResume,
  };
}
