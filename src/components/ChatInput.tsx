
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, Loader2, Paperclip, X } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFileAttachment } from "@/hooks/useFileAttachment";

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

  return (
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
      
      <div className="flex flex-col space-y-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isImageMode ? "Describe the ad creative you want..." : "Type a message..."}
          className={cn(
            isImageMode && "border-2 border-gradient-2-start"
          )}
          disabled={isProcessing}
        />
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                    >
                      <Paperclip className="h-4 w-4 mr-1" />
                      Attach
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
                    variant="outline"
                    onClick={toggleImageMode}
                    className={cn(
                      isImageMode && "border-gradient-2-start bg-gradient-2-start/10"
                    )}
                  >
                    <Image
                      className={cn(
                        "h-4 w-4 mr-1",
                        isImageMode && "text-gradient-2-start"
                      )}
                    />
                    {isImageMode ? "Image mode" : "Image"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isImageMode ? "Switch to text mode" : "Switch to image generation mode"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button 
            type="submit" 
            size="sm" 
            disabled={(!message.trim() && !selectedFile) || isProcessing}
            className="bg-gradient-to-r from-gradient-1-start to-gradient-1-end text-white hover:opacity-90"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Send
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
