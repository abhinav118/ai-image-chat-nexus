
import React from "react";
import { useChat } from "@/contexts/ChatContext";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings } from "lucide-react";

const ImageSettings: React.FC = () => {
  const { settings, setSettings } = useChat();

  const handleImageSizeChange = (value: string) => {
    setSettings(prev => ({ ...prev, imageSize: value }));
  };

  const handleStyleChange = (value: string) => {
    setSettings(prev => ({ ...prev, imageStyle: value }));
  };

  const handleQualityChange = (value: string) => {
    setSettings(prev => ({ ...prev, imageQuality: value }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Image Settings</h3>
          
          <div className="space-y-2">
            <Label>Image Size</Label>
            <Select value={settings.imageSize} onValueChange={handleImageSizeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1024x1024">1024x1024 (Default)</SelectItem>
                <SelectItem value="1024x1792">1024x1792 (Portrait)</SelectItem>
                <SelectItem value="1792x1024">1792x1024 (Landscape)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Image Style</Label>
            <Select value={settings.imageStyle} onValueChange={handleStyleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vivid">Vivid (Hyper-real & dramatic)</SelectItem>
                <SelectItem value="natural">Natural (Less hyper-real)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Image Quality</Label>
            <Select value={settings.imageQuality} onValueChange={handleQualityChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="hd">HD (Higher quality)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ImageSettings;
