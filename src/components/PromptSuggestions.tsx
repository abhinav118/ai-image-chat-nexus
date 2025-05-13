
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

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

// User type specific suggestions map for fallback
const USER_TYPE_SUGGESTIONS = {
  nailsalon: [
    "Close-up of elegant nail art with geometric patterns",
    "Relaxing nail salon interior with soft lighting and comfortable chairs",
    "Hand model showcasing vibrant nail colors against clean background",
    "Nail technician applying polish with precision",
    "Stylish pedicure setup with foot bath and aesthetic decor"
  ],
  barber: [
    "Classic barbershop interior with vintage chairs and exposed brick",
    "Barber giving precise haircut with professional scissors",
    "Fresh fade haircut photographed from multiple angles",
    "Client relaxing with hot towel facial treatment",
    "Barbershop tools neatly arranged on wooden counter"
  ],
  photographer: [
    "Photographer silhouette against dramatic sunset",
    "Wedding photographer capturing emotional moment",
    "Photography studio with professional lighting setup",
    "Minimalist product photography with clean shadows",
    "Nature photographer with telephoto lens in scenic landscape"
  ],
  boutique: [
    "Elegant boutique storefront with creative window display",
    "Stylish clothing rack with color-coordinated selection",
    "Customer browsing curated collection in modern boutique",
    "Minimal mannequin display with seasonal fashion",
    "Cozy boutique interior with designer lighting fixtures"
  ],
  fitness: [
    "Person performing perfect form squat in modern gym",
    "High-energy group fitness class in action",
    "Tranquil yoga studio with morning light",
    "Close-up of athlete preparing for workout",
    "Gym equipment arranged in clean, motivational space"
  ],
  cafe: [
    "Artisanal coffee being poured with perfect crema",
    "Cafe counter with freshly baked pastries and rustic decor",
    "Customer enjoying coffee while working on laptop",
    "Barista creating intricate latte art",
    "Cozy cafe corner with bookshelves and comfortable seating"
  ]
};

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectSuggestion }) => {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userType, setUserType] = useState("general");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  // Determine which suggestion pool to use based on user type
  const getDefaultSuggestions = () => {
    if (userType === "restaurant_owner" || userType === "restaurant") {
      return RESTAURANT_PROMPT_SUGGESTIONS;
    } else if (USER_TYPE_SUGGESTIONS[userType]) {
      return USER_TYPE_SUGGESTIONS[userType];
    } else {
      return GENERAL_PROMPT_SUGGESTIONS;
    }
  };
  
  const [suggestions, setSuggestions] = useState<string[]>(() => {
    // Select 3 random suggestions initially
    const defaultSuggestions = getDefaultSuggestions();
    return getRandomSuggestions(3, defaultSuggestions);
  });
  
  // Fetch user type from Supabase
  useEffect(() => {
    async function fetchUserType() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("ai_image_chat_users")
          .select("user_type")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        if (data?.user_type) {
          console.log("Fetched user type:", data.user_type);
          setUserType(data.user_type);
          // After setting user type, refresh suggestions
          refreshSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      }
    }
    
    fetchUserType();
  }, [user]);
  
  function getRandomSuggestions(count: number, pool: string[]) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const fetchAISuggestions = async () => {
    if (!user || isLoadingAI) return;
    
    setIsLoadingAI(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompts', {
        body: { userType }
      });
      
      if (error) throw error;
      
      console.log("Response from generate-prompts:", data);
      
      if (data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        console.log("AI-generated suggestions:", data.suggestions);
        setSuggestions(data.suggestions);
        setIsRefreshing(false);
        return;
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      toast({
        title: "Could not generate custom suggestions",
        description: "Falling back to default suggestions for your industry",
        variant: "destructive",
      });
      
      // Fallback to default suggestions
      const defaultSuggestions = getDefaultSuggestions();
      setSuggestions(getRandomSuggestions(3, defaultSuggestions));
    } finally {
      setIsLoadingAI(false);
      setIsRefreshing(false);
    }
  };

  const refreshSuggestions = (useAI: boolean = false) => {
    setIsRefreshing(true);
    
    // If we should use AI and user is authenticated
    if (useAI && user) {
      fetchAISuggestions();
    } else {
      // Simulate loading for a smoother UX
      setTimeout(() => {
        const defaultSuggestions = getDefaultSuggestions();
        setSuggestions(getRandomSuggestions(3, defaultSuggestions));
        setIsRefreshing(false);
      }, 300);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">
          {userType !== "general" ? `${userType.replace('_', ' ')} image ideas` : "Prompt suggestions"}
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0" 
          onClick={() => refreshSuggestions(true)}
          disabled={isRefreshing || isLoadingAI}
          title="Get AI-suggested prompts"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-muted-foreground ${isRefreshing || isLoadingAI ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-1.5">
        {(isRefreshing || isLoadingAI) ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Card 
              key={`loading-${index}`}
              className="p-1.5 text-xs bg-muted/30 animate-pulse h-10"
            />
          ))
        ) : (
          // Actual suggestions
          suggestions.map((suggestion, index) => (
            <Card 
              key={index}
              className="p-1.5 text-xs bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              {suggestion}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PromptSuggestions;
