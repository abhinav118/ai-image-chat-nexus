
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
        <div className="flex items-center gap-2 p-2 bg-background/80 rounded-md border border-border/30">
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="text-sm truncate">{selectedFile.name}</span>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 hover:bg-background/90" 
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
            placeholder={isImageMode ? "Describe the ad creative you want..." : "Type a message..."}
            className={cn(
              "pr-20 bg-background/80 border-muted focus:border-[#9b87f5]/30 pl-4 py-6 h-auto",
              isImageMode && "border-l-4 border-l-[#9b87f5]"
            )}
            disabled={isProcessing}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-full hover:bg-background"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
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
                    className="h-8 w-8 p-0 rounded-full hover:bg-background"
                    onClick={toggleImageMode}
                  >
                    <Image
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isImageMode ? "text-[#9b87f5]" : "text-muted-foreground hover:text-foreground"
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
          className="bg-[#9b87f5]/90 hover:bg-[#9b87f5] text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 hover:translate-y-[-1px]"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
