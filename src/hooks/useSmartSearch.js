import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useSmartSearch = () => {
  const [isExpanding, setIsExpanding] = useState(false);
  const { toast } = useToast();

  const expandSearchKeywords = async (searchTerm) => {
    if (!searchTerm) return [];

    try {
      setIsExpanding(true);
      const { data, error } = await supabase.functions.invoke('expand-keywords', {
        body: JSON.stringify({ searchTerm })
      });

      if (error) {
        throw error;
      }

      // Remove any duplicates and ensure we have a clean array of strings
      const keywords = data?.relatedKeywords || [];
      const cleanedKeywords = [...new Set(keywords.filter(k => typeof k === 'string' && k.trim().length > 0))];
      
      return cleanedKeywords;
    } catch (error) {
      console.error('Error expanding keywords:', error);
      toast({
        title: "Smart Search Error",
        description: "Failed to expand search keywords. Using direct search instead.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsExpanding(false);
    }
  };

  return { expandSearchKeywords, isExpanding };
};