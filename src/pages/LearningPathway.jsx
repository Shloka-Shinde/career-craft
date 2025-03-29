import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Layers, Download, Save, Book, BookOpen, CheckCircle2 } from 'lucide-react';
import PathwayChart from '@/components/PathwayChart';
import AIPromptInput from '@/components/AIPromptInput';
import { generateLearningPathway } from '@/services/pathwayService';

const LearningPathway = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [careerTopic, setCareerTopic] = useState('');
  const [pathwayData, setPathwayData] = useState(null);
  const { toast } = useToast();

  const generatePathway = async (prompt) => {
    try {
      setIsLoading(true);
      setCareerTopic(prompt);
      
      // Call the actual service that interfaces with Gemini API
      const data = await generateLearningPathway(prompt);
      setPathwayData(data);
      setIsLoading(false);
      
      toast({
        title: "Pathway Generated",
        description: `Your learning pathway for ${prompt} has been created.`,
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate learning pathway. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <GraduationCap className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Learning Pathway Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create a personalized learning path for your career journey
          </p>
        </header>

        <Card className="mb-8 shadow-lg border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Layers className="text-blue-600" />
                Generate Your Learning Pathway
              </CardTitle>
              <CardDescription className="text-base">
                Enter a career field or technology you want to learn about
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="pt-6 pb-6">
            <div className="bg-white rounded-lg p-4">
              <AIPromptInput
                onSubmit={generatePathway}
                isLoading={isLoading}
                placeholder="E.g., Cloud Computing, Data Science, Web Development, AI, Cybersecurity"
                buttonText="Generate Learning Pathway"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <SuggestionPill onClick={() => generatePathway("Cloud Computing")}>Cloud Computing</SuggestionPill>
              <SuggestionPill onClick={() => generatePathway("Data Science")}>Data Science</SuggestionPill>
              <SuggestionPill onClick={() => generatePathway("Web Development")}>Web Development</SuggestionPill>
              <SuggestionPill onClick={() => generatePathway("Cybersecurity")}>Cybersecurity</SuggestionPill>
              <SuggestionPill onClick={() => generatePathway("Artificial Intelligence")}>AI</SuggestionPill>
            </div>
          </CardContent>
        </Card>

        {pathwayData && (
          <Card className="shadow-lg border-blue-100 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <BookOpen className="text-blue-600" />
                      {pathwayData.topic} Learning Pathway
                    </CardTitle>
                    <CardDescription className="text-base">
                      Follow this roadmap to develop your skills
                    </CardDescription>
                  </div>
                  <div className="hidden md:flex space-x-2">
                    <Button variant="outline" className="gap-2">
                      <Download size={16} />
                      Download
                    </Button>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Save size={16} />
                      Save Pathway
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </div>
            <CardContent className="pt-6">
              <div className="bg-white rounded-lg p-2 md:p-4">
                <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-500" />
                  Scroll or pinch to zoom in/out and see details of each node
                </div>
                <div className="w-full overflow-x-auto rounded-lg border border-gray-100 bg-gray-50">
                  <div className="min-w-[800px] min-h-[600px]">
                    <PathwayChart data={pathwayData} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <InfoCard 
                  icon={<Book className="text-purple-600" />}
                  title="Learning Resources"
                  description="Explore curated content for each skill"
                />
                <InfoCard 
                  icon={<CheckCircle2 className="text-green-600" />}
                  title="Track Progress"
                  description="Mark skills as you learn them"
                />
              </div>
              <div className="flex w-full sm:w-auto md:hidden space-x-2">
                <Button variant="outline" className="gap-2 flex-1">
                  <Download size={16} />
                  Download
                </Button>
                <Button className="gap-2 flex-1 bg-blue-600 hover:bg-blue-700">
                  <Save size={16} />
                  Save
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

// Suggestion Pill Component
const SuggestionPill = ({ children, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
    >
      {children}
    </button>
  );
};

// Info Card Component
const InfoCard = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100">
      <div className="flex-shrink-0 p-2 bg-gray-50 rounded-md">
        {icon}
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default LearningPathway;