import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ToolPanel: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState("custom");
  const { sendMessage } = useChat();
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    await sendMessage(`/image ${prompt}`);
    setIsLoading(false);
    setPrompt("");
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
      // Handle the file - in a real application, this would process the file
      console.log("File dropped:", e.dataTransfer.files[0]);
      // You could add code here to read the file and use its content
    }
  };

  const applyTemplate = (template: string) => {
    setPromptTemplate(template);
    
    switch(template) {
      case "product":
        setPrompt("Create a professional product showcase for [product name] featuring [key features] with a clean white background and studio lighting.");
        break;
      case "social":
        setPrompt("Design a vibrant Instagram post for [brand name] highlighting [product/service] with [style] aesthetic that will appeal to [target audience].");
        break;
      case "banner":
        setPrompt("Create a website banner for [company name] featuring [main subject] with [color scheme] colors, optimized for web viewing.");
        break;
      default:
        // Keep the current prompt for "custom"
        break;
    }
  };

  return (
    <div className="w-80 border-l border-border h-screen overflow-y-auto">
      <Card className="border-0 rounded-none h-full">
        <CardHeader>
          <CardTitle>Prompt Assistant</CardTitle>
          <CardDescription>Create stunning ad creatives with AI</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Step 1: Choose a template</h3>
              <Select value={promptTemplate} onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Prompt</SelectItem>
                  <SelectItem value="product">Product Showcase</SelectItem>
                  <SelectItem value="social">Social Media Post</SelectItem>
                  <SelectItem value="banner">Website Banner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Step 2: Describe your creative idea</h3>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the ad creative you want to generate..."
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Step 3: Or upload a reference file</h3>
              <div 
                className={cn(
                  "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Drag and drop files here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported file types: .txt, .docx, .png, .jpg
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Ad Creative"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ToolPanel;
