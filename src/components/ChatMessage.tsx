
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
        "flex w-full mb-5",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-xl shadow-sm",
          isUser
            ? "bg-gradient-to-r from-[#9b87f5]/90 to-[#8B5CF6]/90 text-white border border-[#9b87f5]/20"
            : "bg-background/80 border border-border/30 text-foreground"
        )}
      >
        <div className="p-4">
          {message.isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating response...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {message.attachment && (
                <div className="mt-3 p-2 bg-black/5 dark:bg-white/5 rounded-md cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    onClick={() => handleFileClick(message.attachment!.dataUrl, message.attachment!.name)}>
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm">{message.attachment.name}</span>
                  </div>
                </div>
              )}
              
              {message.image && (
                <div className="mt-3 relative">
                  <img
                    src={message.image.url}
                    alt={message.image.prompt}
                    className="rounded-lg w-full object-contain max-h-[300px]"
                    onLoad={() => {
                      // Auto-scroll when image loads
                      const messagesContainer = document.querySelector('.overflow-y-auto');
                      if (messagesContainer) {
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                      }
                    }}
                  />
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-xs opacity-80">
                      {message.image.size} • {message.image.style} style
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 h-8 bg-background/50"
                        onClick={handleFavoriteClick}
                      >
                        <Star className={cn(
                          "h-3 w-3", 
                          isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                        )} />
                        <span className="text-xs">{isFavorite ? "Favorited" : "Favorite"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1 h-8 bg-background/50"
                        onClick={() => downloadImage(message.image!)}
                      >
                        <Download className="h-3 w-3" />
                        <span className="text-xs">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-xs text-right px-4 py-2 border-t border-border/20 text-muted-foreground">
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
