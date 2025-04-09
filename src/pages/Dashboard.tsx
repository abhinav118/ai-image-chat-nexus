
import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import CreativeCard from "@/components/CreativeCard";
import { mockCreatives, CreativeItem } from "@/data/mockCreatives";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [creatives, setCreatives] = useState<CreativeItem[]>(mockCreatives);
  
  const filteredCreatives = creatives.filter(creative => 
    creative.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creative.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    creative.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleFavoriteToggle = (id: string, isFavorite: boolean) => {
    setCreatives(prev => 
      prev.map(creative => 
        creative.id === id ? { ...creative, isFavorite } : creative
      )
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Digital Ad Creatives</h1>
            <p className="text-gray-400">Browse and save inspiring ad designs</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search creatives..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredCreatives.map(creative => (
            <CreativeCard
              key={creative.id}
              id={creative.id}
              imageUrl={creative.imageUrl}
              title={creative.title}
              prompt={creative.prompt}
              isFavorite={creative.isFavorite}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
          
          {filteredCreatives.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <p className="text-gray-400 mb-2">No creatives found matching your search.</p>
              <p className="text-sm text-gray-500">Try adjusting your search terms or browse all creatives.</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
