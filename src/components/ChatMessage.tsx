
import React, { useState, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Loader2, Download, Paperclip, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useChat } from "@/contexts/ChatContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { downloadImage } = useChat();
  const { user } = useAuth();
  const { toast } = useToast();
  const isUser = message.role === "user";
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if this image is in favorites on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (message.image && user) {
        try {
          const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('image_url', message.image.url)
            .single();
          
          setIsFavorite(!!data);
        } catch (error) {
          console.error("Error checking favorite status:", error);
          setIsFavorite(false);
        }
      }
    };

    checkFavoriteStatus();
  }, [message.image, user]);
  
  const handleFileClick = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleFavoriteClick = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }
    
    if (!message.image) return;
    
    setIsLoading(true);
    const newState = !isFavorite;
    
    try {
      if (newState) {
        // Check for existing favorite to prevent duplicates
        const { data: existingFavorites } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('image_url', message.image.url);
        
        // If favorite already exists, don't create a duplicate
        if (existingFavorites && existingFavorites.length > 0) {
          toast({
            title: "Already in favorites",
            description: "This creative is already in your favorites",
            duration: 2000,
          });
          setIsFavorite(true); // Update UI state to reflect it's favorited
          setIsLoading(false);
          return;
        }
        
        // Add to favorites in Supabase
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            image_url: message.image.url,
            title: message.image.prompt,
            prompt: message.image.prompt,
            image_id: `chat-${Date.now()}`
          });
          
        if (error) {
          console.error("Error saving favorite:", error);
          toast({
            title: "Error",
            description: "Failed to save favorite",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Added to favorites",
          description: message.image.prompt,
          duration: 2000,
        });
      } else {
        // Remove from favorites in Supabase
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('image_url', message.image.url);
          
        if (error) {
          console.error("Error removing favorite:", error);
          toast({
            title: "Error",
            description: "Failed to remove favorite",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        toast({
          title: "Removed from favorites",
          description: message.image.prompt,
          duration: 2000,
        });
      }
      
      setIsFavorite(newState);
    } catch (error) {
      console.error("Favorite operation failed:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating favorites",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    
    // Scroll to the bottom when image loads
    const messagesContainer = document.querySelector('.overflow-y-auto');
    if (messagesContainer) {
      setTimeout(() => {
        const messagesEnd = document.querySelector('[data-messages-end="true"]');
        messagesEnd?.scrollIntoView({ behavior: "smooth" });
      }, 100);
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
                  {!imageLoaded && (
                    <div className="w-full h-[200px] bg-muted/30 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  <img
                    src={message.image.url}
                    alt={message.image.prompt}
                    className={cn(
                      "rounded-lg w-full object-contain max-h-[300px]",
                      !imageLoaded && "hidden"
                    )}
                    onLoad={handleImageLoad}
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
                        disabled={isLoading}
                      >
                        <Star className={cn(
                          "h-3 w-3", 
                          isFavorite ? "fill-yellow-400 text-yellow-400" : ""
                        )} />
                        <span className="text-xs">{isLoading ? "..." : isFavorite ? "Favorited" : "Favorite"}</span>
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
