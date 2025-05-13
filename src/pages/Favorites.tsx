
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import CreativeCard from "@/components/CreativeCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FavoriteItem {
  id: string;
  image_url: string;
  title: string | null;
  prompt: string | null;
  image_id: string | null;
  created_at: string | null;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch favorites from Supabase for the current signed-in user only
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching favorites:", error);
          toast({
            title: "Error fetching favorites",
            description: error.message,
            variant: "destructive",
          });
          setFavorites([]);
        } else {
          console.log("Fetched favorites:", data);
          setFavorites(data || []);
        }
      } catch (error) {
        console.error("Error in favorites fetch:", error);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, toast]);
  
  const handleFavoriteToggle = async (id: string, isFavorite: boolean) => {
    if (!isFavorite) {
      try {
        // Remove from Supabase
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error("Error removing favorite:", error);
          toast({
            title: "Error removing favorite",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        // Update local state
        setFavorites(prev => prev.filter(fav => fav.id !== id));
        
        toast({
          title: "Removed from favorites",
          description: "The creative has been removed from your favorites.",
        });
      } catch (error) {
        console.error("Error in remove favorite:", error);
      }
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
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-medium mb-2">Loading your favorites...</h3>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {favorites.map(favorite => (
              <CreativeCard
                key={favorite.id}
                id={favorite.id}
                imageUrl={favorite.image_url}
                title={favorite.title || "Untitled Creative"}
                prompt={favorite.prompt || ""}
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
