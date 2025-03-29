import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.3.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Given the job search term "${searchTerm}", generate a list of 5-10 closely related job titles and keywords that could be used to expand a job search. Return the result as a JSON array of strings.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const relatedKeywords = JSON.parse(response.text());

    return new Response(JSON.stringify({ relatedKeywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in keyword expansion function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});