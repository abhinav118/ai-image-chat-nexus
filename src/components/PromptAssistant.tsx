
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, UploadCloud, RefreshCw, Pencil, ImagePlus } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import PromptSuggestions from "./PromptSuggestions";
import UploadPreview from "./UploadPreview";
import { openAIService } from "@/lib/openai-service";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const PromptAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useChat();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useEditMode, setUseEditMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && !selectedFile) return;
    
    setIsLoading(true);
    
    if (useEditMode && selectedFile) {
      try {
        // Use image edit API
        const imageUrl = await openAIService.editImage({
          image: selectedFile,
          prompt: prompt.trim(),
          size: "1024x1024",
        });
        
        if (imageUrl) {
          // Create message with edited image
          await sendMessage(`/image ${prompt} (edited from reference)`, null, imageUrl);
        } else {
          await sendMessage(`Failed to edit image with prompt: ${prompt}`, null);
        }
      } catch (error) {
        console.error("Error in image editing:", error);
        await sendMessage(`Error editing image: ${error.message}`, null);
      }
    } else {
      // Use regular image generation or chat
      await sendMessage(`/image ${prompt}`, selectedFile);
    }
    
    setIsLoading(false);
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
    setPrompt(prev => {
      if (prev.trim()) {
        return `${prev}, ${suggestion}`;
      }
      return suggestion;
    });
  };

  return (
    <div className="h-full bg-white/5 backdrop-blur-sm p-6 flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Prompt Assistant</h2>
        <p className="text-sm text-muted-foreground">Create stunning ad creatives</p>
      </div>
      
      <div className="space-y-5 flex-1">
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="bg-primary/10 text-primary rounded-full h-5 w-5 inline-flex items-center justify-center mr-2 text-xs">1</span>
            <Pencil className="h-4 w-4 mr-1 text-muted-foreground" /> Enter a Prompt
          </h3>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to generate..."
            className="min-h-[100px] bg-background/50 resize-none border-muted"
          />
          
          <div className="mt-3">
            <PromptSuggestions onSelectSuggestion={handleSuggestionSelect} />
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Upload className="h-4 w-4 mr-1 text-muted-foreground" /> Upload a reference file
          </h3>
          <div 
            className={cn(
              "border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors duration-200",
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
                <div className="bg-primary/10 p-3 rounded-full mb-3">
                  <UploadCloud className="h-6 w-6 text-primary/70" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Drag and drop files here
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Supports images, .txt, .md, .docx
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
          
          {selectedFile && selectedFile.type.startsWith('image/') && (
            <div className="mt-3 bg-muted/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ImagePlus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Image Edit Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="edit-mode" 
                  checked={useEditMode}
                  onCheckedChange={setUseEditMode}
                />
                <Label htmlFor="edit-mode" className="text-xs text-muted-foreground">
                  Use OpenAI Image Edit API to modify this image with prompt
                </Label>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <span className="bg-primary/10 text-primary rounded-full h-5 w-5 inline-flex items-center justify-center mr-2 text-xs">2</span>
            Generate Image
          </h3>
        </div>
      </div>
      
      <div className="pt-4 mt-auto">
        <Button 
          className="w-full bg-[#9b87f5]/90 hover:bg-[#9b87f5] text-white transition-all duration-300 hover:translate-y-[-1px] shadow-sm"
          onClick={handleSubmit}
          disabled={(!prompt.trim() && !selectedFile) || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {useEditMode ? "Editing Image..." : "Generating..."}
            </>
          ) : (
            <>{useEditMode ? "Edit Image" : "Run"}</>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PromptAssistant;
