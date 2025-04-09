
import React, { useState } from "react";
import { AIInputWithSearch } from "@/components/ui/ai-input-with-search";
import { useChat } from "@/contexts/ChatContext";
import { Loader2 } from "lucide-react";

const ChatInput: React.FC = () => {
  const { sendMessage, isProcessing } = useChat();
  const [isImageMode, setIsImageMode] = useState(false);

  const handleSubmit = (message: string, withSearch: boolean) => {
    if (!message.trim() || isProcessing) return;
    
    const finalMessage = isImageMode ? `/image ${message}` : message;
    sendMessage(finalMessage);
  };

  const handleFileSelect = (file: File) => {
    // Handle file attachment logic here
    console.log("File selected:", file);
    // Future implementation: upload file and attach to message
  };

  return (
    <div className="relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      
      <AIInputWithSearch
        placeholder={isImageMode ? "Describe the image you want..." : "Type a message..."}
        onSubmit={handleSubmit}
        onFileSelect={handleFileSelect}
        className="py-0"
      />
    </div>
  );
};

export default ChatInput;
