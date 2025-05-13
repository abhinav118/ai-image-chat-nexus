
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PromptSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
}

// Restaurant-specific prompt suggestions for food, ambiance, or promotional images
const RESTAURANT_PROMPT_SUGGESTIONS = [
  "Freshly plated gourmet pasta with steam rising, top view",
  "Happy couple dining outdoors at a cozy candlelit restaurant",
  "Chef in uniform plating a vibrant dish under warm kitchen lights",
  "Interior shot of a rustic restaurant with wooden tables and warm lighting",
  "Crispy tacos on a colorful Mexican-themed background",
  "Refreshing summer drinks with ice on a tropical-themed bar counter",
  "Juicy grilled burger with melted cheese and golden fries",
  "Family enjoying brunch at a bright, sunny café patio",
  "Minimalist flat lay of sushi rolls and soy sauce on black slate",
  "Barista preparing latte art in a cozy coffee shop",
  "Close-up of a chef's hands garnishing an elegant dessert",
  "Outdoor patio dining area with string lights at dusk",
  "Signature cocktail with fresh herbs and custom garnish",
  "Wood-fired pizza with bubbling cheese coming out of oven",
  "Elegant table setting for a fine dining experience"
];

// General prompt suggestions as fallback
const GENERAL_PROMPT_SUGGESTIONS = [
  "Professional team discussing strategy in modern office",
  "Close-up of a smiling chef in a modern kitchen",
  "Elegant luxury product on minimalist background",
  "Happy family enjoying vacation at the beach",
  "Tech device with futuristic UI on desk",
  "Business person presenting chart in conference room",
  "Athletic person in dynamic motion on colored background",
  "Cozy cafe interior with warm lighting",
  "Eco-friendly product with natural elements",
  "Person using smartphone with app interface visible",
  "Urban street scene with vintage aesthetic",
  "Product being used in real-world scenario",
  "Close-up of hands crafting artisanal product",
  "Drone view of scenic landscape with vibrant colors",
  "Fashion model in striking pose against bold backdrop"
];

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectSuggestion }) => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Determine if we should use restaurant-specific prompts
  const isRestaurantOwner = user?.user_metadata?.user_type === "restaurant_owner";
  
  const promptPool = isRestaurantOwner ? RESTAURANT_PROMPT_SUGGESTIONS : GENERAL_PROMPT_SUGGESTIONS;
  
  const [suggestions, setSuggestions] = useState(() => {
    // Select 3 random suggestions initially
    return getRandomSuggestions(3, promptPool);
  });
  
  function getRandomSuggestions(count: number, pool: string[]) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const refreshSuggestions = () => {
    setIsRefreshing(true);
    // Simulate loading for a smoother UX
    setTimeout(() => {
      setSuggestions(getRandomSuggestions(3, promptPool));
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">
          {isRestaurantOwner ? "Restaurant image ideas" : "Prompt suggestions"}
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0" 
          onClick={refreshSuggestions}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-1.5">
        {suggestions.map((suggestion, index) => (
          <Card 
            key={index}
            className="p-1.5 text-xs bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PromptSuggestions;
