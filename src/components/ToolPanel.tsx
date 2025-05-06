
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ToolPanel: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary rounded-full h-6 w-6 inline-flex items-center justify-center mr-2">1</span>
                Enter a Prompt
              </h3>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to generate..."
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Or upload a reference file</h3>
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
                  Drop a file or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .txt, .md, .docx
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <span className="bg-primary/10 text-primary rounded-full h-6 w-6 inline-flex items-center justify-center mr-2">2</span>
                Generate Image
              </h3>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90" 
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <span className="mr-2">Run</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ToolPanel;
