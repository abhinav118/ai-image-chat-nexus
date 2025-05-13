import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, UploadCloud, RefreshCw, Pencil, ImagePlus, UtensilsCrossed } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import PromptSuggestions from "./PromptSuggestions";
import UploadPreview from "./UploadPreview";
import { openAIService } from "@/lib/openai-service";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PromptAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useChat();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useEditMode, setUseEditMode] = useState(false);
  const { user } = useAuth();
  const isRestaurantOwner = user?.user_metadata?.user_type === "restaurant_owner";
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !selectedFile) return;
    
    setIsLoading(true);
    
    try {
      if (selectedFile && selectedFile.type.startsWith('image/')) {
        const finalPrompt = prompt.trim();
        
        if (useEditMode) {
          // Use the image edit API when in edit mode with a reference image
          const imageUrl = await openAIService.editImage({
            image: selectedFile,
            prompt: finalPrompt,
            size: "1024x1024",
          });
          
          if (imageUrl) {
            // Create message with generated image
            await sendMessage(`/image ${finalPrompt} (edited with reference image)`, null, imageUrl);
          } else {
            toast({
              title: "Generation Failed",
              description: "Failed to generate image based on your prompt and reference image.",
              variant: "destructive"
            });
            await sendMessage(`Failed to generate image with prompt: ${finalPrompt}`, null);
          }
        } else {
          // Standard image generation but still pass the reference file
          await sendMessage(`/image ${finalPrompt}`, selectedFile);
        }
      } else {
        // Regular image generation or chat without reference image
        await sendMessage(`/image ${prompt}`, selectedFile);
      }
    } catch (error) {
      console.error("Error in image processing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // If it's an image, suggest edit mode
      setUseEditMode(true);
    } else {
      setFilePreview(null);
      setUseEditMode(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUseEditMode(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Prompt Assistant</h2>
            <p className="text-sm text-muted-foreground">
              {isRestaurantOwner 
                ? "Create stunning restaurant & food imagery" 
                : "Create stunning ad creatives"}
            </p>
          </div>
          {isRestaurantOwner && (
            <div className="bg-yellow-500/20 p-1.5 rounded-full">
              <UtensilsCrossed className="h-4 w-4 text-yellow-400" />
            </div>
          )}
        </div>
      </div>
      
      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Prompt Input Section */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Pencil className="h-4 w-4 mr-1 text-muted-foreground" />
            <label className="text-sm font-medium">Enter a Prompt</label>
          </div>
          
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={isRestaurantOwner 
              ? "Describe the food or restaurant scene you want to generate..." 
              : "Describe what you want to generate..."}
            className="min-h-[80px] bg-background/50 resize-none border-muted"
          />
          
          {/* Prompt Suggestions */}
          <div className="mt-3">
            <PromptSuggestions onSelectSuggestion={handleSuggestionSelect} />
          </div>
        </div>
        
        {/* Upload Reference Section */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Upload className="h-4 w-4 mr-1 text-muted-foreground" /> 
            <label className="text-sm font-medium">Upload a reference file</label>
          </div>
          
          <div 
            className={cn(
              "border border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center transition-colors duration-200",
              dragActive ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 bg-background/50 hover:bg-background/70"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <UploadPreview 
                file={selectedFile} 
                previewUrl={filePreview} 
                onRemove={clearFile} 
                onApplyText={(text) => setPrompt(prev => prev ? `${prev} ${text}` : text)}
              />
            ) : (
              <>
                <div className="bg-primary/10 p-2 rounded-full mb-2">
                  <UploadCloud className="h-5 w-5 text-primary/70" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Drop files here
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  Images, .txt, .md, .docx
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  Choose file
                </Button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,.txt,.md,.docx"
                />
              </>
            )}
          </div>
          
          {/* Image Edit Mode Toggle */}
          {selectedFile && selectedFile.type.startsWith('image/') && (
            <div className="mt-3 bg-muted/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ImagePlus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Reference Image Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-mode" 
                  checked={useEditMode}
                  onCheckedChange={setUseEditMode}
                />
                <Label htmlFor="edit-mode" className="text-xs text-muted-foreground">
                  Use this image as a reference
                </Label>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Button Area */}
      <div className="p-4 border-t border-border/30 bg-background/50 backdrop-blur-sm">
        <Button 
          className={cn(
            "w-full text-white shadow-sm h-10",
            isRestaurantOwner 
              ? "bg-yellow-600/90 hover:bg-yellow-600" 
              : "bg-[#9b87f5]/90 hover:bg-[#9b87f5]"
          )}
          onClick={handleSubmit}
          disabled={(!prompt.trim() && !selectedFile) || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {useEditMode ? "Generating from Reference..." : "Generating..."}
            </>
          ) : (
            <>{useEditMode ? "Generate from Reference" : "Generate"}</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PromptAssistant;
