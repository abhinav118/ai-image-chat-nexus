
import React, { useState } from "react";
import { Star, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreativeCardProps {
  id: string;
  imageUrl: string;
  title: string;
  prompt?: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

const CreativeCard = ({ 
  id, 
  imageUrl, 
  title, 
  prompt = "", 
  isFavorite = false,
  onFavoriteToggle
}: CreativeCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save favorites",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const newState = !favorite;
    
    try {
      if (newState) {
        // Check for existing favorite to prevent duplicates
        const { data: existingFavorites } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('image_id', id);
        
        // If favorite already exists, don't create a duplicate
        if (existingFavorites && existingFavorites.length > 0) {
          toast({
            title: "Already in favorites",
            description: "This creative is already in your favorites",
            duration: 2000,
          });
          setFavorite(true); // Update UI state to reflect it's favorited
          setIsLoading(false);
          return;
        }
        
        // Add to favorites in Supabase
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            title,
            prompt,
            image_id: id
          });
          
        if (error) {
          console.error("Error saving favorite:", error);
          toast({
            title: "Error",
            description: "Failed to save favorite",
            variant: "destructive",
          });
          return;
        }
      } else {
        // We'll let the parent handle removal if onFavoriteToggle is provided
        if (onFavoriteToggle) {
          onFavoriteToggle(id, false);
          return;
        }
        
        // Otherwise handle removal here
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', id);
          
        if (error) {
          console.error("Error removing favorite:", error);
          toast({
            title: "Error",
            description: "Failed to remove favorite",
            variant: "destructive",
          });
          return;
        }
      }
      
      setFavorite(newState);
      
      toast({
        title: newState ? "Added to favorites" : "Removed from favorites",
        description: title,
        duration: 2000,
      });
      
      if (onFavoriteToggle) {
        onFavoriteToggle(id, newState);
      }
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

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Copy the prompt to clipboard
    navigator.clipboard.writeText(prompt || title);
    
    toast({
      title: "Prompt copied to clipboard",
      description: prompt || title,
      duration: 2000,
    });
  };

  return (
    <Card className="group relative overflow-hidden rounded-lg bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200">
      <div className="aspect-square overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
      </div>
      
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={handleCopyClick}
          className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          title="Copy prompt"
        >
          <Copy className="h-5 w-5 text-white" />
        </button>
        
        <button
          onClick={handleFavoriteClick}
          className="p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
          title={favorite ? "Remove from favorites" : "Add to favorites"}
          disabled={isLoading}
        >
          <Star 
            className={cn(
              "h-5 w-5 transition-colors", 
              favorite ? "fill-yellow-400 text-yellow-400" : "text-white"
            )} 
          />
        </button>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <h3 className="text-sm font-medium text-white truncate">{title}</h3>
      </div>
    </Card>
  );
};

export default CreativeCard;
