
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, Loader2, Paperclip, X } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFileAttachment } from "@/hooks/useFileAttachment";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";

const PROMPT_SUGGESTIONS = [
  "Generate an image of a mountain landscape",
  "Explain how machine learning works",
  "Write a short story about time travel",
  "Help me debug my React code",
  "What are the best practices for API design?"
];

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, isProcessing } = useChat();
  const [isImageMode, setIsImageMode] = useState(false);
  const { selectedFile, fileDataUrl, handleFileSelect, clearFile } = useFileAttachment();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || isProcessing) return;
    
    const finalMessage = isImageMode ? `/image ${message}` : message;
    sendMessage(finalMessage, selectedFile);
    setMessage("");
    clearFile();
  };

  const toggleImageMode = () => {
    setIsImageMode(!isImageMode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handlePromptSelect = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PROMPT_SUGGESTIONS.map((prompt, index) => (
          <PromptSuggestion 
            key={index} 
            onClick={() => handlePromptSelect(prompt)}
            size="sm"
          >
            {prompt}
          </PromptSuggestion>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {selectedFile && (
          <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
            <div className="flex-1 flex items-center gap-2 overflow-hidden">
              <Paperclip className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate">{selectedFile.name}</span>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isImageMode ? "Describe the image you want..." : "Type a message..."}
              className={cn(
                "pr-20",
                isImageMode && "border-2 border-gradient-2-start"
              )}
              disabled={isProcessing}
            />
            
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                      />
                    </label>
                  </TooltipTrigger>
                  <TooltipContent>
                    Attach a file
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={toggleImageMode}
                    >
                      <Image
                        className={cn(
                          "h-4 w-4",
                          isImageMode && "text-gradient-2-start"
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isImageMode ? "Switch to text mode" : "Switch to image generation mode"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={(!message.trim() && !selectedFile) || isProcessing}
            className="bg-gradient-to-r from-gradient-1-start to-gradient-1-end text-white hover:opacity-90"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
