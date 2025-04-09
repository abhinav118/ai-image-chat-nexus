
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Image, Loader2 } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ChatInput: React.FC = () => {
  const [message, setMessage] = useState("");
  const { sendMessage, isProcessing } = useChat();
  const [isImageMode, setIsImageMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;
    
    const finalMessage = isImageMode ? `/image ${message}` : message;
    sendMessage(finalMessage);
    setMessage("");
  };

  const toggleImageMode = () => {
    setIsImageMode(!isImageMode);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <div className="relative flex-1">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={isImageMode ? "Describe the image you want..." : "Type a message..."}
          className={cn(
            "pr-10",
            isImageMode && "border-2 border-gradient-2-start"
          )}
          disabled={isProcessing}
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
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
      
      <Button 
        type="submit" 
        size="icon" 
        disabled={!message.trim() || isProcessing}
        className="bg-gradient-to-r from-gradient-1-start to-gradient-1-end text-white hover:opacity-90"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};

export default ChatInput;
