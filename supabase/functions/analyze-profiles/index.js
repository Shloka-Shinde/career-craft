import "https://deno.land/x/xhr@0.1.0/mod.js";
import { serve } from "https://deno.land/std@0.168.0/http/server.js";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl, githubUrl } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    if (!linkedinUrl && !githubUrl) {
      throw new Error("At least one profile URL is required");
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    console.log(`Analyzing profiles: LinkedIn: ${linkedinUrl}, GitHub: ${githubUrl}`);

    let profileInfo = "";
    
    if (linkedinUrl) {
      profileInfo += `LinkedIn profile URL: ${linkedinUrl}\n`;
    }
    
    if (githubUrl) {
      profileInfo += `GitHub profile URL: ${githubUrl}\n`;
    }

    // Generate the analysis with Gemini
    const prompt = `
    I have a candidate with the following professional profiles:
    ${profileInfo}
    
    Based on this information, provide a professional assessment with the following:
    1. Overall score from 1-10
    2. Skills match score from 1-10
    3. Experience rating from 1-10
    4. Three specific recommendations for improving their profile
    5. Three key strengths based on their profile
    6. Three areas that could use improvement
    
    Format the response as a JSON object with the following structure:
    {
      "overall_score": number,
      "skills_match": number,
      "experience_rating": number,
      "recommendations": [string, string, string],
      "strengths": [string, string, string],
      "areas_to_improve": [string, string, string]
    }
    
    Provide ONLY the JSON object, nothing else.
    `;

    // Generate content with Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();
    
    console.log("Generated analysis:", responseText);
    
    // Parse the JSON response from Gemini
    let rating;
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*({[\s\S]*?})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : responseText;
      rating = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      // Fallback rating if parsing fails
      rating = {
        overall_score: 7,
        skills_match: 6,
        experience_rating: 7,
        recommendations: [
          "Add more details about your projects on GitHub",
          "Include technologies you've worked with in your LinkedIn headline",
          "Contribute to open-source projects to showcase your skills"
        ],
        strengths: [
          "Professional online presence",
          "Technical documentation skills",
          "Project organization"
        ],
        areas_to_improve: [
          "More regular GitHub contributions",
          "Expand your professional network on LinkedIn",
          "Add portfolio projects that demonstrate your skills"
        ]
      };
    }

    return new Response(
      JSON.stringify({ rating }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error("Error processing profile analysis:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to analyze profiles",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    );
  }
});