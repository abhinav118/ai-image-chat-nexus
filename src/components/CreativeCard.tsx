
import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface CreativeCardProps {
  id: string;
  imageUrl: string;
  title: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
}

const CreativeCard = ({ 
  id, 
  imageUrl, 
  title, 
  isFavorite = false,
  onFavoriteToggle
}: CreativeCardProps) => {
  const [favorite, setFavorite] = useState(isFavorite);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !favorite;
    setFavorite(newState);
    
    if (onFavoriteToggle) {
      onFavoriteToggle(id, newState);
    }
    
    toast({
      title: newState ? "Added to favorites" : "Removed from favorites",
      description: title,
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
        />
      </div>
      
      <button
        onClick={handleFavoriteClick}
        className="absolute top-2 right-2 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
      >
        <Star 
          className={cn(
            "h-5 w-5 transition-colors", 
            favorite ? "fill-yellow-400 text-yellow-400" : "text-white"
          )} 
        />
      </button>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <h3 className="text-sm font-medium text-white truncate">{title}</h3>
      </div>
    </Card>
  );
};

export default CreativeCard;
