
import React, { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader2, Download, Paperclip, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";
import { toast } from "@/components/ui/use-toast";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { downloadImage } = useChat();
  const isUser = message.role === "user";
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleFileClick = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleFavoriteClick = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    
    if (message.image) {
      const favoriteImage = {
        id: `fav-${Date.now()}`,
        imageUrl: message.image.url,
        title: message.image.prompt,
        prompt: message.image.prompt,
        tags: ["ai-generated", "chat"],
        category: "AI Generated",
        isFavorite: true
      };
      
      // Get existing favorites from localStorage
      const existingFavoritesString = localStorage.getItem('favoriteCreatives');
      const existingFavorites = existingFavoritesString ? JSON.parse(existingFavoritesString) : [];
      
      if (newState) {
        // Add to favorites
        localStorage.setItem('favoriteCreatives', JSON.stringify([...existingFavorites, favoriteImage]));
        toast({
          title: "Added to favorites",
          description: message.image.prompt,
          duration: 2000,
        });
      } else {
        // Remove from favorites if it exists
        const updatedFavorites = existingFavorites.filter((fav: any) => 
          fav.imageUrl !== message.image?.url
        );
        localStorage.setItem('favoriteCreatives', JSON.stringify(updatedFavorites));
        toast({
          title: "Removed from favorites",
          description: message.image?.prompt,
          duration: 2000,
        });
      }
    }
  };
  
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
            
            {message.attachment && (
              <div className="mt-2 p-2 bg-black/10 dark:bg-white/10 rounded-md cursor-pointer hover:bg-black/15 dark:hover:bg-white/15 transition-colors"
                   onClick={() => handleFileClick(message.attachment!.dataUrl, message.attachment!.name)}>
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  <span className="text-sm">{message.attachment.name}</span>
                </div>
              </div>
            )}
            
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
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-1"
                      onClick={handleFavoriteClick}
                    >
                      <Star className={cn(
                        "h-3 w-3", 
                        isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                      )} />
                      <span>{isFavorite ? "Favorited" : "Favorite"}</span>
                    </Button>
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
