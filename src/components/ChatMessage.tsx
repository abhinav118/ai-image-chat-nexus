
import React from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { downloadImage } = useChat();
  const isUser = message.role === "user";
  
  return (
    <motion.div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4",
          isUser
            ? "bg-gradient-to-r from-gradient-2-start to-gradient-2-end text-white"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating response...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.image && (
              <div className="mt-2 relative">
                <img
                  src={message.image.url}
                  alt={message.image.prompt}
                  className="rounded-md w-full object-contain max-h-[300px]"
                />
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs opacity-80">
                    {message.image.size} • {message.image.style} style
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => downloadImage(message.image!)}
                  >
                    <Download className="h-3 w-3" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs opacity-60 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
