
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import CreativeCard from "@/components/CreativeCard";
import { mockCreatives, CreativeItem } from "@/data/mockCreatives";
import { Star } from "lucide-react";

const Favorites = () => {
  const [favorites, setFavorites] = useState<CreativeItem[]>([]);
  
  useEffect(() => {
    // Get initial favorites from mock data
    setFavorites(mockCreatives.filter(creative => creative.isFavorite));
  }, []);
  
  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    if (!isFavorite) {
      setFavorites(prev => prev.filter(fav => fav.id !== id));
    }
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            <h1 className="text-2xl font-bold">Your Favorites</h1>
          </div>
          <p className="text-gray-400">Ad creatives you've saved for inspiration</p>
        </div>
        
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map(creative => (
              <CreativeCard
                key={creative.id}
                id={creative.id}
                imageUrl={creative.imageUrl}
                title={creative.title}
                isFavorite={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-gray-800 rounded-full mb-4">
              <Star className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
            <p className="text-gray-400 max-w-md">
              You haven't added any ad creatives to your favorites. Browse the dashboard
              and click the star icon to save creatives for later.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Favorites;
