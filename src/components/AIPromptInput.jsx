import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AIPromptInput = ({
  onSubmit,
  isLoading,
  placeholder = "Enter your prompt...",
  buttonText = "Generate"
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || prompt.trim() === ''}>
        {isLoading ? "Generating..." : buttonText}
      </Button>
    </form>
  );
};

export default AIPromptInput;