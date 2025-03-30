import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, RefreshCw } from 'lucide-react';

const AssessmentReport = ({ onRetake }) => {
  // Modified assessment data with very poor scores (5/100)
  const assessmentData = {
    overallScore: 5,
    confidence: 5,
    eyeContact: 5,
    facialExpressions: 5,
    speechClarity: 5,
    nervousBehaviors: 95, // High nervous behaviors (lower would be better)
    strengths: [
      "Showed some attempt at communication",
      "Appeared to be trying despite nervousness"
    ],
    improvements: [
      "Extreme nervousness was very apparent",
      "Minimal eye contact throughout",
      "Speech was unclear and hesitant",
      "Facial expressions were tense and unnatural",
      "Body language showed high anxiety"
    ],
    summary: "The candidate demonstrated extremely poor performance across all behavioral metrics. There was significant visible nervousness that severely impacted all aspects of communication. Immediate and substantial improvement is needed in all areas to reach even a basic level of professional behavioral competence."
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreDescription = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Satisfactory";
    if (score >= 50) return "Needs Improvement";
    return "Very Poor";
  };

  const handleDownloadReport = () => {
    const reportContent = `
    AI BEHAVIORAL ASSESSMENT REPORT
    ------------------------------
    
    OVERALL SCORE: ${assessmentData.overallScore}/100 (${getScoreDescription(assessmentData.overallScore)})
    
    DETAILED SCORES:
    - Confidence: ${assessmentData.confidence}/100
    - Eye Contact: ${assessmentData.eyeContact}/100
    - Facial Expressions: ${assessmentData.facialExpressions}/100
    - Speech Clarity: ${assessmentData.speechClarity}/100
    - Nervous Behaviors: ${assessmentData.nervousBehaviors}/100 (lower is better)
    
    STRENGTHS:
    ${assessmentData.strengths.map(s => `- ${s}`).join('\n')}
    
    AREAS FOR IMPROVEMENT:
    ${assessmentData.improvements.map(i => `- ${i}`).join('\n')}
    
    SUMMARY:
    ${assessmentData.summary}
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'behavioral-assessment-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-white">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Behavioral Assessment Report</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative h-36 w-36">
                <div className="absolute inset-0 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(assessmentData.overallScore)}`}>
                    {assessmentData.overallScore}
                  </span>
                </div>
                <svg className="absolute inset-0" width="144" height="144" viewBox="0 0 144 144">
                  <circle
                    cx="72"
                    cy="72"
                    r="68"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="68"
                    fill="none"
                    stroke="#ef4444" // Always red for very poor score
                    strokeWidth="8"
                    strokeDasharray={Math.PI * 136}
                    strokeDashoffset={Math.PI * 136 * (1 - assessmentData.overallScore / 100)}
                    strokeLinecap="round"
                    transform="rotate(-90 72 72)"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-center text-lg font-medium">
              Overall Score: <span className="text-red-600">
                Very Poor
              </span>
            </h3>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Detailed Scores</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Confidence</TableCell>
                  <TableCell>5/100</TableCell>
                  <TableCell className="text-red-600">Very Poor</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Eye Contact</TableCell>
                  <TableCell>5/100</TableCell>
                  <TableCell className="text-red-600">Very Poor</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Facial Expressions</TableCell>
                  <TableCell>5/100</TableCell>
                  <TableCell className="text-red-600">Very Poor</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Speech Clarity</TableCell>
                  <TableCell>5/100</TableCell>
                  <TableCell className="text-red-600">Very Poor</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Nervous Behaviors</TableCell>
                  <TableCell>95/100</TableCell>
                  <TableCell className="text-red-600">Very Poor</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-green-800 font-medium mb-2">Strengths</h3>
              <ul className="list-disc pl-5 space-y-1">
                {assessmentData.strengths.map((strength, index) => (
                  <li key={index} className="text-green-700">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="text-amber-800 font-medium mb-2">Areas for Improvement</h3>
              <ul className="list-disc pl-5 space-y-1">
                {assessmentData.improvements.map((improvement, index) => (
                  <li key={index} className="text-amber-700">{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium mb-2">Summary</h3>
            <p className="text-gray-700">{assessmentData.summary}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between flex-wrap gap-4">
          <Button
            onClick={onRetake}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retake Assessment
          </Button>
          
          <Button
            onClick={handleDownloadReport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssessmentReport;