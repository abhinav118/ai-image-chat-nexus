
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { mockTemplates, templateCategories } from "@/data/mockCreatives";
import { BookOpen, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const Templates = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const filteredTemplates = activeCategory 
    ? mockTemplates.filter(template => template.category === activeCategory)
    : mockTemplates;
  
  const handleFavoriteClick = (title: string) => {
    toast({
      title: "Template added to favorites",
      description: title,
      duration: 2000,
    });
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-6 w-6 text-gradient-2-start" />
          <h1 className="text-2xl font-bold">Ad Templates</h1>
        </div>
        <p className="text-gray-400 mb-8">Get inspiration from these ad creative templates</p>
        
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm transition-colors",
              !activeCategory 
                ? "bg-gradient-to-r from-gradient-2-start to-gradient-2-end text-white" 
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            All
          </button>
          
          {templateCategories.map(category => (
            <button 
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm transition-colors",
                activeCategory === category
                  ? "bg-gradient-to-r from-gradient-2-start to-gradient-2-end text-white" 
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              )}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="bg-gray-900 border-gray-800 overflow-hidden">
              <div className="relative">
                <img 
                  src={template.imageUrl} 
                  alt={template.title}
                  className="w-full aspect-video object-cover"
                />
                <button
                  onClick={() => handleFavoriteClick(template.title)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <Star className="h-5 w-5 text-white" />
                </button>
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-gray-800 text-gray-300">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-medium mb-1">{template.title}</h3>
                <p className="text-sm text-gray-400">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Templates;
