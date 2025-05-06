
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface PromptSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
}

const PROMPT_SUGGESTIONS = [
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
  const [suggestions, setSuggestions] = useState(() => {
    // Select 3 random suggestions initially
    return getRandomSuggestions(3);
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  function getRandomSuggestions(count: number) {
    const shuffled = [...PROMPT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const refreshSuggestions = () => {
    setIsRefreshing(true);
    // Simulate loading for a smoother UX
    setTimeout(() => {
      setSuggestions(getRandomSuggestions(3));
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">Prompt suggestions</p>
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
      
      {suggestions.map((suggestion, index) => (
        <Card 
          key={index}
          className="p-2 text-xs bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={() => onSelectSuggestion(suggestion)}
        >
          {suggestion}
        </Card>
      ))}
    </div>
  );
};

export default PromptSuggestions;
