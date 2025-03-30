import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, VideoOff, Play, Pause } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const BEHAVIORAL_QUESTIONS = [
  "Tell me about a time when you faced a significant challenge at work. How did you handle it?",
  "Describe a situation where you had to work with a difficult team member. How did you manage the relationship?",
  "Give an example of a time you had to make a difficult decision with limited information. What was your approach?",
  "Tell me about a time when you failed to meet a deadline. What happened and what did you learn?",
  "Describe a situation where you had to persuade someone to see things your way."
];

const VideoRecorder = ({ onVideoSubmitted }) => {
  const { toast } = useToast();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [countDown, setCountDown] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCameraAccess, setHasCameraAccess] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let stream;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 },
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            setRecordedChunks(prev => [...prev, event.data]);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          onVideoSubmitted(blob);
          setRecordedChunks([]);
        };

        setHasCameraAccess(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
        setHasCameraAccess(false);
        toast({
          title: "Camera Access Denied",
          description: "Please enable camera access to continue with the assessment",
          variant: "destructive"
        });
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (isRecording) return;

    setCountDown(3);
    
    const countInterval = setInterval(() => {
      setCountDown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countInterval);
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
            try {
              mediaRecorderRef.current.start(1000);
              setIsRecording(true);
              setIsPaused(false);
              setRecordingTime(0);
              
              timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
              }, 1000);
            } catch (error) {
              console.error("Recording start failed:", error);
              toast({
                title: "Recording Error",
                description: "Failed to start recording",
                variant: "destructive"
              });
            }
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    
    try {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setIsPaused(!isPaused);
    } catch (error) {
      console.error("Pause/resume error:", error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < BEHAVIORAL_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      stopRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setIsPaused(false);
        setCountDown(null);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } catch (error) {
        console.error("Stop recording error:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Question {currentQuestionIndex + 1} of {BEHAVIORAL_QUESTIONS.length}</span>
          {isRecording && (
            <span className="text-red-500 flex items-center gap-2">
              <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              REC {formatTime(recordingTime)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium text-lg text-gray-800 mb-2">Question:</h3>
          <p className="text-gray-700">
            {BEHAVIORAL_QUESTIONS[currentQuestionIndex]}
          </p>
        </div>
        
        {countDown !== null && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
            <div className="text-white text-8xl font-bold animate-pulse">
              {countDown}
            </div>
          </div>
        )}
        
        <div className="relative">
          {!hasCameraAccess ? (
            <div className="bg-gray-200 aspect-video rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <VideoOff className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Camera Access Required</h3>
                <p className="text-gray-600 mt-2 mb-4">
                  Please enable camera access in your browser settings to continue.
                </p>
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Retry Camera Access
                </Button>
              </div>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              muted={!isRecording} 
              className="w-full rounded-lg border shadow-sm"
            />
          )}
          
          {isRecording && isPaused && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xl font-medium">Recording Paused</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3 justify-between">
        <div>
          {!isRecording ? (
            <Button 
              onClick={startRecording}
              disabled={!hasCameraAccess || isRecording}
              className="gap-2"
            >
              <Video className="h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button 
                onClick={togglePause}
                variant="outline"
                className="gap-2 mr-2"
              >
                {isPaused ? (
                  <><Play className="h-4 w-4" /> Resume</>
                ) : (
                  <><Pause className="h-4 w-4" /> Pause</>
                )}
              </Button>
              <Button 
                onClick={stopRecording}
                variant="destructive"
                className="gap-2"
              >
                <VideoOff className="h-4 w-4" />
                Stop Recording
              </Button>
            </>
          )}
        </div>
        
        <Button
          onClick={handleNextQuestion}
          disabled={!isRecording}
        >
          {currentQuestionIndex < BEHAVIORAL_QUESTIONS.length - 1 ? (
            "Next Question"
          ) : (
            "Finish Assessment"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoRecorder;